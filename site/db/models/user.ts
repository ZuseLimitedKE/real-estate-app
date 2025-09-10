import { Collection, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { User, UserRole, CreateUserInput, UserStatus } from '@/types/auth';
import client from '../connection';

export class UserModel {
    private static collection: Collection<User> | null = null;

    private static async getCollection(): Promise<Collection<User>> {
        if (!this.collection) {
            const db = client.db();
            this.collection = db.collection<User>('users');

            // Create indexes for better performance
            await this.collection.createIndex({ email: 1 }, { unique: true });
            await this.collection.createIndex({ role: 1 });
            await this.collection.createIndex({ status: 1 });
            await this.collection.createIndex({ publicKey: 1 }, { unique: true, sparse: true });
            await this.collection.createIndex({ registrationNumber: 1 }, { unique: true, sparse: true });
        }
        return this.collection;
    }

    static async findByEmail(email: string): Promise<User | null> {
        const collection = await this.getCollection();
        return await collection.findOne({ email: email.toLowerCase() });
    }

    static async findById(id: string): Promise<User | null> {
        const collection = await this.getCollection();
        return await collection.findOne({ _id: new ObjectId(id) });
    }

    static async findByPublicKey(publicKey: string): Promise<User | null> {
        const collection = await this.getCollection();
        return await collection.findOne({ publicKey });
    }

    static async create<T extends UserRole>(
        userData: CreateUserInput<T> & { role: T }
    ): Promise<User> {
        try {
            const collection = await this.getCollection();
            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

            // Prepare user document
            const now = new Date();
            const baseUserData = {
                ...userData,
                email: userData.email.toLowerCase(),
                password: hashedPassword,
                status: userData.role === 'ADMIN' ? 'APPROVED' as UserStatus : 'PENDING' as UserStatus,
                createdAt: now,
                updatedAt: now,
                emailVerified: false,
                twoFactorEnabled: false,
            };

            const result = await collection.insertOne(baseUserData as any);

            const createdUser = await collection.findOne({ _id: result.insertedId });
            if (!createdUser) {
                throw new Error('Failed to create user');
            }

            return createdUser;
        }
        catch (error) {
            throw new Error(`User creation failed: ${(error as Error).message}`);
        }
    }
    static async login(email: string, password: string): Promise<{ success: boolean, message: string, role: string, userId: string }> {
        const collection = await this.getCollection();
        const user = await collection.findOne({ email: email.toLowerCase() });
        if (!user) {
            return { success: false, message: 'User not found', role: '', userId: '' };
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return { success: false, message: 'Incorrect password', role: '', userId: '' };
        }

        return {
            success: true,
            message: 'Login successful',
            role: user.role,
            userId: user._id.toString()
        };
    }



    static async updateById(
        id: string,
        updateData: Partial<User>
    ): Promise<User | null> {
        try {
            const collection = await this.getCollection();

            const result = await collection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        ...updateData,
                        updatedAt: new Date()
                    }
                },
                { returnDocument: 'after' }
            );

            if (!result) {
                throw new Error('User not found');
            }

            return result;
        }
        catch (error) {
            throw new Error(`User update failed: ${(error as Error).message}`);
        }
    }

    static async updateLastLogin(id: string): Promise<void> {
        const collection = await this.getCollection();

        await collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    lastLoginAt: new Date(),
                    updatedAt: new Date()
                }
            }
        );
    }

    static async updateStatus(
        id: string,
        status: UserStatus,
        approvedBy?: string,
        rejectionReason?: string
    ): Promise<User | null> {
        try {
            const collection = await this.getCollection();

            const updateData: any = {
                status,
                updatedAt: new Date()
            };

            if (status === 'APPROVED' && approvedBy) {
                updateData.approvedBy = approvedBy;
                updateData.approvedAt = new Date();
            }

            if (status === 'REJECTED' && rejectionReason) {
                updateData.rejectionReason = rejectionReason;
            }

            const result = await collection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: updateData },
                { returnDocument: 'after' }
            );

            if (!result) {
                throw new Error('User not found');
            }

            return result;
        }
        catch (error) {
            throw new Error(`Failed to update user status: ${(error as Error).message}`);
        }
    }

    static async changePassword(id: string, newPassword: string): Promise<boolean> {
        const collection = await this.getCollection();

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    password: hashedPassword,
                    updatedAt: new Date()
                }
            }
        );

        return result.modifiedCount > 0;
    }

    static async verifyPassword(id: string, password: string): Promise<boolean> {
        const user = await this.findById(id);
        if (!user) return false;

        return await bcrypt.compare(password, user.password);
    }

    static async findPendingAgencies(limit: number = 10, skip: number = 0) {
        const collection = await this.getCollection();

        return await collection
            .find({
                role: 'AGENCY',
                status: 'PENDING'
            })
            .limit(limit)
            .skip(skip)
            .toArray();
    }

    static async findByRole(role: UserRole, limit: number = 10, skip: number = 0) {
        const collection = await this.getCollection();

        return await collection
            .find({ role })
            .limit(limit)
            .skip(skip)
            .toArray();
    }

    static async deleteById(id: string): Promise<boolean> {
        const collection = await this.getCollection();

        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }

    static async emailExists(email: string): Promise<boolean> {
        const collection = await this.getCollection();
        const count = await collection.countDocuments({ email: email.toLowerCase() });
        return count > 0;
    }

    static async publicKeyExists(publicKey: string): Promise<boolean> {
        const collection = await this.getCollection();
        const count = await collection.countDocuments({ publicKey });
        return count > 0;
    }

    static async registrationNumberExists(registrationNumber: string): Promise<boolean> {
        const collection = await this.getCollection();
        const count = await collection.countDocuments({ registrationNumber });
        return count > 0;
    }

    static async getUserStats() {
        const collection = await this.getCollection();

        const stats = await collection.aggregate([
            {
                $group: {
                    _id: {
                        role: '$role',
                        status: '$status'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.role',
                    statuses: {
                        $push: {
                            status: '$_id.status',
                            count: '$count'
                        }
                    },
                    total: { $sum: '$count' }
                }
            }
        ]).toArray();

        return stats;
    }
}
