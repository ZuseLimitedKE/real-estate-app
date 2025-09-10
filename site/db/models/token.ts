import { Collection, ObjectId, ClientSession } from "mongodb";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import client from "../connection";

const scryptAsync = promisify(scrypt);

export interface VerificationToken {
  _id?: ObjectId;
  email: string;
  token: string; // Stores salted hash
  type: "EMAIL_VERIFICATION" | "PASSWORD_RESET" | "TWO_FACTOR";
  expires: Date;
  createdAt: Date;
  used: boolean;
  usedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
}

type TokenType = VerificationToken["type"];

// Token lifetimes
const TOKEN_LIFETIMES = {
  EMAIL_VERIFICATION:
    process.env.NODE_ENV === "production" ? 3600000 : 86400000, // 1h prod, 24h dev
  PASSWORD_RESET: 900000, // 15m
  TWO_FACTOR: 300000, // 5m
} as const;

// Rate limiting config
const RATE_LIMIT = {
  maxTokens: 3,
  timeWindow: 300000, // 5m
} as const;

export class TokenModel {
  private static collection: Collection<VerificationToken> | null = null;

  private static async getCollection(): Promise<Collection<VerificationToken>> {
    if (!this.collection) {
      const db = client.db();
      this.collection = db.collection<VerificationToken>("tokens");

      // Create indexes once — safe to run multiple times
      await this.collection.createIndexes([
        { key: { token: 1 }, unique: true },
        { key: { email: 1 } },
        { key: { type: 1 } },
        { key: { email: 1, type: 1 } },
        {
          key: { expires: 1 },
          expireAfterSeconds: 0, // TTL cleanup
        },
      ]);
    }
    return this.collection;
  }

  /**
   * Create a token (with atomic rate limiting)
   */
  static async createToken(
    email: string,
    type: TokenType,
    customExpiry?: number,
    metadata?: { ipAddress?: string; userAgent?: string },
  ): Promise<string> {
    const collection = await this.getCollection();
    const normalizedEmail = email.toLowerCase().trim();
    const session: ClientSession = client.startSession();

    try {
      let token: string | null = null;

      await session.withTransaction(async () => {
        // Count tokens in window
        const recentCount = await collection.countDocuments(
          {
            email: normalizedEmail,
            type,
            createdAt: { $gt: new Date(Date.now() - RATE_LIMIT.timeWindow) },
          },
          { session },
        );

        if (recentCount >= RATE_LIMIT.maxTokens) {
          throw new Error(
            "Too many token requests. Please wait before trying again.",
          );
        }

        // Delete old unused tokens
        await collection.deleteMany(
          { email: normalizedEmail, type, used: false },
          { session },
        );

        // Generate secure token
        token = randomBytes(32).toString("base64url");
        const salt = randomBytes(16);
        const hash = (await scryptAsync(token, salt, 32)) as Buffer;
        const tokenHash = salt.toString("hex") + ":" + hash.toString("hex");

        const expiresIn = customExpiry || TOKEN_LIFETIMES[type];
        const expires = new Date(Date.now() + expiresIn);

        const tokenDoc: VerificationToken = {
          email: normalizedEmail,
          token: tokenHash,
          type,
          expires,
          createdAt: new Date(),
          used: false,
          ...metadata,
        };

        await collection.insertOne(tokenDoc, { session });
      });

      if (!token) throw new Error("Token creation failed");
      return token;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Verify and consume a token
   */
  static async verifyToken(
    token: string,
    type: TokenType,
    metadata?: { ipAddress?: string; userAgent?: string },
  ): Promise<string | null> {
    const collection = await this.getCollection();

    const candidateTokens = await collection
      .find({
        type,
        used: false,
        expires: { $gt: new Date() },
      })
      .toArray();

    for (const tokenDoc of candidateTokens) {
      try {
        const [saltHex, hashHex] = tokenDoc.token.split(":");
        if (!saltHex || !hashHex) continue;

        const salt = Buffer.from(saltHex, "hex");
        const storedHash = Buffer.from(hashHex, "hex");
        const hash = (await scryptAsync(token, salt, 32)) as Buffer;

        if (timingSafeEqual(storedHash, hash)) {
          const updateResult = await collection.updateOne(
            { _id: tokenDoc._id, used: false },
            {
              $set: {
                used: true,
                usedAt: new Date(),
                ...(metadata && {
                  ipAddress: metadata.ipAddress,
                  userAgent: metadata.userAgent,
                }),
              },
            },
          );

          if (updateResult.modifiedCount === 1) {
            return tokenDoc.email;
          }
        }
      } catch {
        continue;
      }
    }

    return null;
  }

  /**
   * Invalidate unused tokens for a user
   */
  static async invalidateUserTokens(
    email: string,
    type?: TokenType,
  ): Promise<number> {
    const collection = await this.getCollection();
    const normalizedEmail = email.toLowerCase().trim();

    const filter: any = { email: normalizedEmail, used: false };
    if (type) filter.type = type;

    const result = await collection.updateMany(filter, {
      $set: { used: true, usedAt: new Date() },
    });

    return result.modifiedCount;
  }

  /**
   * Cleanup expired or stale tokens
   */
  static async cleanupTokens(): Promise<number> {
    const collection = await this.getCollection();

    const result = await collection.deleteMany({
      $or: [
        { expires: { $lt: new Date() } },
        { used: true, usedAt: { $lt: new Date(Date.now() - 86400000) } }, // 24h
      ],
    });

    return result.deletedCount;
  }

  /**
   * Check if user has valid token
   */
  static async hasValidToken(email: string, type: TokenType): Promise<boolean> {
    const collection = await this.getCollection();
    const normalizedEmail = email.toLowerCase().trim();

    const count = await collection.countDocuments({
      email: normalizedEmail,
      type,
      used: false,
      expires: { $gt: new Date() },
    });

    return count > 0;
  }

  /**
   * Token statistics
   */
  static async getTokenStats(): Promise<{
    total: number;
    byType: Record<TokenType, number>;
    expired: number;
    used: number;
  }> {
    try {
      const collection = await this.getCollection();

      const [total, byTypeAgg, expired, used] = await Promise.all([
        collection.countDocuments(),
        collection
          .aggregate<{
            _id: TokenType;
            count: number;
          }>([{ $group: { _id: "$type", count: { $sum: 1 } } }])
          .toArray(),
        collection.countDocuments({ expires: { $lt: new Date() } }),
        collection.countDocuments({ used: true }),
      ]);

      // Start with all types = 0
      const allTypes: TokenType[] = [
        "EMAIL_VERIFICATION",
        "PASSWORD_RESET",
        "TWO_FACTOR",
      ];

      const typeStats = allTypes.reduce(
        (acc, t) => ({ ...acc, [t]: 0 }),
        {} as Record<TokenType, number>,
      );

      // Fill counts from aggregation
      for (const { _id, count } of byTypeAgg) {
        typeStats[_id] = count;
      }

      return { total, byType: typeStats, expired, used };
    } catch {
      return {
        total: 0,
        byType: {
          EMAIL_VERIFICATION: 0,
          PASSWORD_RESET: 0,
          TWO_FACTOR: 0,
        },
        expired: 0,
        used: 0,
      };
    }
  }
}
