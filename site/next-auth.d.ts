import { UserRole, UserStatus } from '@/types/auth';
import NextAuth, { type DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      status: UserStatus;
    } & DefaultSession['user']; 
  }


  interface User {
    id: string;
    role: UserRole;
    status: UserStatus;
  }
}


declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    status: UserStatus;
  }
}