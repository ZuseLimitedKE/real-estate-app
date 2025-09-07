import { UserRole, UserStatus, SessionUser } from '@/types/auth';
import { NextAuthOptions } from 'next-auth';
export const authConfig: NextAuthOptions = {
    pages: {
        signIn: '/auth/login',
        newUser: '/auth/register',
        error: '/auth/error',
    },
    callbacks: {
        // authorized({ auth, request: { nextUrl } }) {
        //     const isLoggedIn = !!auth?.user;
        //     const userRole = auth?.user?.role as UserRole;
        //     const userStatus = auth?.user?.status as UserStatus;

        //     // Protected route patterns
        //     const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
        //     const isOnAdminPanel = nextUrl.pathname.startsWith('/admin');
        //     const isOnAgencyPanel = nextUrl.pathname.startsWith('/agency');
        //     const isOnClientPanel = nextUrl.pathname.startsWith('/client');
        //     const isOnAuth = nextUrl.pathname.startsWith('/auth');
        //     const isOnPublic = nextUrl.pathname === '/' ||
        //         nextUrl.pathname.startsWith('/properties') ||
        //         nextUrl.pathname.startsWith('/about') ||
        //         nextUrl.pathname.startsWith('/contact');

        //     // Allow access to public pages
        //     if (isOnPublic && !isLoggedIn) {
        //         return true;
        //     }

        //     // Redirect logged-in users away from auth pages
        //     if (isOnAuth && isLoggedIn) {
        //         // Redirect based on user role and status
        //         if (userStatus !== 'APPROVED') {
        //             return Response.redirect(new URL('/dashboard/pending', nextUrl));
        //         }

        //         switch (userRole) {
        //             case 'ADMIN':
        //                 return Response.redirect(new URL('/admin/dashboard', nextUrl));
        //             case 'AGENCY':
        //                 return Response.redirect(new URL('/agency/dashboard', nextUrl));
        //             case 'CLIENT':
        //                 return Response.redirect(new URL('/client/dashboard', nextUrl));
        //             default:
        //                 return Response.redirect(new URL('/dashboard', nextUrl));
        //         }
        //     }

        //     // Check if user is logged in for protected routes
        //     if ((isOnDashboard || isOnAdminPanel || isOnAgencyPanel || isOnClientPanel) && !isLoggedIn) {
        //         return Response.redirect(new URL('/auth/login', nextUrl));
        //     }

        //     // Check user status for all protected routes
        //     if (isLoggedIn && userStatus !== 'APPROVED' && !nextUrl.pathname.startsWith('/dashboard/pending')) {
        //         return Response.redirect(new URL('/dashboard/pending', nextUrl));
        //     }

        //     // Role-based access control
        //     if (isLoggedIn && userStatus === 'APPROVED') {
        //         // Admin panel access
        //         if (isOnAdminPanel && userRole !== 'ADMIN') {
        //             return Response.redirect(new URL('/unauthorized', nextUrl));
        //         }

        //         // Agency panel access
        //         if (isOnAgencyPanel && userRole !== 'AGENCY') {
        //             return Response.redirect(new URL('/unauthorized', nextUrl));
        //         }

        //         // Client panel access  
        //         if (isOnClientPanel && userRole !== 'CLIENT') {
        //             return Response.redirect(new URL('/unauthorized', nextUrl));
        //         }

        //         // General dashboard - redirect to role-specific dashboard
        //         if (nextUrl.pathname === '/dashboard') {
        //             switch (userRole) {
        //                 case 'ADMIN':
        //                     return Response.redirect(new URL('/admin/dashboard', nextUrl));
        //                 case 'AGENCY':
        //                     return Response.redirect(new URL('/agency/dashboard', nextUrl));
        //                 case 'CLIENT':
        //                     return Response.redirect(new URL('/client/dashboard', nextUrl));
        //             }
        //         }
        //     }

        //     return true;
        // },
        jwt({ token, user }) {
            // Persist user data in JWT token
            if (user) {
                token.role = user.role;
                token.status = user.status;
                token.id = user.id;
            }
            return token;
        },
        session({ session, token }) {
            // Send properties to the client
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as UserRole;
                session.user.status = token.status as UserStatus;
            }
            return session;
        },
    },
    providers: [], // Providers will be added in auth.ts
    events: {
        async signIn({ user, account, profile, isNewUser }) {
            // Log successful sign-ins
            console.log(`User ${user.email} signed in with ${account?.provider}`);

            // Update last login time
            if (user.id) {
                // This would typically update the database
                // await updateUserLastLogin(user.id);
            }
        },
        async signOut({ session, token }) {
            // Log sign-outs
            console.log(`User signed out: ${token?.email || session?.user?.email}`);
        },
    },
    session: {
        strategy: 'jwt' as const,
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
    },
    debug: process.env.NODE_ENV === 'development',
};