// site/types/portfolio.ts
export interface PortfolioOverview {
  totalInvestment: number;
  currentValue: number;
  totalReturns: number;
  annualYield: number;
  availableBalance: number;
  portfolioGrowth: number;
  performanceChart: PerformanceData[];
  quickStats: {
    totalProperties: number;
    activeInvestments: number;
    completedInvestments: number;
    averageYield: number;
  };
}

export interface PerformanceData {
  date: string;
  value: number;
  return: number;
}

export interface InvestmentProperty {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyImage: string;
  location: string;
  totalTokens: number;
  tokensOwned: number;
  ownershipPercentage: number;
  initialInvestment: number;
  currentValue: number;
  totalReturns: number;
  annualYield: number;
  investmentDate: string;
  status: 'active' | 'matured' | 'sold';
  monthlyRent: number;
  nextPayout: string;
  propertyValue: number;
  tokenPrice: number;
  performance: PerformanceData[];
  documents: Document[];
  // Real data fields
  tokenAddress: string;
  propertyType: 'single' | 'apartment';
  unitId?: string; // For apartment units
}

export interface Transaction {
  id: string;
  propertyId: string;
  propertyName: string;
  type: 'purchase' | 'sale' | 'dividend' | 'deposit' | 'withdrawal';
  amount: number;
  tokens: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  transactionHash?: string;
  fromAddress?: string;
  toAddress?: string;
}

export interface Dividend {
  id: string;
  propertyId: string;
  propertyName: string;
  amount: number;
  date: string;
  period: string;
  status: 'paid' | 'pending';
  transactionHash?: string;
}

export interface Document {
  id?: string;
  name: string;
  type: string;
  url: string;
  uploadDate?: string;
  size: string;
  propertyName?: string; // Optional for grouping in UI
}

export interface WishlistItem {
  id: string;
  propertyId: string;
  propertyName: string;
  image: string;
  location: string;
  pricePerToken: number;
  minInvestment: number;
  annualYield: number;
  availableShares: number;
  addedDate: string;
}

export interface PortfolioStats {
  totalInvested: number;
  currentPortfolioValue: number;
  totalReturns: number;
  monthlyIncome: number;
  projectedAnnualIncome: number;
  portfolioDiversity: {
    residential: number;
    commercial: number;
    industrial: number;
  };
}

export interface InvestorTransactions {
  time: Date;
  amount: number;
  property_name: string;
  type: "purchase" | "sell";
  transactionHash?: string;
}

export interface InvestorProperties {
  property_id?: string;
  property_name: string;
  token_address: string;
  amount: number;
  property_type?: 'single' | 'apartment';
  unit_id?: string;
  images?: string[];
  documents?: any[];
  location?: string;
  property_value?: number;
  proposed_rent?: number;
  total_fractions?: number;
  purchase_time?: Date;
  purchase_price_per_token?: number;
}

// Real data interfaces for API responses
export interface RealTimePortfolioData {
  stats: PortfolioStats;
  properties: InvestmentProperty[];
  transactions: InvestorTransactions[];
  dividends: Dividend[];
  performance: PerformanceData[];
}