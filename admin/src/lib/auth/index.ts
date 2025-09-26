import NextAuth from 'next-auth';
import { authOptions } from './config';

const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

export { handlers, auth, signIn, signOut };