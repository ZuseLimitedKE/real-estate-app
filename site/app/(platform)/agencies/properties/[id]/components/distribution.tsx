"use client"

import { useState, useMemo, useEffect } from "react";
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
import { DistributePropertyInvestor, DistributionHistory, StoreDistributionTransactionDetails } from "@/types/property_details";
import getPropertyInvestors from "@/server-actions/agent/dashboard/getPropertyInvestors";
import { formatAddress } from "@/lib/utils/formatter";
import erc20Abi from "@/smartcontract/abi/ERC20.json";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import distributeFund from "@/server-actions/agent/dashboard/distributeFunds";
import storeDistributionTransactions from "@/server-actions/agent/dashboard/storeDistributionTransactions";

type DistributionState = 'input' | 'fetching-investors' | 'investors-loaded' | 'distributing' | 'complete';

interface RentDistributionFlowProps {
    propertyId: string;
    monthlyRevenue: number;
}

export default function PaymentsDistribution({ propertyId, monthlyRevenue }: RentDistributionFlowProps) {
    const [state, setState] = useState<DistributionState>('input');
    const [investors, setInvestors] = useState<DistributePropertyInvestor[]>([]);
    const [distributionProgress, setDistributionProgress] = useState(0);
    const [openHistoryItems, setOpenHistoryItems] = useState<string[]>([]);
    const [totalDistributions, setTotalDistributions] = useState<number>(0);
    const [distributionHistory, setDistributionHistory] = useState<DistributionHistory[]>([]);

    const { isConnected, address } = useAccount();
    const USDC = process.env.NEXT_PUBLIC_USDC_TOKEN as `0x${string}`;
    const { data: decimalsData } = useReadContract({
        address: USDC,
        abi: erc20Abi.abi,
        functionName: "decimals",
        query: { enabled: Boolean(USDC) },
    });

    const decimals =
        typeof decimalsData === "bigint"
            ? Number(decimalsData)
            : Number(decimalsData ?? 6);

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

    const parsedAmount = useMemo(() => {
        if (!totalDistributions || isNaN(Number(totalDistributions))) return BigInt(0);
        try {
            return parseUnits(totalDistributions.toString(), decimals);
        } catch {
            return BigInt(0);
        }
    }, [totalDistributions, decimals]);

    const {
        writeContract: writeDeposit,
        data: depositHash,
        isPending: isDepositPending,
        reset: resetDeposit,
        error: depositError,
    } = useWriteContract();

    const { isLoading: waitingDeposit, isSuccess: deposited } =
        useWaitForTransactionReceipt({ hash: depositHash });
    const busy =
        isDepositPending || waitingDeposit;

    // Get distribution history at the beginning
    useEffect(() => {
        async function getDistributionHistory() {

        }

        getDistributionHistory();
    });

    // Handle deposit success
    useEffect(() => {
        async function distribute() {
            if (deposited) {
                try {
                    console.log("✅ Deposit successful!");
                    toast.success("USDC deposited to escrow");

                    // Divide investor funds
                    const fundedInvestors: StoreDistributionTransactionDetails = {
                        propertyID: propertyId,
                        totalDistributed: totalDistributions,
                        args: []
                    };
                    for (let i = 0; i < investors.length; i++) {
                        const transaction = await distributeFund(
                            investors[i],
                            rentAmount,
                            decimals,
                            USDC
                        );

                        fundedInvestors.args.push({
                            investorAddress: investors[i].walletAddress,
                            sentAmount: (investors[i].percentage / 100) * rentAmount,
                            transaction
                        })
                        setDistributionProgress((i / investors.length) * 100);
                        console.log("Transaction", transaction);
                    }

                    await storeDistributionTransactions(fundedInvestors);
                    toast.success("Rent has been successfully distributed to all investors");
                    setState('complete');
                } catch (err) {
                    console.error("Error distributing funds", err);
                    toast.error("Could not distribute funds");
                    setState('input')
                }
            }
        }

        distribute();
    }, [deposited, resetDeposit]);

    useEffect(() => {
        if (depositError) {
            console.error("❌ Deposit error:", depositError);
            toast.error(depositError.message || "Deposit failed");
            setState("input");
        }
    }, [depositError]);

    const sendFundsToAdmin = async () => {
        try {
            if (!isConnected) {
                toast.error("Connect your wallet first");
                return;
            }
            if (!USDC) {
                toast.error("Missing contract addresses");
                console.error("Missing addresses:", { USDC });
                return;
            }

            if (!process.env.NEXT_PUBLIC_ADMIN_ACCOUNT) {
                toast.error("Missing admin account");
                console.error("set NEXT_PUBLIC_ADMIN_ACCOUNT in env");
                return;
            }

            if (parsedAmount <= BigInt(0)) {
                toast.error("Invalid distribution amount");
                setState('input');
                return;
            }

            writeDeposit({
                address: USDC,
                abi: erc20Abi.abi,
                functionName: "transfer",
                args: [process.env.NEXT_PUBLIC_ADMIN_ACCOUNT, parsedAmount]
            });
        } catch (e: any) {
            console.error("❌ Approval error:", e);
            toast.error(e?.message || "Approval failed");
            setState("input");
        }
    };

    async function onSubmit(data: z.infer<typeof rentDistributionSchema>) {
        try {
            console.log("Data being submitted", data);

            setState('distributing');
            setDistributionProgress(0);

            // Send funds to admin
            await sendFundsToAdmin();

            // Admin will then send funds to each of the investors as progress updates
            // This is in the useEffect that's handling succesful deposit
        } catch (err) {
            console.error("Error distributing");
            setState('input');
            toast.error("Could not distribute");
        }
    }

    const toggleHistoryItem = (id: string) => {
        setOpenHistoryItems(prev =>
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    async function getInvestors() {
        try {
            console.log("Getting investors");
            // Start fetching investors
            setState('fetching-investors');

            const investors = await getPropertyInvestors(propertyId);
            setInvestors(investors);
            setTotalDistributions(getTotalDistributions(investors));
            setState('investors-loaded');
        } catch (err) {
            console.error("Error getting investors", err);
            toast.error("Could not get property investors");
            setState('input');
        }
    }

    const handleReset = () => {
        console.log("Resetting form")
        setState('input');
        reset();
        setInvestors([]);
        setDistributionProgress(0);
    };

    const calculateDistribution = (investor: DistributePropertyInvestor) => {
        return (rentAmount * investor.percentage / 100).toFixed(2);
    };

    function getTotalDistributions(investors: DistributePropertyInvestor[]): number {
        let total = 0;
        for (const investor of investors) {
            total += (rentAmount * (investor.percentage / 100))
        }

        return total;
    }

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
                                        {investors.map((investor, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-background rounded-lg border"
                                            >
                                                <div className="flex-1">
                                                    {/* <div className="font-medium">{investor.name}</div> */}
                                                    <div className="text-muted-foreground font-mono">
                                                        {formatAddress(investor.walletAddress)}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-primary">
                                                        {calculateDistribution(investor)} USDC
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {investor.shares} shares ({investor.percentage.toFixed(2)}%)
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 pt-4 border-t">
                                        <div className="flex justify-between items-center font-semibold">
                                            <span>Total Distribution:</span>
                                            <span className="text-primary text-lg">{totalDistributions.toFixed(2)} USDC</span>
                                        </div>
                                    </div>
                                </div>

                                {investors.length > 0 ? (
                                    <Button
                                        className="w-full"
                                        size="lg"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        Distribute Funds to All Investors
                                    </Button>
                                ) : (
                                    <Button
                                        variant="destructive"
                                        type="button"
                                        onClick={handleReset}
                                        className="w-full"
                                        size="lg"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        Stop Distribution
                                    </Button>
                                )}
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
                                        <div key={index} className="flex items-center gap-3 text-sm">
                                            {distributionProgress > (index * 25) ? (
                                                <CheckCircle className="w-4 h-4 text-success" />
                                            ) : (
                                                <div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-full" />
                                            )}
                                            <span className={distributionProgress > (index * 25) ? "text-success" : "text-muted-foreground"}>
                                                {/* {investor.name} - {calculateDistribution(investor)} USDC */}
                                                some temp text for now
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