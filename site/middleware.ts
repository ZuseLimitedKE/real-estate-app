import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { tokenMaker } from "@/auth/token-maker";

const protectedRoutes = ["/investors", "/agencies", "/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // Verify access token
  let userPayload = await tokenMaker.verifyAccessToken(accessToken);
  let isAuthenticated = !!userPayload;

  let response: NextResponse | null = null;

  // Attempt refresh if not authenticated
  if (!isAuthenticated && refreshToken) {
    const newTokenPair = await tokenMaker.refreshAccessToken(refreshToken);
    if (newTokenPair) {
      response = NextResponse.next();

      response.cookies.set("accessToken", newTokenPair.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15,
      });

      response.cookies.set("refreshToken", newTokenPair.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      userPayload = await tokenMaker.verifyAccessToken(
        newTokenPair.accessToken,
      );
      isAuthenticated = !!userPayload;
    }
  }

  // If authenticated and visiting /auth, redirect by role
  if (pathname.startsWith("/auth") && isAuthenticated && userPayload) {
    const role = userPayload.role.toLowerCase();
    const redirectPath =
      role === "admin"
        ? "/admin"
        : role === "agency"
          ? "/agencies"
          : "/investors";

    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Protected routes: redirect to /auth if not logged in
  if (isProtectedRoute && !isAuthenticated) {
    const res = NextResponse.redirect(new URL("/auth/login", request.url));
    res.cookies.delete("accessToken");
    res.cookies.delete("refreshToken");
    return res;
  }

  // Role-based checks
  if (isAuthenticated && userPayload) {
    const role = userPayload.role.toLowerCase();
    const homeByRole: Record<string, string> = {
      admin: "/admin",
      agency: "/agencies",
      investor: "/investors",
    };

    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(
        new URL(homeByRole[role] ?? "/", request.url),
      );
    }

    if (pathname.startsWith("/agencies") && role !== "agency") {
      return NextResponse.redirect(
        new URL(homeByRole[role] ?? "/", request.url),
      );
    }

    if (pathname.startsWith("/investors") && role !== "investor") {
      return NextResponse.redirect(
        new URL(homeByRole[role] ?? "/", request.url),
      );
    }
  }

  // Default: allow
  return response ?? NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};
