"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  TrendingUp,
  Calendar,
  Building,
  Users,
  DollarSign,
  ExternalLink,
  Download,
  Filter,
  RefreshCw,
  PieChart,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { getInvestorDistributionsByAddress } from "@/server-actions/portfolio/getInvestorDistributions";

interface InvestorDistribution {
  id: string;
  propertyId: string;
  propertyName: string;
  unitName?: string;
  date: Date;
  amount: number;
  transactionHash: string;
  status: 'completed' | 'pending' | 'failed';
  totalDistribution: number;
  investorCount: number;
}

interface DistributionStats {
  totalReceived: number;
  totalDistributions: number;
  averageDistribution: number;
  largestDistribution: number;
  byProperty: { [key: string]: number };
  byMonth: { [key: string]: number };
}

export default function RentDistributions() {
  const [distributions, setDistributions] = useState<InvestorDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [openItems, setOpenItems] = useState<string[]>([]);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      loadDistributions();
    } else if (!isConnected) {
      setLoading(false);
    }
  }, [address, isConnected]);

  const loadDistributions = async () => {
    if (!address) {
      toast.error("Please connect your wallet to view distributions");
      return;
    }

    try {
      setLoading(true);
      const data = await getInvestorDistributionsByAddress(address);
      setDistributions(data);
    } catch (error) {
      console.error("Failed to load distributions:", error);
      toast.error("Failed to load rent distributions");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }
    
    setRefreshing(true);
    await loadDistributions();
    setRefreshing(false);
    toast.success("Distributions updated");
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <RefreshCw className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <DollarSign className="w-4 h-4 text-red-500" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const filteredDistributions = distributions.filter(dist => {
    if (activeTab === "all") return true;
    return dist.status === activeTab;
  });

  // Calculate statistics
  const stats: DistributionStats = {
    totalReceived: distributions.reduce((sum, dist) => sum + dist.amount, 0),
    totalDistributions: distributions.length,
    averageDistribution: distributions.length > 0 
      ? distributions.reduce((sum, dist) => sum + dist.amount, 0) / distributions.length 
      : 0,
    largestDistribution: distributions.length > 0 
      ? Math.max(...distributions.map(dist => dist.amount)) 
      : 0,
    byProperty: distributions.reduce((acc, dist) => {
      const key = dist.unitName ? `${dist.propertyName} - ${dist.unitName}` : dist.propertyName;
      acc[key] = (acc[key] || 0) + dist.amount;
      return acc;
    }, {} as { [key: string]: number }),
    byMonth: distributions.reduce((acc, dist) => {
      const monthYear = new Date(dist.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      acc[monthYear] = (acc[monthYear] || 0) + dist.amount;
      return acc;
    }, {} as { [key: string]: number })
  };

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getExplorerUrl = (txHash: string) => {
    // Hedera testnet explorer - adjust for mainnet if needed
    return `https://hashscan.io/testnet/transaction/${txHash}`;
  };

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Wallet Not Connected
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please connect your wallet to view your rent distributions.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Your wallet address is used to identify your distributions across all properties.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (loading) {
    return <DistributionsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Rent Distributions
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track your rental income from property investments
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Received
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.totalReceived)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Distributions
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalDistributions}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Average Distribution
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.averageDistribution)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <PieChart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Largest Distribution
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.largestDistribution)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution History */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Distribution History</CardTitle>
              <CardDescription>
                All rent distributions you've received from your investments
              </CardDescription>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDistributions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No distributions found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {activeTab === "all" 
                  ? "You haven't received any rent distributions yet."
                  : `No ${activeTab} distributions found.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDistributions.map((distribution) => (
                <Collapsible
                  key={distribution.id}
                  open={openItems.includes(distribution.id)}
                  onOpenChange={() => toggleItem(distribution.id)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex flex-col md:flex-row items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                              {distribution.propertyName}
                              {distribution.unitName && ` - ${distribution.unitName}`}
                            </h4>
                            <Badge variant={getStatusVariant(distribution.status)} className="flex-shrink-0">
                              {getStatusIcon(distribution.status)}
                              <span className="ml-1 capitalize">{distribution.status}</span>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(distribution.date)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {distribution.investorCount} investors
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(distribution.amount)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Total: {formatCurrency(distribution.totalDistribution)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-2 p-4 bg-muted/30 rounded-lg space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-sm mb-2">Distribution Details</h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Your Share:</span>
                              <span className="font-medium">{formatCurrency(distribution.amount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Total Distributed:</span>
                              <span className="font-medium">{formatCurrency(distribution.totalDistribution)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Investors Paid:</span>
                              <span className="font-medium">{distribution.investorCount}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-2">Transaction</h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Status:</span>
                              <Badge variant={getStatusVariant(distribution.status)}>
                                <span className="capitalize">{distribution.status}</span>
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-400">Transaction:</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-6 text-xs"
                              >
                                <a
                                  href={getExplorerUrl(distribution.transactionHash)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DistributionsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-20" />
                </div>
                <Skeleton className="w-12 h-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Distribution List Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg mb-4">
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}