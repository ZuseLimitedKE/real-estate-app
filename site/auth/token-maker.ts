//I've decided to make this stateless for now so refresh tokens aren't being stored in the db
import { SignJWT, jwtVerify, JWTVerifyResult } from "jose";
import { cookies } from "next/headers";

export interface TokenPayload {
  email: string;
  userId: string;
  role: string;
  tokenType: "access" | "refresh";
  exp?: number; // JWT standard
  iat?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

class TokenMaker {
  private readonly accessTokenSecret: Uint8Array;
  private readonly refreshTokenSecret: Uint8Array;
  private readonly accessTokenExpiry: number; // in seconds
  private readonly refreshTokenExpiry: number; // in seconds
  private readonly issuer: string;

  constructor() {
    this.accessTokenSecret = new TextEncoder().encode(
      process.env.JWT_ACCESS_SECRET!,
    );
    this.refreshTokenSecret = new TextEncoder().encode(
      process.env.JWT_REFRESH_SECRET!,
    );
    this.accessTokenExpiry =
      parseInt(process.env.JWT_ACCESS_EXPIRY || "", 10) || 60 * 15; // 15 min
    this.refreshTokenExpiry =
      parseInt(process.env.JWT_REFRESH_EXPIRY || "", 10) || 60 * 60 * 24 * 7; // 7 days
    this.issuer = process.env.JWT_ISSUER || "Atria";

    if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error("JWT secrets are not configured properly");
    }
  }

  /**
   * Generate both access and refresh tokens
   */
  async generateTokenPair(
    payload: Omit<TokenPayload, "tokenType">,
  ): Promise<TokenPair> {
    const accessToken = await this.createToken(
      payload,
      "access",
      this.accessTokenSecret,
      this.accessTokenExpiry,
    );
    const refreshToken = await this.createToken(
      payload,
      "refresh",
      this.refreshTokenSecret,
      this.refreshTokenExpiry,
    );

    return { accessToken, refreshToken };
  }

  /**
   * Create a token with jose
   */
  private async createToken(
    payload: Omit<TokenPayload, "tokenType">,
    tokenType: "access" | "refresh",
    secret: Uint8Array,
    expiresIn: number,
  ): Promise<string> {
    return await new SignJWT({ ...payload, tokenType })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer(this.issuer)
      .setIssuedAt()
      .setExpirationTime(`${expiresIn}s`)
      .sign(secret);
  }

  /**
   * Verify a token
   */
  private async verifyToken(
    token: string,
    secret: Uint8Array,
    expectedType: "access" | "refresh",
  ): Promise<TokenPayload | null> {
    try {
      const { payload }: JWTVerifyResult = await jwtVerify(token, secret, {
        algorithms: ["HS256"],
        issuer: this.issuer,
      });

      if (payload.tokenType !== expectedType) {
        throw new Error("Invalid token type");
      }

      return payload as unknown as TokenPayload;
    } catch (err) {
      console.warn(`${expectedType} token verification failed:`, err);
      return null;
    }
  }

  async verifyAccessToken(token?: string): Promise<TokenPayload | null> {
    const t = token || (await this.getAccessToken());
    return t ? this.verifyToken(t, this.accessTokenSecret, "access") : null;
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload | null> {
    return this.verifyToken(token, this.refreshTokenSecret, "refresh");
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenPair | null> {
    const payload = await this.verifyRefreshToken(refreshToken);
    if (!payload) return null;

    return this.generateTokenPair({
      email: payload.email,
      userId: payload.userId,
      role: payload.role,
    });
  }

  /**
   * Set tokens as HTTP-only cookies
   */
  async setTokenCookies(tokenPair: TokenPair): Promise<void> {
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === "production";

    cookieStore.set("accessToken", tokenPair.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: this.accessTokenExpiry,
    });

    cookieStore.set("refreshToken", tokenPair.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: this.refreshTokenExpiry,
    });
  }

  async getAccessToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get("accessToken")?.value;
  }

  async getRefreshToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get("refreshToken")?.value;
  }

  async clearTokens(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
  }

  async getCurrentUser(): Promise<TokenPayload | null> {
    return await this.verifyAccessToken();
  }

  async isAuthenticated(): Promise<boolean> {
    return (await this.getCurrentUser()) !== null;
  }

  async attemptTokenRefresh(): Promise<boolean> {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) return false;

    const newTokenPair = await this.refreshAccessToken(refreshToken);
    if (!newTokenPair) return false;

    await this.setTokenCookies(newTokenPair);
    return true;
  }
}

export const tokenMaker = new TokenMaker();
