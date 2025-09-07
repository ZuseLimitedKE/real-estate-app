import { Collection, ObjectId } from 'mongodb';
import client from "../connection";
export interface VerificationToken {
    _id?: ObjectId;
    email: string;
    token: string;
    type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'TWO_FACTOR';
    expires: Date;
    createdAt: Date;
    used: boolean;
}

export class TokenModel {
    private static collection: Collection<VerificationToken> | null = null;

    private static async getCollection(): Promise<Collection<VerificationToken>> {
        if (!this.collection) {
            const db = client.db();
            this.collection = db.collection<VerificationToken>('tokens');

            await this.collection.createIndex({ token: 1 }, { unique: true });
            await this.collection.createIndex({ email: 1 });
            await this.collection.createIndex({ expires: 1 }, { expireAfterSeconds: 0 });
        }
        return this.collection;
    }

    static async createToken(
        email: string,
        type: VerificationToken['type'],
        expiresIn: number = 3600000
    ): Promise<string> {
        const collection = await this.getCollection();

        // Generate random token
        const token = require('crypto').randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + expiresIn);

        const tokenDoc: VerificationToken = {
            email: email.toLowerCase(),
            token,
            type,
            expires,
            createdAt: new Date(),
            used: false,
        };

        await collection.insertOne(tokenDoc);
        return token;
    }

    static async verifyToken(
        token: string,
        type: VerificationToken['type']
    ): Promise<string | null> {
        const collection = await this.getCollection();

        const tokenDoc = await collection.findOne({
            token,
            type,
            used: false,
            expires: { $gt: new Date() }
        });

        if (!tokenDoc) {
            return null;
        }

        // Mark token as used
        await collection.updateOne(
            { _id: tokenDoc._id },
            { $set: { used: true } }
        );

        return tokenDoc.email;
    }

    static async deleteExpiredTokens(): Promise<number> {
        const collection = await this.getCollection();
        const result = await collection.deleteMany({
            expires: { $lt: new Date() }
        });
        return result.deletedCount;
    }
}