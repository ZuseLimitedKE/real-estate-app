import { Collection, ObjectId } from "mongodb";
import client from "../connection";

export type UserRole = "INVESTOR" | "AGENCY" | "ADMIN";
export type UserStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export interface BaseUser {
  _id?: ObjectId;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  companyName?: string;
  registrationNumber?: string;
  licenseNumber?: string;
  taxId?: string;
  establishedDate?: Date;
  contactPerson: {
    firstName: string;
    lastName: string;
    position: string;
    email: string;
    phoneNumber: string;
  };
  businessAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  businessType: string;
  verificationDocuments: {
    businessRegistration: string;
    businessLicense: string;
    taxCertificate: string;
    insuranceCertificate?: string;
    proofOfAddress: string;
    bankStatement: string;
  };
}

export interface AgencyUser extends BaseUser {
  role: "AGENCY";
  companyName: string;
  tradingName?: string;
  registrationNumber: string;
  licenseNumber: string;
  taxId: string;
  establishedDate: Date;
  contactPerson: {
    firstName: string;
    lastName: string;
    position: string;
    email: string;
    phoneNumber: string;
  };
  businessAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  businessType: string;
  description?: string;
  website?: string;
  verificationDocuments: {
    businessRegistration: string;
    businessLicense: string;
    taxCertificate: string;
    insuranceCertificate?: string;
    proofOfAddress: string;
    bankStatement: string;
  };
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

export interface AdminUser extends BaseUser {
  role: "ADMIN";
  firstName: string;
  lastName: string;
  permissions: string[];
  isSuper: boolean;
}

export type User = BaseUser | AgencyUser | AdminUser;

export class UserModel {
  private static collection: Collection<User> | null = null;

  private static async getCollection(): Promise<Collection<User>> {
    if (!this.collection) {
      const db = client.db("real-estate-app");
      this.collection = db.collection<User>("users");
      await this.collection.createIndexes([
        { key: { email: 1 }, unique: true },
        { key: { role: 1 } },
        { key: { status: 1 } },
      ]);
    }
    return this.collection;
  }

  static async findByRole(role: UserRole, limit: number = 50, skip: number = 0): Promise<User[]> {
    const collection = await this.getCollection();
    return await collection
      .find({ role })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async findByEmail(email: string): Promise<User | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ email: email.toLowerCase() });
  }

  static async findById(id: string): Promise<User | null> {
    const collection = await this.getCollection();
    if (!ObjectId.isValid(id)) return null;
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  static async findPendingAgencies(limit: number = 50, skip: number = 0): Promise<AgencyUser[]> {
    const collection = await this.getCollection();
    const agencies = await collection
      .find({ 
        role: "AGENCY", 
        status: "PENDING" 
      })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .toArray();
    return agencies as AgencyUser[];
  }

  static async findAgenciesByStatus(status: UserStatus, limit: number = 50, skip: number = 0): Promise<AgencyUser[]> {
    const collection = await this.getCollection();
    const agencies = await collection
      .find({ 
        role: "AGENCY", 
        status: status 
      })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .toArray();
    return agencies as AgencyUser[];
  }

  static async updateStatus(
    id: string,
    status: UserStatus,
    approvedBy?: string,
    rejectionReason?: string
  ): Promise<boolean> {
    const collection = await this.getCollection();
    if (!ObjectId.isValid(id)) {
      return false;
    }

    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (status === "APPROVED" && approvedBy) {
      updateData.approvedBy = approvedBy;
      updateData.approvedAt = new Date();
      updateData.rejectionReason = undefined;
    }

    if (status === "REJECTED" && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
      updateData.approvedBy = undefined;
      updateData.approvedAt = undefined;
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return result.modifiedCount > 0;
  }

  static async getAgencyStats() {
    const collection = await this.getCollection();
    
    const stats = await collection
      .aggregate([
        {
          $match: { role: "AGENCY" }
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ])
      .toArray();

    return stats;
  }

  static async countAgencies(): Promise<number> {
    const collection = await this.getCollection();
    return await collection.countDocuments({ role: "AGENCY" });
  }
}