export type UserRole = 'CLIENT' | 'AGENCY' | 'ADMIN';

export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface BaseUser {
    _id: string;
    email: string;
    password: string;
    role: UserRole;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    emailVerified: boolean;
    twoFactorEnabled: boolean;
    profileImage?: string;
}

export interface ClientUser extends BaseUser {
    role: 'CLIENT';
    firstName: string;
    lastName: string;
    publicKey: string;
    phoneNumber?: string;
    dateOfBirth?: Date;
    nationality?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    kycStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED';
    kycDocuments?: {
        idDocument?: string;
        proofOfAddress?: string;
        bankStatement?: string;
    };
    investmentProfile?: {
        riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
        investmentGoals: string[];
        annualIncome?: number;
        netWorth?: number;
    };
}

export interface AgencyUser extends BaseUser {
    role: 'AGENCY';
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
    mailingAddress?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    businessType: 'REAL_ESTATE_AGENCY' | 'PROPERTY_DEVELOPER' | 'INVESTMENT_FIRM' | 'OTHER';
    description?: string;
    website?: string;
    socialMedia?: {
        linkedin?: string;
        twitter?: string;
        facebook?: string;
    };
    verificationDocuments: {
        businessRegistration: string;
        businessLicense: string;
        taxCertificate: string;
        insuranceCertificate?: string;
        proofOfAddress: string;
        bankStatement: string;
    };
    compliance: {
        amlCompliant: boolean;
        gdprCompliant: boolean;
        localRegulationsCompliant: boolean;
        lastComplianceCheck?: Date;
    };
    team?: Array<{
        name: string;
        position: string;
        email: string;
        licenseNumber?: string;
    }>;
    approvedBy?: string;
    approvedAt?: Date;
    rejectionReason?: string;
}

export interface AdminUser extends BaseUser {
    role: 'ADMIN';
    firstName: string;
    lastName: string;
    permissions: Array<
        | 'MANAGE_USERS'
        | 'APPROVE_AGENCIES'
        | 'APPROVE_PROPERTIES'
        | 'MANAGE_COMPLIANCE'
        | 'VIEW_ANALYTICS'
        | 'MANAGE_SYSTEM'
    >;
    department?: string;
    isSuper: boolean;
}

export type User = ClientUser | AgencyUser | AdminUser;