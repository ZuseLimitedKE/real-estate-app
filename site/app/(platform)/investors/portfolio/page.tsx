// site/app/(platform)/investors/portfolio/page.tsx
"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Download, 
  Calendar,
  Building,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowDown,
  RefreshCw,
  Info,
  Eye,
} from "lucide-react";
import DepositUSDC from "./_components/DepositUSDC";
import { UsdcBalanceCard } from "./_components/UsdcBalanceCard";
import { PropertyTokensInEscrowCard } from "./_components/PropertyTokensInEscrowCard";
import DepositPropertyTokens from "./_components/DepositPropertyTokens";
import InitSellOrderDialog from "./_components/InitSellOrderDialog";
import { toast } from "sonner";
import { 
  PortfolioStats, 
  InvestmentProperty, 
  InvestorTransactions, 
  Dividend,
  PerformanceData 
} from "@/types/portfolio";

// Import server actions
import getPropertiesOwnedByInvestor from "@/server-actions/portfolio/getInvestorProperties";
import getInvestorTransactions from "@/server-actions/portfolio/getInvestorTransactions";
import getPortfolioStats from "@/server-actions/portfolio/getPortfolioStats";
import { transformPropertiesData, generatePerformanceData } from "@/lib/utils/portfolio";
import RentDistributions from "./_components/RentDistributions";

  // const MARKETPLACE = process.env.MARKETPLACE_CONTRACT as `0x${string}`;
  // const PROPERTY_TOKEN = process.env.PROPERTY_TOKEN_TOKEN as `0x${string}`;

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [openDepositUSDCDialog, setOpenDepositUSDCDialog] = useState(false);
  const [openDepositTokensDialog, setOpenDepositTokensDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [initSellOrder, setInitSellOrder] = useState(false)

  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);
  const [investmentProperties, setInvestmentProperties] = useState<InvestmentProperty[]>([]);
  const [transactions, setTransactions] = useState<InvestorTransactions[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);


  // const { writeContract, isPending } = useWriteContract();

  // const handleAssociate = async () => {
  //   await writeContract({
  //     address: MARKETPLACE,
  //     abi: marketplaceAbi.abi,
  //     functionName: "tokenAssociate",
  //     args: [PROPERTY_TOKEN],
  //   });
  // };

  const loadPortfolioData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Load all data in parallel
      const [
        propertiesData,
        transactionsData,
        statsData,
      ] = await Promise.all([
        getPropertiesOwnedByInvestor(),
        getInvestorTransactions(),
        getPortfolioStats(),
      ]);

      // Transform properties data to InvestmentProperty format
      const transformedProperties = await transformPropertiesData(propertiesData);
      setInvestmentProperties(transformedProperties);
      
      setTransactions(transactionsData);
      setPortfolioStats(statsData);
      
      // Generate performance data from portfolio stats
      if (statsData) {
        const performance = generatePerformanceData(statsData);
        setPerformanceData(performance);
      }

    } catch (error) {
      console.error("Error loading portfolio data:", error);
      toast.error("Failed to load portfolio data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const handleRefresh = () => {
    loadPortfolioData(true);
  };

  if (loading) {
    return <PortfolioSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              My Investment Portfolio
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Track your real estate investments and returns
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Button onClick={() => setOpenDepositUSDCDialog(true)}>
              <Plus className="w-4 h-4" />
              <span>Deposit USDC</span>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full h-full grid-cols-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1.5 rounded-2xl border">
            <TabsTrigger value="overview" className="flex items-center gap-2 py-3 cursor-pointer">
              <PieChart className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="investments" className="flex items-center gap-2 py-3 cursor-pointer relative">
  <Building className="w-4 h-4" />
  Investments
  {investmentProperties.length > 0 && (
    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-green-500 text-white">
      {investmentProperties.length}
    </Badge>
  )}
</TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2 py-3 cursor-pointer">
              <DollarSign className="w-4 h-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="dividends" className="flex items-center gap-2 py-3 cursor-pointer">
              <TrendingUp className="w-4 h-4" />
              Dividends
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2 py-3 cursor-pointer">
              <Download className="w-4 h-4" />
              Documents
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {portfolioStats && (
              <>
                <PortfolioOverviewSection stats={portfolioStats} />
                <PerformanceChart data={performanceData} />
                <QuickStatsSection 
                  stats={{
                    totalProperties: investmentProperties.length,
                    activeInvestments: investmentProperties.filter(p => p.status === 'active').length,
                    completedInvestments: investmentProperties.filter(p => p.status === 'sold').length,
                    averageYield: portfolioStats.totalReturns > 0 ? 
                      (portfolioStats.totalReturns / portfolioStats.totalInvested) * 100 : 0
                  }} 
                />
              </>
            )}
          </TabsContent>

          {/* Investments Tab */}
          <TabsContent value="investments">
            <InvestmentsSection
              properties={investmentProperties}
              onSellTokens={() => setInitSellOrder(true)}
              onDepositTokens={() => setOpenDepositTokensDialog(true)}
              refreshing={refreshing}
            />
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <TransactionsSection transactions={transactions} refreshing={refreshing} />
          </TabsContent>

          {/* Dividends Tab */}
          <TabsContent value="dividends">
            <RentDistributions />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <DocumentsSection properties={investmentProperties} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <DepositUSDC
        open={openDepositUSDCDialog}
        setOpen={setOpenDepositUSDCDialog}
        onSuccess={() => {
          toast.success("USDC deposited successfully!");
          loadPortfolioData(true);
        }}
      />
      <DepositPropertyTokens
        open={openDepositTokensDialog}
        setOpen={setOpenDepositTokensDialog}
        onSuccess={() => {
          toast.success("Tokens deposited successfully!");
          loadPortfolioData(true);
        }}
      />      
      <InitSellOrderDialog
        open={initSellOrder}
        onOpenChange={setInitSellOrder}
        onSuccess={() => {
          toast.success("Sell order created successfully!");
          loadPortfolioData(true);
        }}
      />
    </div>
  );
}

