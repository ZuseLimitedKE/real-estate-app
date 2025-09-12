import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { tokenMaker } from "@/auth/token-maker";

// Routes that require authentication
const protectedRoutes = ["/investors", "/agencies", "/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  let isAuthenticated = false;
  let userPayload: Awaited<
    ReturnType<typeof tokenMaker.verifyAccessToken>
  > | null = null;

  try {
    userPayload = await tokenMaker.verifyAccessToken(accessToken);
    isAuthenticated = !!userPayload;
  } catch {
    if (refreshToken) {
      try {
        const newTokenPair = await tokenMaker.refreshAccessToken(refreshToken);
        if (newTokenPair) {
          const response = NextResponse.next();

          // Update cookies
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
          userPayload = await tokenMaker.verifyAccessToken(
            newTokenPair.accessToken,
          );

          return response; // persist refreshed cookies
        }
      } catch (err) {
        console.error("Token refresh failed:", err);
      }
    }
  }

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

  if (isProtectedRoute && !isAuthenticated) {
    const response = NextResponse.redirect(new URL("/auth", request.url));
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }

  if (isAuthenticated && userPayload) {
    const role = userPayload.role.toLowerCase();
    const homeByRole: Record<string, string> = {
      admin: "/admin",
      agency: "/agencies",
      investor: "/investors",
    };

    // Admin-only
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(
        new URL(homeByRole[role] ?? "/", request.url),
      );
    }

    // Agency-only
    if (pathname.startsWith("/agencies") && role !== "agency") {
      return NextResponse.redirect(
        new URL(homeByRole[role] ?? "/", request.url),
      );
    }

    // Investor-only
    if (pathname.startsWith("/investors") && role !== "investor") {
      return NextResponse.redirect(
        new URL(homeByRole[role] ?? "/", request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
      Protect everything except:
        - /_next (internals)
        - /static or public assets
        - /auth (auth entrypoint)
    */
    "/((?!_next|static|favicon.ico|auth).*)",
  ],
};
