"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Wallet, Users, Send, CheckCircle, Loader2, TrendingUp, History, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type DistributionState = 'input' | 'fetching-investors' | 'investors-loaded' | 'distributing' | 'complete';

interface Investor {
    id: string;
    name: string;
    walletAddress: string;
    shares: number;
    percentage: number;
}

// Mock investor data
const mockInvestors: Investor[] = [
    { id: "1", name: "Michael Chen", walletAddress: "0x742d...8f3a", shares: 450, percentage: 45 },
    { id: "2", name: "Sarah Johnson", walletAddress: "0x8a3b...2c1d", shares: 300, percentage: 30 },
    { id: "3", name: "David Martinez", walletAddress: "0x1f4e...9b7c", shares: 150, percentage: 15 },
    { id: "4", name: "Emma Williams", walletAddress: "0x5c2a...6d8e", shares: 100, percentage: 10 }
];

interface DistributionHistory {
    id: string;
    date: string;
    amount: number;
    investorCount: number;
    txHash: string;
    status: 'completed' | 'pending' | 'failed';
    distributions: Array<{
        investorName: string;
        amount: number;
        walletAddress: string;
    }>;
}

// Mock distribution history
const mockHistory: DistributionHistory[] = [
    {
        id: "dist-003",
        date: "2024-03-15T14:30:00",
        amount: 85000,
        investorCount: 4,
        txHash: "0x8f3a2c1d9b7c6d8e4f5a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
        status: 'completed',
        distributions: [
            { investorName: "Michael Chen", amount: 38250, walletAddress: "0x742d...8f3a" },
            { investorName: "Sarah Johnson", amount: 25500, walletAddress: "0x8a3b...2c1d" },
            { investorName: "David Martinez", amount: 12750, walletAddress: "0x1f4e...9b7c" },
            { investorName: "Emma Williams", amount: 8500, walletAddress: "0x5c2a...6d8e" }
        ]
    },
    {
        id: "dist-002",
        date: "2024-02-15T10:15:00",
        amount: 83000,
        investorCount: 4,
        txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
        status: 'completed',
        distributions: [
            { investorName: "Michael Chen", amount: 37350, walletAddress: "0x742d...8f3a" },
            { investorName: "Sarah Johnson", amount: 24900, walletAddress: "0x8a3b...2c1d" },
            { investorName: "David Martinez", amount: 12450, walletAddress: "0x1f4e...9b7c" },
            { investorName: "Emma Williams", amount: 8300, walletAddress: "0x5c2a...6d8e" }
        ]
    },
    {
        id: "dist-001",
        date: "2024-01-15T16:45:00",
        amount: 85000,
        investorCount: 4,
        txHash: "0x9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
        status: 'completed',
        distributions: [
            { investorName: "Michael Chen", amount: 38250, walletAddress: "0x742d...8f3a" },
            { investorName: "Sarah Johnson", amount: 25500, walletAddress: "0x8a3b...2c1d" },
            { investorName: "David Martinez", amount: 12750, walletAddress: "0x1f4e...9b7c" },
            { investorName: "Emma Williams", amount: 8500, walletAddress: "0x5c2a...6d8e" }
        ]
    }
];

interface RentDistributionFlowProps {
    propertyName: string;
    monthlyRevenue: number;
}