// Portfolio Overview Component
function PortfolioOverviewSection({ stats }: { stats: PortfolioStats }) {
  const annualYield = stats.totalInvested > 0 ? (stats.totalReturns / stats.totalInvested) * 100 : 0;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
          <DollarSign className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.totalInvested.toLocaleString()}
          </div>
          <p className="text-xs text-blue-100">
            Initial capital invested
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Value</CardTitle>
          <TrendingUp className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.currentPortfolioValue.toLocaleString()}
          </div>
          <p className="text-xs text-green-100">
            +${stats.totalReturns.toLocaleString()} total returns
          </p>
        </CardContent>
      </Card>

      <PropertyTokensInEscrowCard />

      <UsdcBalanceCard />
    </div>
  );
}


// Performance Chart Component
function PerformanceChart({ data }: { data: PerformanceData[] }) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Portfolio Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-between gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="text-xs text-gray-500 mb-2">{item.date}</div>
              <div
                className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-blue-700 cursor-pointer group relative"
                style={{ height: `${(item.value / maxValue) * 80}%` }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ${item.value.toLocaleString()}
                  <br />
                  <span className="text-green-400">+{item.return.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Stats Component
function QuickStatsSection({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.totalProperties}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Properties</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.activeInvestments}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Investments</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{stats.completedInvestments}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-3xl font-bold text-orange-600">{stats.averageYield.toFixed(1)}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Yield</div>
        </CardContent>
      </Card>
    </div>
  );
}

// Investments Section Component
function InvestmentsSection({ 
  properties, 
  onSellTokens, 
  onDepositTokens,
  refreshing 
}: { 
  properties: InvestmentProperty[]; 
  onSellTokens: () => void; 
  onDepositTokens: () => void;
  refreshing: boolean;
}) {
  if (refreshing) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Updating investments...</span>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-16">
        <Building className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Investments Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Start building your portfolio by investing in properties from the marketplace.
        </p>
        <Button asChild>
          <a href="/investors">Browse Properties</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Investments ({properties.length})
        </h2>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-6">
        {properties.map((property) => (
          <InvestmentPropertyCard 
            key={property.id} 
            property={property} 
            onSellTokens={onSellTokens}
            onDepositTokens={onDepositTokens}
          />
        ))}
      </div>
    </div>
  );
}

