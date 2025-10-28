import { InvestmentProperty, PortfolioStats, PerformanceData } from "@/types/portfolio";

// Helper function to transform properties data
export async function transformPropertiesData(properties: any[]): Promise<InvestmentProperty[]> {
  return properties.map((prop) => {
    // Calculate financial metrics
    const tokenPrice = 1; // $1 USDC per token
    const initialInvestment = prop.amount * tokenPrice;
    const currentValue = prop.amount * tokenPrice; // Same for now, but could include appreciation
    const totalReturns = currentValue - initialInvestment;
    
    // Calculate ownership percentage
    const ownershipPercentage = prop.total_fractions > 0 ? 
      (prop.amount / prop.total_fractions) * 100 : 0;
    
    // Calculate monthly rent share
    const monthlyRent = prop.total_fractions > 0 ? 
      (prop.amount / prop.total_fractions) * (prop.proposed_rent || 0) : 0;
    
    // Convert rent from KSh to USDC (assuming 150 KSh = 1 USDC)
    const monthlyRentInUSDC = monthlyRent / 150;

    return {
      id: prop.property_id || Math.random().toString(),
      propertyId: prop.property_id || '',
      propertyName: prop.property_name,
      propertyImage: prop.images?.[0] || "/property-placeholder.jpg",
      location: prop.location || "Location not specified",
      totalTokens: prop.total_fractions || prop.amount,
      tokensOwned: prop.amount,
      ownershipPercentage: ownershipPercentage,
      initialInvestment: initialInvestment,
      currentValue: currentValue,
      totalReturns: totalReturns,
      annualYield: prop.proposed_rent && prop.property_value ? 
        ((prop.proposed_rent * 12) / prop.property_value) * 100 : 8.5,
      investmentDate: new Date().toISOString(), // This should come from purchase records
      status: 'active' as const,
      monthlyRent: monthlyRentInUSDC,
      nextPayout: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      propertyValue: prop.property_value || 0,
      tokenPrice: tokenPrice,
      tokenAddress: prop.token_address,
      propertyType: prop.property_type || 'single',
      unitId: prop.unit_id,
      performance: generatePropertyPerformance(prop),
      documents: prop.documents?.map((doc: any, index: number) => ({
        id: doc._id?.toString() || `doc-${index}`,
        name: doc.name || "Property Document",
        type: doc.type || "document",
        url: doc.url || "#",
        uploadDate: new Date().toISOString(),
        size: doc.size || "1.2 MB"
      })) || []
    };
  });
}

// Helper function to generate property performance data
function generatePropertyPerformance(property: any): PerformanceData[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  return months.map((month, index) => {
    const baseValue = (property.amount || 0) * 0.8; // Start from 80% of current value
    const growth = (index / 12) * (property.amount || 0) * 0.2; // Gradual growth to current value
    
    return {
      date: month,
      value: baseValue + growth,
      return: (growth / baseValue) * 100
    };
  });
}

// Helper function to generate performance data
export function generatePerformanceData(stats: PortfolioStats): PerformanceData[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  return months.map((month, index) => {
    const monthOffset = (index - currentMonth + 12) % 12;
    const baseValue = stats.totalInvested * 0.8; // Start from 80% of current investment
    const growthFactor = 1 + (stats.totalReturns / stats.totalInvested) * (monthOffset / 12);
    
    return {
      date: month,
      value: baseValue * growthFactor,
      return: (growthFactor - 1) * 100
    };
  });
}