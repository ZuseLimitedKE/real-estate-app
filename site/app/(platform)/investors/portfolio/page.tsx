// site/app/(platform)/investors/portfolio/page.tsx
"use client";
import { useState } from "react";
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
} from "lucide-react";
import {
  mockPortfolioData,
  mockInvestmentProperties,
  mockTransactions,
  type PortfolioOverview,
  type InvestmentProperty,
  type Transaction,
  type Dividend,
} from "@/types/portfolio";
import DepositUSDC from "./_components/DepositUSDC";
import { UsdcBalanceCard } from "./_components/UsdcBalanceCard";
import { PropertyTokensInEscrowCard } from "./_components/PropertyTokensInEscrowCard";
import DepositPropertyTokens from "./_components/DepositPropertyTokens";
import { useWriteContract } from "wagmi";
import marketplaceAbi from "@/smartcontract/abi/MarketPlace.json";
import InitSellOrderDialog from "./_components/InitSellOrderDialog";

// const MARKETPLACE = "0x00000000000000000000000000000000006bbea0"
// const USDC = "0x00000000000000000000000000000000006bc911";

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [ openDepositUSDCDialog, setOpenDepositUSDCDialog ] = useState(false);
  const [ openDepositTokensDialog, setOpenDepositTokensDialog ] = useState(false);
  const [initSellOrder, setInitSellOrder] = useState(false)
  // const { writeContract, isPending } = useWriteContract();

  // const handleAssociate = async () => {
  //   await writeContract({
  //     address: MARKETPLACE,
  //     abi: marketplaceAbi.abi,
  //     functionName: "tokenAssociate",
  //     args: [USDC],
  //   });
  // };

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
          <div className="space-x-2">
            <Button onClick={() => setOpenDepositUSDCDialog(true)}>
              <Plus className="w-4 h-4" />
              <span>Deposit USDC</span>
            </Button>
            {/* <Button onClick={() => setOpenDepositTokensDialog(true)}>
              <Plus className="w-4 h-4" />
              <span>Deposit Property Tokens</span>
            </Button> */}
            {/* <button
              onClick={handleAssociate}
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {isPending ? "Associating..." : "Associate Contract with USDC"}
            </button> */}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full h-full grid-cols-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1.5 rounded-2xl border">
            <TabsTrigger value="overview" className="flex items-center gap-2 py-3 cursor-pointer">
              <PieChart className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="investments" className="flex items-center gap-2 py-3 cursor-pointer">
              <Building className="w-4 h-4" />
              Investments
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
            <PortfolioOverviewSection data={mockPortfolioData} />
            <PerformanceChart data={mockPortfolioData.performanceChart} />
            <QuickStatsSection stats={mockPortfolioData.quickStats} />
          </TabsContent>

          {/* Investments Tab */}
          <TabsContent value="investments">
            <InvestmentsSection
             properties={mockInvestmentProperties} 
             onSellTokens={() => setInitSellOrder(true)}
             onDepositTokens={() => setOpenDepositTokensDialog(true)} 
            />
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <TransactionsSection transactions={mockTransactions} />
          </TabsContent>

          {/* Dividends Tab */}
          <TabsContent value="dividends">
            <DividendsSection />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <DocumentsSection />
          </TabsContent>
        </Tabs>
      </div>
      <DepositUSDC
        open={openDepositUSDCDialog}
        setOpen={setOpenDepositUSDCDialog}
        onSuccess={() => {
          // Optional: Handle success (e.g., refetch balances)
          console.log("Deposit successful!");
        }}
      />
      <DepositPropertyTokens
        open={openDepositTokensDialog}
        setOpen={setOpenDepositTokensDialog}
        onSuccess={() => {
          // Optional: Handle success (e.g., refetch balances)
          console.log("Deposit successful!");
        }}
      />      
      <InitSellOrderDialog
        open={initSellOrder}
        onOpenChange={setInitSellOrder}
      />
    </div>
  );
}

// Portfolio Overview Component
function PortfolioOverviewSection({ data }: { data: PortfolioOverview }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
          <DollarSign className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${data.totalInvestment.toLocaleString()}
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
            ${data.currentValue.toLocaleString()}
          </div>
          <p className="text-xs text-green-100">
            +${data.totalReturns.toLocaleString()} total returns
          </p>
        </CardContent>
      </Card>

      <PropertyTokensInEscrowCard />

      <UsdcBalanceCard />
    </div>
  );
}

// Performance Chart Component
function PerformanceChart({ data }: { data: any[] }) {
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
                  <span className="text-green-400">+{item.return}%</span>
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
          <div className="text-3xl font-bold text-orange-600">{stats.averageYield}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Yield</div>
        </CardContent>
      </Card>
    </div>
  );
}

// Investments Section Component
function InvestmentsSection({ properties, onSellTokens, onDepositTokens }: { properties: InvestmentProperty[]; onSellTokens: () => void; onDepositTokens: () => void; }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Investments
        </h2>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Property Image */}
                <div className="lg:w-48 lg:h-32 w-full h-48">
                  <img
                    src={property.propertyImage}
                    alt={property.propertyName}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Property Details */}
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                        {property.propertyName}
                      </h3>
                      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {property.location}
                      </div>
                    </div>
                    <Badge
                      variant={
                        property.status === 'active' ? 'default' :
                        property.status === 'matured' ? 'secondary' : 'outline'
                      }
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
                        Ownership: {property.ownershipPercentage}% ({property.tokensOwned} tokens)
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
                <Button variant="outline" className="flex-1">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Performance
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Transactions Section Component
function TransactionsSection({ transactions }: { transactions: Transaction[] }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'sale':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'dividend':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${getTypeColor(transaction.type)}`}>
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white capitalize">
                    {transaction.type} - {transaction.propertyName}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(transaction.date).toLocaleDateString()} • 
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
                  {getStatusIcon(transaction.status)}
                  <span className="capitalize">{transaction.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Dividends Section Component
function DividendsSection() {
  const mockDividends = [
    {
      id: 'div1',
      propertyId: 'prop1',
      propertyName: 'Luxury Apartment Complex - Westlands',
      amount: 2300,
      date: '2024-06-30',
      period: 'Q2 2024',
      status: 'paid' as const,
    },
    {
      id: 'div2',
      propertyId: 'prop2',
      propertyName: 'Commercial Tower - Upper Hill',
      amount: 1850,
      date: '2024-06-30',
      period: 'Q2 2024',
      status: 'paid' as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Dividend History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockDividends.map((dividend) => (
            <div
              key={dividend.id}
              className="flex items-center justify-between p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50/50 dark:bg-green-900/20"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                  <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {dividend.propertyName}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Period: {dividend.period} • Paid: {new Date(dividend.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xl font-bold text-green-600">
                  +${dividend.amount.toLocaleString()}
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {dividend.status.charAt(0).toUpperCase() + dividend.status.slice(1)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Documents Section Component
function DocumentsSection() {
  const mockDocuments = [
    {
      id: 'doc1',
      name: 'Portfolio Summary Report - Q3 2024',
      type: 'report',
      url: '/documents/portfolio-q3-2024.pdf',
      uploadDate: '2024-09-30',
      size: '2.1 MB',
    },
    {
      id: 'doc2',
      name: 'Tax Document - FY 2023/2024',
      type: 'tax',
      url: '/documents/tax-2024.pdf',
      uploadDate: '2024-08-15',
      size: '1.8 MB',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {doc.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Uploaded: {new Date(doc.uploadDate).toLocaleDateString()} • Size: {doc.size}
                  </div>
                </div>
              </div>
              
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}