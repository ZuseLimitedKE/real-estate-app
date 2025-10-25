import {z} from "zod";

export interface DistributePropertyInvestor {
    walletAddress: string;
    shares: number;
    percentage: number;
}

export interface DistributionHistory {
    id: string;
    date: Date;
    amount: number;
    investorCount: number;
    status: 'completed' | 'pending' | 'failed';
    distributions: Array<{
        amount: number;
        walletAddress: string;
        txHash: string;
    }>;
}

export interface StoreDistributionTransactionDetails {
    propertyID: string, 
    unitID?: string,
    totalDistributed: number, 
    args: { investorAddress: string, sentAmount: number, transaction: string}[]
}

export const addressSchema = z.string({message: "Address must be a string"}).regex(/^(0x)?[0-9a-fA-F]{40}$/, {message: "Must be a valid ethereum address"});