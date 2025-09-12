import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { tokenMaker } from "@/auth/token-maker";

// Routes that require authentication
const protectedRoutes = ["/investors", "/agencies", "/admin"];

// Routes that logged-in users should not see
const authRoutes = ["/auth/login", "/auth/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Grab tokens from cookies
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  let isAuthenticated = false;
  let userPayload: Awaited<
    ReturnType<typeof tokenMaker.verifyAccessToken>
  > | null = null;

  try {
    // Verify access token
    userPayload = await tokenMaker.verifyAccessToken(accessToken, {
      clearCookiesOnFailure: false,
    });
    isAuthenticated = !!userPayload;
  } catch {
    // If access token is expired/invalid, try refresh
    if (refreshToken) {
      try {
        const newTokenPair = await tokenMaker.refreshAccessToken(refreshToken);
        if (newTokenPair) {
          const response = NextResponse.next();

          // Replace cookies with new tokens
          response.cookies.set("accessToken", newTokenPair.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 15, // 15 min
          });

          response.cookies.set("refreshToken", newTokenPair.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
          });

          isAuthenticated = true;

          // Persist refreshed cookies for all routes
          return response;
        }
      } catch (err) {
        console.error("Token refresh failed:", err);
      }
    }
  }

  // If not logged in but trying to hit protected routes , send to login
  if (isProtectedRoute && !isAuthenticated) {
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }

  // If already logged in, block access to login/register
  if (isAuthRoute && isAuthenticated && userPayload) {
    const role = userPayload.role.toLowerCase();
    const redirectPath =
      role === "admin"
        ? "/admin"
        : role === "agency"
          ? "/agencies"
          : "/investors";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Role-based access control
  if (isAuthenticated && userPayload) {
    const role = userPayload.role.toLowerCase();
    const homeByRole: Record<string, string> = {
      admin: "/admin",
      agencies: "/agencies",
      investors: "/investors",
    };
    // Admin-only pages
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(
        new URL(homeByRole[role] ?? "/", request.url),
      );
    }

    // Agency-only pages
    if (pathname.startsWith("/agencies") && role !== "agency") {
      return NextResponse.redirect(
        new URL(homeByRole[role] ?? "/", request.url),
      );
    }

    // Investor-only pages
    if (pathname.startsWith("/investors") && role !== "investor") {
      return NextResponse.redirect(
        new URL(homeByRole[role] ?? "/", request.url),
      );
    }
  }

  // Default: allow through
  return NextResponse.next();
}