export default function PaymentsDistribution({ propertyName, monthlyRevenue }: RentDistributionFlowProps) {
    const [state, setState] = useState<DistributionState>('input');
    const [investors, setInvestors] = useState<Investor[]>([]);
    const [distributionProgress, setDistributionProgress] = useState(0);
    const [openHistoryItems, setOpenHistoryItems] = useState<string[]>([]);

    const rentDistributionSchema = z.object({
        amount: z.number("Rent amount should be a number").gt(0, "Rent amount must be greater than zero"),
    });

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(rentDistributionSchema)
    });

    const rentAmount = watch("amount") || 0;

    function onSubmit(data: z.infer<typeof rentDistributionSchema>) {
        console.log("Data being submitted", data);

        setState('distributing');
        setDistributionProgress(0);

        // Simulate distribution progress
        const interval = setInterval(() => {
            setDistributionProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setState('complete');
                        toast.success("Rent has been successfully distributed to all investors");
                    }, 500);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
    }

    const toggleHistoryItem = (id: string) => {
        setOpenHistoryItems(prev =>
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    function getInvestors() {
        console.log("Getting investors");
        // Start fetching investors
        setState('fetching-investors');

        // Simulate API call to fetch investors
        setTimeout(() => {
            setInvestors(mockInvestors);
            setState('investors-loaded');
        }, 2000);
    }

    const handleReset = () => {
        console.log("Resetting form")
        setState('input');
        reset();
        setInvestors([]);
        setDistributionProgress(0);
    };

    const calculateDistribution = (investor: Investor) => {
        return (rentAmount * investor.percentage / 100).toFixed(2);
    };

    return (
        <section className="space-y-6">
            <Card className="border-primary/20">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                Rent Distribution
                            </CardTitle>
                            <CardDescription>
                                Distribute collected rent to property investors in USDC
                            </CardDescription>
                        </div>
                        {state !== 'input' && state !== 'complete' && (
                            <Badge variant="outline" className="animate-pulse">
                                Processing...
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Step 1: Input Rent Amount */}
                        {state === 'input' && (
                            <div className="space-y-6">
                                <div className="p-2 bg-muted/50 rounded-lg border border-border">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Wallet className="w-5 h-5 text-primary" />
                                        <h3 className="font-semibold">Deposit Rent Collection</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="rent-amount">Rent Amount (USDC)</Label>
                                            <Input
                                                id="rent-amount"
                                                type="number"
                                                placeholder={`Suggested: ${monthlyRevenue.toLocaleString()}`}
                                                {...register("amount", { valueAsNumber: true })}
                                            />
                                            {errors.amount ? (
                                                <p className="text-sm text-red-500 mt-1">
                                                    {errors.amount.message}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Expected monthly revenue: {monthlyRevenue.toLocaleString()} USDC
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    onClick={getInvestors}
                                    className="w-full"
                                    size="lg"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Fetch Investors
                                </Button>
                            </div>
                        )}

                        {/* Step 2: Fetching Investors */}
                        {state === 'fetching-investors' && (
                            <div className="text-center py-12 space-y-4">
                                <div className="flex justify-center">
                                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Fetching Investors</h3>
                                    <p className="text-muted-foreground">
                                        Retrieving list of property investors and their stakes...
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Investors Loaded */}
                        {state === 'investors-loaded' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Users className="w-5 h-5 text-success" />
                                        <h3 className="font-semibold">Investors Retrieved</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Found {investors.length} investors. Review the distribution breakdown below:
                                    </p>

                                    <div className="space-y-3">
                                        {investors.map((investor) => (
                                            <div
                                                key={investor.id}
                                                className="flex items-center justify-between p-3 bg-background rounded-lg border"
                                            >
                                                <div className="flex-1">
                                                    <div className="font-medium">{investor.name}</div>
                                                    <div className="text-xs text-muted-foreground font-mono">
                                                        {investor.walletAddress}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-primary">
                                                        {calculateDistribution(investor)} USDC
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {investor.shares} shares ({investor.percentage}%)
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 pt-4 border-t">
                                        <div className="flex justify-between items-center font-semibold">
                                            <span>Total Distribution:</span>
                                            <span className="text-primary text-lg">{rentAmount} USDC</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full"
                                    size="lg"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Distribute Funds to All Investors
                                </Button>
                            </div>
                        )}

                        {/* Step 4: Distributing */}
                        {state === 'distributing' && (
                            <div className="space-y-6 py-6">
                                <div className="text-center space-y-4">
                                    <div className="flex justify-center">
                                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">Distributing Funds</h3>
                                        <p className="text-muted-foreground">
                                            Processing {investors.length} transactions on the blockchain...
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Distribution Progress</span>
                                        <span className="font-semibold">{distributionProgress}%</span>
                                    </div>
                                    <Progress value={distributionProgress} className="h-3" />
                                </div>

                                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                    {investors.map((investor, index) => (
                                        <div key={investor.id} className="flex items-center gap-3 text-sm">
                                            {distributionProgress > (index * 25) ? (
                                                <CheckCircle className="w-4 h-4 text-success" />
                                            ) : (
                                                <div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-full" />
                                            )}
                                            <span className={distributionProgress > (index * 25) ? "text-success" : "text-muted-foreground"}>
                                                {investor.name} - {calculateDistribution(investor)} USDC
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 5: Complete */}
                        {state === 'complete' && (
                            <div className="space-y-6 py-6">
                                <div className="text-center space-y-4">
                                    <div className="flex justify-center">
                                        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                                            <CheckCircle className="w-10 h-10 text-success" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">Distribution Complete!</h3>
                                        <p className="text-muted-foreground">
                                            Successfully distributed {rentAmount} USDC to {investors.length} investors
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-success/10 border border-success/20 rounded-lg space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Total Distributed:</span>
                                        <span className="font-semibold">{rentAmount} USDC</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Investors Paid:</span>
                                        <span className="font-semibold">{investors.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Transaction Status:</span>
                                        <Badge variant="default" className="bg-primary hover:bg-primary">Confirmed</Badge>
                                    </div>
                                </div>

                                <p className="text-xs text-center text-muted-foreground">
                                    All transaction records have been stored and are available in the financial history
                                </p>

                                <Button
                                    type="button"
                                    onClick={handleReset}
                                    variant="outline"
                                    className="w-full"
                                    size="lg"
                                >
                                    Start New Distribution
                                </Button>
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>

            {/* Distribution History */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" />
                        Distribution History
                    </CardTitle>
                    <CardDescription>
                        Past rent distributions and transaction records
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {mockHistory.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No distribution history yet
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {mockHistory.map((distribution) => (
                                <Collapsible
                                    key={distribution.id}
                                    open={openHistoryItems.includes(distribution.id)}
                                    onOpenChange={() => toggleHistoryItem(distribution.id)}
                                >
                                    <CollapsibleTrigger className="w-full">
                                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Calendar className="w-5 h-5 text-primary" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-medium">
                                                        {new Date(distribution.date).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {new Date(distribution.date).toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex items-center gap-4">
                                                <div>
                                                    <div className="font-semibold text-primary">
                                                        {distribution.amount.toLocaleString()} USDC
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {distribution.investorCount} investors
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant={distribution.status === 'completed' ? 'default' : 'secondary'}
                                                    className={distribution.status === 'completed' ? 'bg-success hover:bg-success' : ''}
                                                >
                                                    {distribution.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <div className="mt-2 p-4 bg-muted/30 rounded-lg space-y-4">
                                            <div className="pb-3 border-b">
                                                <div className="text-xs text-muted-foreground mb-1">Transaction Hash</div>
                                                <div className="font-mono text-sm break-all">{distribution.txHash}</div>
                                            </div>

                                            <div>
                                                <h4 className="font-semibold mb-3 text-sm">Distribution Breakdown</h4>
                                                <div className="space-y-2">
                                                    {distribution.distributions.map((dist, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between p-3 bg-background rounded border text-sm"
                                                        >
                                                            <div>
                                                                <div className="font-medium">{dist.investorName}</div>
                                                                <div className="text-xs text-muted-foreground font-mono">
                                                                    {dist.walletAddress}
                                                                </div>
                                                            </div>
                                                            <div className="font-semibold text-primary">
                                                                {dist.amount.toLocaleString()} USDC
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-3 border-t flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Total Distributed:</span>
                                                <span className="font-semibold text-lg">
                                                    {distribution.amount.toLocaleString()} USDC
                                                </span>
                                            </div>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}