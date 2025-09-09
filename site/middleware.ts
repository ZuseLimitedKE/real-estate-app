// middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { UserRole, UserStatus } from "@/types/auth"
import { getToken } from "next-auth/jwt"
export default withAuth(
  async function middleware(req: NextRequest) {
    const { nextUrl } = req
    const token = await getToken({ req })

    const isLoggedIn = !!token
    const userRole = token?.role as UserRole
    const userStatus = token?.status as UserStatus

    const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
    const isOnAdminPanel = nextUrl.pathname.startsWith("/admin")
    const isOnAgencyPanel = nextUrl.pathname.startsWith("/agency")
    const isOnClientPanel = nextUrl.pathname.startsWith("/client")
    const isOnAuth = nextUrl.pathname.startsWith("/auth")
    const isOnPublic =
      nextUrl.pathname === "/" ||
      nextUrl.pathname.startsWith("/properties") ||
      nextUrl.pathname.startsWith("/about") ||
      nextUrl.pathname.startsWith("/contact")

    // Public pages - allow access without authentication
    if (isOnPublic) {
      return NextResponse.next()
    }

    // Redirect logged-in users away from auth pages
    if (isOnAuth && isLoggedIn) {
      if (userStatus !== "APPROVED") {
        return NextResponse.redirect(new URL("/dashboard/pending", nextUrl))
      }

      switch (userRole) {
        case "ADMIN":
          return NextResponse.redirect(new URL("/admin/dashboard", nextUrl))
        case "AGENCY":
          return NextResponse.redirect(new URL("/agency/dashboard", nextUrl))
        case "CLIENT":
          return NextResponse.redirect(new URL("/client/dashboard", nextUrl))
        default:
          return NextResponse.redirect(new URL("/dashboard", nextUrl))
      }
    }

    // Protected routes must be logged in
    if (
      (isOnDashboard || isOnAdminPanel || isOnAgencyPanel || isOnClientPanel) &&
      !isLoggedIn
    ) {
      return NextResponse.redirect(new URL("/auth/login", nextUrl))
    }

    // Status check
    if (isLoggedIn && userStatus !== "APPROVED" && !nextUrl.pathname.startsWith("/dashboard/pending")) {
      return NextResponse.redirect(new URL("/dashboard/pending", nextUrl))
    }

    // Role-based access
    if (isLoggedIn && userStatus === "APPROVED") {
      if (isOnAdminPanel && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", nextUrl))
      }
      if (isOnAgencyPanel && userRole !== "AGENCY") {
        return NextResponse.redirect(new URL("/unauthorized", nextUrl))
      }
      if (isOnClientPanel && userRole !== "CLIENT") {
        return NextResponse.redirect(new URL("/unauthorized", nextUrl))
      }

      // General dashboard
      if (nextUrl.pathname === "/dashboard") {
        switch (userRole) {
          case "ADMIN":
            return NextResponse.redirect(new URL("/admin/dashboard", nextUrl))
          case "AGENCY":
            return NextResponse.redirect(new URL("/agency/dashboard", nextUrl))
          case "CLIENT":
            return NextResponse.redirect(new URL("/client/dashboard", nextUrl))
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes without authentication
        const { pathname } = req.nextUrl
        
        const publicPaths = [
          "/",
          "/properties",
          "/about", 
          "/contact",
          "/auth"
        ]
        
        // Check if current path is public
        const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
        
        if (isPublicPath) {
          return true
        }
        
        // For protected routes, require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
}
