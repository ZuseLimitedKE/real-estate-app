import jwt, {
  SignOptions,
  Secret,
  TokenExpiredError,
  JsonWebTokenError,
  NotBeforeError,
} from "jsonwebtoken";
import { cookies } from "next/headers";
import { TokenModel } from "@/db/models/token";

export interface TokenPayload {
  email: string;
  userId: string;
  role: string;
  tokenType: "access" | "refresh";
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

class TokenMaker {
  private readonly accessTokenSecret: Secret;
  private readonly refreshTokenSecret: Secret;
  private readonly accessTokenExpiry: number;
  private readonly refreshTokenExpiry: number;
  private readonly issuer: string;

  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET!;
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET!;
    this.accessTokenExpiry =
      parseInt(process.env.JWT_ACCESS_EXPIRY || "", 10) || 60 * 15; // 15 minutes
    this.refreshTokenExpiry =
      parseInt(process.env.JWT_REFRESH_EXPIRY || "", 10) || 60 * 60 * 24 * 7; // 7 days
    this.issuer = process.env.JWT_ISSUER || "Atria";

    if (!this.accessTokenSecret || !this.refreshTokenSecret) {
      throw new Error("JWT secrets are not configured properly");
    }
  }

  /**
   * Generate both access and refresh tokens
   */
  async generateTokenPair(
    payload: Omit<TokenPayload, "tokenType">,
  ): Promise<TokenPair> {
    const accessToken = this.createAccessToken(payload);
    const refreshToken = await this.createRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Create access token (short-lived)
   */
  private createAccessToken(payload: Omit<TokenPayload, "tokenType">): string {
    const options: SignOptions = {
      algorithm: "HS256",
      expiresIn: this.accessTokenExpiry,
      issuer: this.issuer,
    };

    return jwt.sign(
      {
        ...payload,
        tokenType: "access",
      },
      this.accessTokenSecret,
      options,
    );
  }

  /**
   * Create refresh token (long-lived) and store in database
   */
  private async createRefreshToken(
    payload: Omit<TokenPayload, "tokenType">,
  ): Promise<string> {
    const refreshToken = jwt.sign(
      {
        ...payload,
        tokenType: "refresh",
      },
      this.refreshTokenSecret,
      {
        algorithm: "HS256",
        expiresIn: this.refreshTokenExpiry,
        issuer: this.issuer,
      },
    );

    // Store refresh token in database for revocation capability
    await TokenModel.createToken(
      payload.email,
      "REFRESH_TOKEN",
      this.refreshTokenExpiry,
      refreshToken,
    );

    return refreshToken;
  }

  /**
   * Verify access token
   */
  async verifyAccessToken(token?: string): Promise<TokenPayload | null> {
    try {
      const accessToken = token || (await this.getAccessToken());
      if (!accessToken) return null;

      const decoded = jwt.verify(accessToken, this.accessTokenSecret, {
        algorithms: ["HS256"],
        issuer: this.issuer,
      }) as TokenPayload;
      if (decoded.tokenType !== "access") {
        throw new Error("Invalid token type");
      }

      return decoded;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        console.warn("Access token expired");
      } else if (error instanceof JsonWebTokenError) {
        console.warn("Invalid access token");
      } else if (error instanceof NotBeforeError) {
        console.warn("Access token not active yet");
      } else {
        console.error("Access token verification failed:", error);
      }
      await this.clearTokens();
      return null;
    }
  }

  /**
   * Verify refresh token
   */
  async verifyRefreshToken(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(
        token,
        this.refreshTokenSecret,
      ) as TokenPayload;

      if (decoded.tokenType !== "refresh") {
        throw new Error("Invalid token type");
      }

      // Check if refresh token exists in database and is not revoked
      const storedToken = await TokenModel.verifyToken(token, "REFRESH_TOKEN");
      if (!storedToken) {
        throw new Error("Refresh token not found or revoked");
      }

      return decoded;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        console.warn("Refresh token expired");
      } else if (error instanceof JsonWebTokenError) {
        console.warn("Invalid refresh token");
      } else if (error instanceof NotBeforeError) {
        console.warn("Refresh token not active yet");
      } else {
        console.error("Refresh token verification failed:", error);
      }

      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenPair | null> {
    try {
      const payload = await this.verifyRefreshToken(refreshToken);
      if (!payload) return null;

      // Generate new token pair
      const newTokenPair = await this.generateTokenPair({
        email: payload.email,
        userId: payload.userId,
        role: payload.role,
      });

      // Revoke old refresh token
      await this.revokeRefreshToken(refreshToken);

      return newTokenPair;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return null;
    }
  }

  /**
   * Set tokens as HTTP-only cookies
   */
  async setTokenCookies(tokenPair: TokenPair): Promise<void> {
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === "production";

    // Set access token cookie (short expiry)
    cookieStore.set("accessToken", tokenPair.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: this.accessTokenExpiry,
    });

    // Set refresh token cookie (long expiry)
    cookieStore.set("refreshToken", tokenPair.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: this.refreshTokenExpiry,
    });
  }

  /**
   * Get access token from cookies
   */
  async getAccessToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get("accessToken")?.value;
  }

  /**
   * Get refresh token from cookies
   */
  async getRefreshToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get("refreshToken")?.value;
  }

  /**
   * Clear all token cookies
   */
  async clearTokens(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
  }

  /**
   * Revoke refresh token (mark as invalid in database)
   */
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      // Delete the refresh token from database
      await TokenModel.revokeToken(refreshToken, "REFRESH_TOKEN");
    } catch (error) {
      console.error("Failed to revoke refresh token:", error);
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllRefreshTokens(email: string): Promise<void> {
    try {
      await TokenModel.revokeAllUserTokens(email, "REFRESH_TOKEN");
    } catch (error) {
      console.error("Failed to revoke all refresh tokens:", error);
    }
  }

  /**
   * Get current user from access token
   */
  async getCurrentUser(): Promise<TokenPayload | null> {
    return await this.verifyAccessToken();
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  /**
   * Attempt to refresh tokens automatically
   */
  async attemptTokenRefresh(): Promise<boolean> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) return false;

      const newTokenPair = await this.refreshAccessToken(refreshToken);
      if (!newTokenPair) return false;

      await this.setTokenCookies(newTokenPair);
      return true;
    } catch (error) {
      console.error("Auto token refresh failed:", error);
      return false;
    }
  }
}

export const tokenMaker = new TokenMaker();
