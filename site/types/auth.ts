import { z } from 'zod';
import { ObjectId } from 'mongodb';
export type UserRole = 'CLIENT' | 'AGENCY' | 'ADMIN';

export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface BaseUser {
    _id: ObjectId;
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
export type CreateUserInput<T extends UserRole> = T extends 'CLIENT'
    ? Omit<ClientUser, '_id' | 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'emailVerified' | 'twoFactorEnabled' | 'status'>
    : T extends 'AGENCY'
    ? Omit<AgencyUser, '_id' | 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'emailVerified' | 'twoFactorEnabled' | 'status' | 'approvedBy' | 'approvedAt'>
    : T extends 'ADMIN'
    ? Omit<AdminUser, '_id' | 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'emailVerified' | 'twoFactorEnabled' | 'status'>
    : never;

export interface SessionUser {
    id: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    name: string;
    image?: string;
}

export interface LoginFormData {
    email: string;
    password: string;
}

export interface ClientRegistrationData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    publicKey: string;
    phoneNumber?: string;
    acceptTerms: boolean;
}

export interface AgencyRegistrationData {
    companyName: string;
    tradingName?: string;
    registrationNumber: string;
    licenseNumber: string;
    taxId: string;
    establishedDate: string;
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
    email: string;
    password: string;
    confirmPassword: string;
    description?: string;
    website?: string;
    acceptTerms: boolean;
}
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character');

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format');


export const addressSchema = z.object({
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(3, 'ZIP code is required'),
  country: z.string().min(2, 'Country is required'),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const clientRegistrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  publicKey: z.string(),
  phoneNumber: phoneSchema,
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const agencyRegistrationSchema = z.object({
  companyName: z.string().min(2, 'Company name is required').max(100),
  tradingName: z.string().max(100).optional(),
  registrationNumber: z.string()
    .min(5, 'Registration number is required')
    .max(50),
  licenseNumber: z.string()
    .min(5, 'License number is required')
    .max(50),
  taxId: z.string()
    .min(5, 'Tax ID is required')
    .max(50),
  establishedDate: z.string()
    .refine(date => new Date(date) <= new Date(), {
      message: 'Established date cannot be in the future'
    }),
  contactPerson: z.object({
    firstName: z.string().min(2, 'Contact person first name is required').max(50),
    lastName: z.string().min(2, 'Contact person last name is required').max(50),
    position: z.string().min(2, 'Position is required').max(50),
    email: emailSchema,
    phoneNumber: z.string()
      .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format'),
  }),
  businessAddress: addressSchema,
  businessType: z.enum(['REAL_ESTATE_AGENCY', 'PROPERTY_DEVELOPER', 'INVESTMENT_FIRM', 'OTHER']),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  description: z.string().max(1000).optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const clientProfileUpdateSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  phoneNumber: phoneSchema,
  dateOfBirth: z.string().optional(),
  nationality: z.string().max(50).optional(),
  address: addressSchema.optional(),
});

export const agencyProfileUpdateSchema = z.object({
  companyName: z.string().min(2, 'Company name is required').max(100),
  tradingName: z.string().max(100).optional(),
  contactPerson: z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    position: z.string().min(2).max(50),
    email: emailSchema,
    phoneNumber: z.string().regex(/^\+?[\d\s\-\(\)]+$/),
  }),
  businessAddress: addressSchema,
  mailingAddress: addressSchema.optional(),
  description: z.string().max(1000).optional(),
  website: z.string().url().optional().or(z.literal('')),
  socialMedia: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    facebook: z.string().url().optional().or(z.literal('')),
  }).optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ['confirmNewPassword'],
});

export const adminUserCreationSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  permissions: z.array(z.enum([
    'MANAGE_USERS',
    'APPROVE_AGENCIES', 
    'APPROVE_PROPERTIES',
    'MANAGE_COMPLIANCE',
    'VIEW_ANALYTICS',
    'MANAGE_SYSTEM'
  ])).min(1, 'At least one permission is required'),
  department: z.string().max(50).optional(),
  isSuper: z.boolean().default(false),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const kycDocumentSchema = z.object({
  documentType: z.enum(['idDocument', 'proofOfAddress', 'bankStatement']),
  file: z.any(),
});

export const agencyDocumentSchema = z.object({
  documentType: z.enum([
    'businessRegistration',
    'businessLicense', 
    'taxCertificate',
    'insuranceCertificate',
    'proofOfAddress',
    'bankStatement'
  ]),
  file: z.any(),
});

export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const twoFactorSetupSchema = z.object({
  secret: z.string().min(1),
  token: z.string().length(6, 'Token must be 6 digits').regex(/^\d+$/, 'Token must be numeric'),
});

export const twoFactorVerifySchema = z.object({
  token: z.string().length(6, 'Token must be 6 digits').regex(/^\d+$/, 'Token must be numeric'),
});

export const agencyApprovalSchema = z.object({
  agencyId: z.string().min(1, 'Agency ID is required'),
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().optional(),
});

export const investmentProfileSchema = z.object({
  riskTolerance: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  investmentGoals: z.array(z.string()).min(1, 'At least one investment goal is required'),
  annualIncome: z.number().positive().optional(),
  netWorth: z.number().positive().optional(),
});