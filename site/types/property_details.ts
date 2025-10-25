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
    totalDistributed: number, 
    args: { investorAddress: string, sentAmount: number, transaction: string}[]
}