// Individual Investment Property Card
function InvestmentPropertyCard({ 
  property, 
  onSellTokens, 
  onDepositTokens 
}: { 
  property: InvestmentProperty; 
  onSellTokens: () => void; 
  onDepositTokens: () => void;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 group">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Property Image - Clickable to property details */}
          <div className="lg:w-48 lg:h-32 w-full h-48 relative">
            <a href={`/investors/${property.propertyId}`} className="block w-full h-full">
              <img
                src={property.propertyImage || "/property-placeholder.jpg"}
                alt={property.propertyName}
                className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {property.propertyType}
              </div>
            </a>
          </div>

          {/* Property Details */}
          <div className="flex-1">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
              <div>
                <a 
                  href={`/investors/${property.propertyId}`}
                  className="hover:text-blue-600 transition-colors"
                >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600">
                  {property.propertyName}
                </h3>
                </a>
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {property.location}
                </div>
              </div>
              <Badge
                variant={property.status === 'active' ? 'default' : 'secondary'}
                className="lg:self-start"
              >
                {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
              </Badge>
            </div>

            {/* Investment Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Investment</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  ${property.initialInvestment.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Current Value</div>
                <div className="font-semibold text-green-600">
                  ${property.currentValue.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Returns</div>
                <div className="font-semibold text-green-600">
                  +${property.totalReturns.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Yield</div>
                <div className="font-semibold text-blue-600">
                  {property.annualYield}%
                </div>
              </div>
            </div>

            {/* Ownership Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Ownership: {property.ownershipPercentage.toFixed(1)}% ({property.tokensOwned} tokens)
                </span>
                <span className="font-semibold">
                  ${property.tokenPrice}/token
                </span>
              </div>
              <Progress value={property.ownershipPercentage} className="h-2" />
            </div>

            {/* Additional Info */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Invested: {new Date(property.investmentDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Monthly Rent: ${property.monthlyRent.toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Next Payout: {new Date(property.nextPayout).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" className="flex-1" onClick={onSellTokens}>
            <DollarSign className="w-4 h-4 mr-2" />
            Sell Tokens
          </Button>
          <Button variant="outline" className="flex-1" onClick={onDepositTokens}>
            <ArrowDown className="w-4 h-4 mr-2" />
            Deposit Tokens to Escrow
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <a href={`/investors/${property.propertyId}`}>
              <TrendingUp className="w-4 h-4 mr-2" />
              View Details
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Transactions Section Component
function TransactionsSection({ transactions, refreshing }: { transactions: InvestorTransactions[], refreshing: boolean }) {
  if (refreshing) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Updating transactions...</span>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16">
        <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Transactions Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Your transaction history will appear here once you start investing.
        </p>
      </div>
    );
  }

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'sell':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'sell':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History ({transactions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${getTypeColor(transaction.type)}`}>
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white capitalize">
                    {transaction.type} - {transaction.property_name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {transaction.time.toLocaleDateString()} • 
                    {transaction.transactionHash && ` TX: ${transaction.transactionHash.slice(0, 8)}...`}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`font-semibold ${
                  transaction.type === 'purchase' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {transaction.type === 'purchase' ? '-' : '+'}${transaction.amount.toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  {getStatusIcon(transaction.type)}
                  <span className="capitalize">Completed</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Documents Section Component
function DocumentsSection({ properties }: { properties: InvestmentProperty[] }) {
  // Filter properties that have documents
  const propertiesWithDocs = properties.filter(prop => 
    prop.documents && prop.documents.length > 0
  );

  if (propertiesWithDocs.length === 0) {
    return (
      <div className="text-center py-16">
        <Download className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Documents Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Property documents including title deeds, rental agreements, and financial reports 
          will appear here once they are uploaded by property managers.
        </p>
      </div>
    );
  }

  // Calculate total documents
  const totalDocuments = propertiesWithDocs.reduce(
    (total, prop) => total + (prop.documents?.length || 0), 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Documents ({totalDocuments})</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Legal documents, contracts, and reports for your investment properties
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {propertiesWithDocs.map((property) => (
            <div key={property.id} className="space-y-4">
              {/* Property Header */}
              <div className="flex items-center gap-3 pb-2 border-b">
                <Building className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {property.propertyName}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {property.location} • {property.documents?.length} documents
                  </p>
                </div>
              </div>

              {/* Documents Grid */}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {property.documents?.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                        <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {doc.type}
                      </Badge>
                    </div>
                    
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                        {doc.name}
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        {doc.size} • {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : 'Date not available'}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        asChild
                      >
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </a>
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        asChild
                      >
                        <a href={doc.url} download>
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Documents Summary */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h5 className="font-medium text-blue-900 dark:text-blue-100">
                Document Types
              </h5>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your documents include title deeds, rental agreements, financial reports, 
                and property management contracts for complete transparency.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading Skeleton Component
function PortfolioSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>

          {/* Chart Skeleton */}
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8"></div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}