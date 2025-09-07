import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { MongoClient, ObjectId } from 'mongodb';
import { User } from '@/types/auth';

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db(process.env.MONGODB_DB_NAME || 'real_estate_platform');

async function getUser(email: string): Promise<User | null> {
    try {
        await client.connect();
        const user = await db.collection('users').findOne({
            email: email.toLowerCase()
        }) as User | null;

        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
    } finally {
        await client.close();
    }
}

async function updateUserLastLogin(userId: string): Promise<void> {
    try {
        await client.connect();
        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    lastLoginAt: new Date(),
                    updatedAt: new Date()
                }
            }
        );
    } catch (error) {
        console.error('Failed to update last login:', error);
    } finally {
        await client.close();
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({
                        email: z.email(),
                        password: z.string().min(6)
                    })
                    .safeParse(credentials);

                if (!parsedCredentials.success) {
                    console.log('Invalid credentials format');
                    return null;
                }

                const { email, password } = parsedCredentials.data;
                const user = await getUser(email);

                if (!user) {
                    console.log('User not found');
                    return null;
                }

                // Check if user account is suspended
                if (user.status === 'SUSPENDED') {
                    console.log('User account is suspended');
                    return null;
                }

                const passwordsMatch = await bcrypt.compare(password, user.password);

                if (!passwordsMatch) {
                    console.log('Invalid credentials');
                    return null;
                }

                // Update last login
                await updateUserLastLogin(user._id);

                // Return user object for session
                const sessionUser = {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    name: getUserDisplayName(user),
                    image: user.profileImage,
                };

                return sessionUser;
            },
        }),
    ],
});

// Helper function to get user display name
function getUserDisplayName(user: User): string {
    switch (user.role) {
        case 'CLIENT':
            return `${user.firstName} ${user.lastName}`;
        case 'AGENCY':
            return user.companyName;
        case 'ADMIN':
            return `${user.firstName} ${user.lastName}`;
        default:
            return 'user';
    }
}
