import { NextRequest } from "next/server";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { UnauthorizedError } from "./errors";
import crypto from "crypto";
import { JWTTokenService } from "../services/jwt-token.service";
import { SessionService } from "../services/session.service";

import { JWTService } from "../services/jwt.service";

interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export class AuthUtils {
  static async generateToken(userId: string, email: string): Promise<string> {
    return await JWTService.generateAccessToken({ userId, email });
  }

  static async verifyToken(token: string): Promise<TokenPayload | null> {
    try {
      const payload = await JWTService.verifyAccessToken(token);
      return {
        userId: payload.userId,
        email: payload.email,
        iat: (payload.iat ?? 0) * 1000,
        exp: (payload.exp ?? 0) * 1000,
      };
    } catch {
      return null;
    }
  }

  static extractToken(request: NextRequest): string | null {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return null;
    }

    if (authHeader.startsWith("Bearer ")) {
      return authHeader.slice(7);
    }

    return null;
  }

  static async authenticateRequest(request: NextRequest): Promise<{
    userId: string;
    email: string;
    user: typeof users.$inferSelect;
  }> {
    const authHeaderToken = this.extractToken(request);
    const cookieToken = request.cookies.get("access_token")?.value;
    
    // Defensive check: sometimes request.cookies is not fully populated in some environments
    let fallbackCookieToken = null;
    if (!cookieToken) {
      const cookieHeader = request.headers.get("cookie");
      fallbackCookieToken = cookieHeader?.match(/access_token=([^;]+)/)?.[1];
    }

    const token = authHeaderToken ?? cookieToken ?? fallbackCookieToken;

    if (!token) {
      throw new UnauthorizedError("Authentication required");
    }

    try {
      const payload = await this.verifyToken(token);
      if (!payload) {
        throw new UnauthorizedError("Invalid or expired token");
      }

      const [user] = await db.select().from(users).where(eq(users.id, payload.userId));
      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      if (user.status === "suspended") {
        throw new UnauthorizedError("Account is suspended");
      }

      return {
        userId: payload.userId,
        email: payload.email,
        user,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      console.error("[AuthUtils.authenticateRequest Error]", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        token: token ? `${token.substring(0, 10)}...` : "none"
      });
      throw error;
    }
  }

  static async authenticateRequestOrRefreshCookie(request: NextRequest): Promise<{
    userId: string;
    email: string;
    user: typeof users.$inferSelect;
  }> {
    const bearerToken = this.extractToken(request);

    if (bearerToken) {
      return this.authenticateRequest(request);
    }

    const refreshToken = request.cookies.get("refreshToken")?.value;
    if (!refreshToken) {
      throw new UnauthorizedError("Authentication required");
    }

    const payload = await JWTService.verifyRefreshToken(refreshToken);
    const userId =
      payload && typeof payload.userId === "string" ? payload.userId : null;
    const email = payload && typeof payload.email === "string" ? payload.email : null;

    if (!userId || !email) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    const session = await SessionService.validateSession(refreshToken, userId);
    if (!session) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (user.status === "suspended") {
      throw new UnauthorizedError("Account is suspended");
    }

    return {
      userId,
      email,
      user,
    };
  }

  static getClientIp(request: NextRequest): string | undefined {

    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }

    const realIp = request.headers.get("x-real-ip");
    if (realIp) {
      return realIp;
    }

    return undefined;
  }

  static getUserAgent(request: NextRequest): string | undefined {
    return request.headers.get("user-agent") || undefined;
  }

  static async getCurrentUser() {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return null;
    }

    const payload = await this.verifyToken(token);
    if (!payload) {
      return null;
    }

    const [user] = await db.select().from(users).where(eq(users.id, payload.userId));
    return user || null;
  }
}
