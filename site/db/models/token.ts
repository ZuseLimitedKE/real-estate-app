import { Collection, ObjectId } from "mongodb";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import client from "../connection";

const scryptAsync = promisify(scrypt);

export interface VerificationToken {
  _id?: ObjectId;
  email: string;
  token: string; // Stores salted hash (except refresh tokens)
  type:
  | "EMAIL_VERIFICATION"
  | "PASSWORD_RESET"
  | "TWO_FACTOR"
  | "REFRESH_TOKEN";
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
  REFRESH_TOKEN: 7 * 24 * 60 * 60 * 1000, // 7d default
} as const;

export class TokenModel {
  private static collection: Collection<VerificationToken> | null = null;

  private static async getCollection(): Promise<Collection<VerificationToken>> {
    if (!this.collection) {
      const db = client.db();
      this.collection = db.collection<VerificationToken>("tokens");

      await this.collection.createIndexes([
        { key: { token: 1 } },
        { key: { email: 1 } },
        { key: { type: 1 } },
        { key: { email: 1, type: 1 } },
        {
          key: { expires: 1 },
          expireAfterSeconds: 0, // auto cleanup
        },
      ]);
    }
    return this.collection;
  }

  /**
   * Create a token
   * - For verification tokens → return plaintext token and store salted hash
   * - For refresh tokens → store raw JWT string (since JWT already self-validates)
   */
  static async createToken(
    email: string,
    type: TokenType,
    customExpiry?: number,
    tokenValue?: string, // for refresh tokens  pass JWT
    metadata?: { ipAddress?: string; userAgent?: string },
  ): Promise<string> {
    const collection = await this.getCollection();
    const normalizedEmail = email.toLowerCase().trim();

    const expiresIn = customExpiry || TOKEN_LIFETIMES[type];
    const expires = new Date(Date.now() + expiresIn);

    let tokenToReturn: string;
    let tokenToStore: string;

    if (type === "REFRESH_TOKEN" && tokenValue) {
      // Store JWT raw (can revoke via DB)
      tokenToReturn = tokenValue;
      tokenToStore = tokenValue;
    } else {
      // Generate secure random string
      tokenToReturn = randomBytes(32).toString("base64url");
      const salt = randomBytes(16);
      const hash = (await scryptAsync(tokenToReturn, salt, 32)) as Buffer;
      tokenToStore = salt.toString("hex") + ":" + hash.toString("hex");
    }

    const tokenDoc: VerificationToken = {
      email: normalizedEmail,
      token: tokenToStore,
      type,
      expires,
      createdAt: new Date(),
      used: false,
      ...metadata,
    };

    await collection.insertOne(tokenDoc);
    return tokenToReturn;
  }

  /**
   * Verify a token
   * - Refresh tokens: look up exact match
   * - Others: salted hash comparison
   */
  static async verifyToken(
    token: string,
    type: TokenType,
  ): Promise<string | null> {
    const collection = await this.getCollection();

    if (type === "REFRESH_TOKEN") {
      const doc = await collection.findOne({
        type,
        token,
        used: false,
        expires: { $gt: new Date() },
      });
      return doc ? doc.email : null;
    }

    const candidates = await collection
      .find({
        type,
        used: false,
        expires: { $gt: new Date() },
      })
      .toArray();

    for (const tokenDoc of candidates) {
      const [saltHex, hashHex] = tokenDoc.token.split(":");
      if (!saltHex || !hashHex) continue;

      const salt = Buffer.from(saltHex, "hex");
      const storedHash = Buffer.from(hashHex, "hex");
      const hash = (await scryptAsync(token, salt, 32)) as Buffer;

      if (timingSafeEqual(storedHash, hash)) {
        await collection.updateOne(
          { _id: tokenDoc._id, used: false },
          { $set: { used: true, usedAt: new Date() } },
        );
        return tokenDoc.email;
      }
    }

    return null;
  }

  /**
   * Revoke (invalidate) a refresh token
   */
  static async revokeToken(token: string, type: TokenType): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { token, type, used: false },
      { $set: { used: true, usedAt: new Date() } },
    );
  }

  /**
   * Revoke all refresh tokens for a user
   */
  static async revokeAllUserTokens(
    email: string,
    type: TokenType,
  ): Promise<void> {
    const collection = await this.getCollection();
    const normalizedEmail = email.toLowerCase().trim();

    await collection.updateMany(
      { email: normalizedEmail, type, used: false },
      { $set: { used: true, usedAt: new Date() } },
    );
  }
}
