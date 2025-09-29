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
  id: string;
  name: string;
  type: string;
  url: string;
  uploadDate: string;
  size: string;
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

// Mock data for portfolio
export const mockPortfolioData: PortfolioOverview = {
  totalInvestment: 125000,
  currentValue: 142500,
  totalReturns: 17500,
  annualYield: 8.2,
  availableBalance: 2500,
  portfolioGrowth: 14,
  performanceChart: [
    { date: 'Jan', value: 100000, return: 0 },
    { date: 'Feb', value: 105000, return: 5 },
    { date: 'Mar', value: 108000, return: 8 },
    { date: 'Apr', value: 112000, return: 12 },
    { date: 'May', value: 115000, return: 15 },
    { date: 'Jun', value: 120000, return: 20 },
    { date: 'Jul', value: 125000, return: 25 },
    { date: 'Aug', value: 130000, return: 30 },
    { date: 'Sep', value: 135000, return: 35 },
    { date: 'Oct', value: 138000, return: 38 },
    { date: 'Nov', value: 140000, return: 40 },
    { date: 'Dec', value: 142500, return: 42.5 },
  ],
  quickStats: {
    totalProperties: 8,
    activeInvestments: 6,
    completedInvestments: 2,
    averageYield: 7.8,
  },
};

export const mockInvestmentProperties: InvestmentProperty[] = [
  {
    id: '1',
    propertyId: 'prop1',
    propertyName: 'Luxury Apartment Complex - Westlands',
    propertyImage: '/property1.jpg',
    location: 'Westlands, Nairobi',
    totalTokens: 10000,
    tokensOwned: 250,
    ownershipPercentage: 2.5,
    initialInvestment: 25000,
    currentValue: 28750,
    totalReturns: 3750,
    annualYield: 9.2,
    investmentDate: '2024-01-15',
    status: 'active',
    monthlyRent: 2300,
    nextPayout: '2024-12-30',
    propertyValue: 1150000,
    tokenPrice: 115,
    performance: [
      { date: 'Jan', value: 25000, return: 0 },
      { date: 'Feb', value: 25500, return: 2 },
      { date: 'Mar', value: 26200, return: 4.8 },
      { date: 'Apr', value: 27000, return: 8 },
      { date: 'May', value: 27500, return: 10 },
      { date: 'Jun', value: 28000, return: 12 },
      { date: 'Jul', value: 28200, return: 12.8 },
      { date: 'Aug', value: 28500, return: 14 },
      { date: 'Sep', value: 28750, return: 15 },
    ],
    documents: [
      {
        id: 'doc1',
        name: 'Purchase Agreement',
        type: 'contract',
        url: '/documents/agreement1.pdf',
        uploadDate: '2024-01-15',
        size: '2.4 MB',
      },
    ],
  },
  // Add more mock properties as needed
];

export const mockTransactions: Transaction[] = [
  {
    id: 'tx1',
    propertyId: 'prop1',
    propertyName: 'Luxury Apartment Complex - Westlands',
    type: 'purchase',
    amount: 25000,
    tokens: 250,
    date: '2024-01-15',
    status: 'completed',
    transactionHash: '0x1234567890abcdef',
  },
  {
    id: 'tx2',
    propertyId: 'prop1',
    propertyName: 'Luxury Apartment Complex - Westlands',
    type: 'dividend',
    amount: 2300,
    tokens: 0,
    date: '2024-06-30',
    status: 'completed',
  },
];