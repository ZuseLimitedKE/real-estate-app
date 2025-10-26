"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Zap,
    Clock,
    Calculator,
    TrendingUp,
    Shield,
    AlertCircle,
    CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useWriteContract, useAccount, useTransactionReceipt, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import marketplaceAbi from "@/smartcontract/abi/MarketPlace.json";
import { createOrder } from "@/server-actions/marketplace/actions";
import { getTokenPrice, purchaseTokensFromAdmin } from "@/server-actions/tokens/purchase-tokens";
import erc20Abi from "@/smartcontract/abi/ERC20.json";
import { decodeViemError } from "../../portfolio/_components/decode-viem";
import { parseUnits } from 'viem';
import { getAssociatedTokens } from "@/server-actions/tokens/purchase-tokens";
import associateABI from "@/smartcontract/abi/associate";
import { TokenId } from "@hashgraph/sdk";
// import { ethers } from "ethers";
const MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT as `0x${string}`;
const PROPERTY_TOKEN = process.env.NEXT_PUBLIC_PROPERTY_TOKEN as `0x${string}`;
const ADMIN_ACCOUNT = process.env.NEXT_PUBLIC_HEDERA_EVM_ADDRESS as `0x${string}`;
interface InvestmentFormProps {
    propertyId: string;
    propertyName: string;
    tokenAddress: string;
    isOpen: boolean;
    onClose: () => void;
    setOpenDepositUSDCDialog: (open: boolean) => void;
}

const getNonce = () => new Date().getTime();
const getExpiry = () => Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days from now
const USDC = process.env.NEXT_PUBLIC_USDC_TOKEN as `0x${string}`;;

export default function InvestmentForm({
    propertyId,
    propertyName,
    tokenAddress,
    isOpen,
    onClose,
    setOpenDepositUSDCDialog
}: InvestmentFormProps) {
    const [tokenAmount, setTokenAmount] = useState<string>("");
    const [pricePerToken, setPricePerToken] = useState<string>("");
    const [actualPricePerToken, setActualPricePerToken] = useState<number>(20);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [transactionData, setTransactionData] = useState<{
        hash?: string;
        amount?: number;
        type?: "instant" | "marketplace";
    }>({});
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
    const publicClient = usePublicClient();
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const { data: receipt, isSuccess: isConfirmed } = useTransactionReceipt({
        hash: txHash,
    });

    const nonce = getNonce();
    const expiry = getExpiry();

    // Calculate totals
    const parsedTokenAmount = tokenAmount ? parseFloat(tokenAmount) : 0;
    const parsedPricePerToken = pricePerToken ? parseFloat(pricePerToken) : 0;
    const totalAmount = parsedTokenAmount * parsedPricePerToken;

    // Determine if this is instant purchase or marketplace order
    const isInstantPurchase = parsedPricePerToken >= actualPricePerToken && parsedPricePerToken > 0;
    const isMarketplaceOrder = parsedPricePerToken < actualPricePerToken && parsedPricePerToken > 0;
    const {
        writeContract: transfer,
        writeContractAsync: transferAsync,
        data: transferHash,
        isPending: isApprovePending,
        reset: resetApprove,
        error: transferError,
    } = useWriteContract();
    const {
        data: approveReceipt,
        isLoading: waitingApprove,
        isSuccess: approved,
        isError: approveTxError,
    } = useWaitForTransactionReceipt({ hash: transferHash });
    const {
        writeContract: associate,
        writeContractAsync: associateAsync,
        data: associateHash,
        isPending: isAssociatePending,
        reset: resetAssociate,
        error: associateError,
    } = useWriteContract();
    const {
        data: associateReceipt,
        isLoading: waitingAssociate,
        isSuccess: associated,
        isError: associateTxError,
    } = useWaitForTransactionReceipt({ hash: associateHash });
    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setTokenAmount("");
            setPricePerToken("");
            setShowSuccessModal(false);
            setTransactionData({});
        }
    }, [isOpen]);

    // Handle transaction confirmation
    useEffect(() => {
        if (isConfirmed && receipt) {
            console.log("Transaction confirmed:", receipt);

            if (receipt.status === "success") {
                setTransactionData({
                    hash: txHash,
                    amount: totalAmount,
                    type: "marketplace",
                });

                setTokenAmount("");
                setPricePerToken("");
                setShowSuccessModal(true);
                toast.success("Marketplace order created successfully!");
            } else {
                console.error("Transaction reverted:", receipt);
                toast.error("Transaction failed!");
            }

            setTxHash(undefined);
            setIsLoading(false);
        }
    }, [isConfirmed, receipt, txHash, totalAmount]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!tokenAmount || !pricePerToken || totalAmount <= 0) {
            toast.error("Please enter valid amounts");
            return;
        }
        if (!publicClient) {
            toast.error("An error occured, reload page");
            return
        }
        if (!address) {
            toast.error("Please connect your wallet.");
            return;
        }

        setIsLoading(true);

        try {
            if (isInstantPurchase) {
                // Instant purchase from admin (price >= actual price)
                console.log("💰 Instant purchase from admin - price per token:", parsedPricePerToken, ">=", actualPricePerToken);
                //Check id useer is associated to token
                try {
                    const tokens = await getAssociatedTokens(address);
                    console.log("Tokens", tokens);
                    const isAssociated = tokens.includes(tokenAddress);
                    const evmToken = TokenId.fromString(tokenAddress).toEvmAddress() as `0x${string}`;
                    console.log("EVM token", evmToken)
                    if (!evmToken) {
                        toast.error("Failed to get token EVM address");
                        setIsLoading(false);
                        return;
                    }
                    if (!isAssociated) {
                        toast.info("Token not associated to your account, initiating token association");
                        associateAsync({
                            address: `0x${evmToken}`,
                            abi: associateABI,
                            functionName: "associate"
                        })
                        setIsLoading(false);
                        return;
                    }
                }
                catch (error) {
                    console.error("Error related to token association", error);
                    toast.error("Failed to verify token association. Please try again.");
                    setIsLoading(false);
                    return;
                }
                //First, the user sends usdc to the admin account
                //TODO: Update the decimals you are using to actual usdc decimals
                const PARSED_AMOUNT = parseUnits(totalAmount.toString(), 0);
                try {
                    await publicClient.simulateContract({
                        account: address!,
                        address: USDC,
                        abi: erc20Abi.abi,
                        functionName: "transfer",
                        args: [ADMIN_ACCOUNT, PARSED_AMOUNT],
                    });
                } catch (e: any) {
                    const msg = decodeViemError(e);
                    console.error("❌ Approve simulation failed:", e, msg);
                    toast.error(msg || "Approval simulation failed");
                    setIsLoading(false)
                    return;
                }
                //Now try sending the usdc to the admin
                try {
                    const transferTx = await transferAsync({
                        address: USDC,
                        abi: erc20Abi.abi,
                        functionName: "transfer",
                        args: [ADMIN_ACCOUNT, PARSED_AMOUNT],
                    });
                    console.log("USDC Transfer TX submitted:", transferTx);
                } catch (e: any) {
                    const msg = decodeViemError(e);
                    console.error("❌ Transfer failed:", e, msg);
                    toast.error(msg || "Transfer failed");
                    setIsLoading(false);
                    return;
                }
                console.log("Property ID", propertyId)
                const result = await purchaseTokensFromAdmin(tokenAddress, parsedTokenAmount, address);

                if (result) {
                    setTransactionData({
                        hash: result,
                        amount: totalAmount,
                        type: "instant",
                    });
                    setTokenAmount("");
                    setPricePerToken("");
                    setShowSuccessModal(true);
                    toast.success("Tokens purchased successfully!");
                    setIsLoading(false);
                } else {
                    throw new Error("Purchase failed, contact admin");
                }
            } else if (isMarketplaceOrder) {
                // Marketplace order (price < actual price)
                console.log("💱 Creating marketplace order - price per token:", parsedPricePerToken, "<", actualPricePerToken);

                setOpenDepositUSDCDialog(true)
                toast.success("Order submitted to marketplace for matching");
            } else {
                toast.error("Please enter a price per token");
                setIsLoading(false);
            }
        } catch (err: any) {
            console.error("Transaction error:", err);
            toast.error(err?.message || "Transaction rejected or failed to submit.");
            setIsLoading(false);
        }
    };

    const handleSuccessClose = () => {
        setShowSuccessModal(false);
        onClose();
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Invest in {propertyName}
                        </DialogTitle>
                        <DialogDescription>
                            Enter your investment amount and desired price per token
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-2">
                        {/* Current Market Price Display */}
                        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Current Market Price</p>

                                        <p className="text-2xl font-bold text-primary">${actualPricePerToken.toFixed(2)}</p>

                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">per token</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Token Amount Input */}
                        <div className="space-y-2">
                            <Label htmlFor="tokenAmount">Number of Tokens</Label>
                            <div className="relative">
                                <Input
                                    id="tokenAmount"
                                    type="number"
                                    placeholder="Enter number of tokens"
                                    value={tokenAmount}
                                    onChange={(e) => setTokenAmount(e.target.value)}
                                    min="1"
                                    step="1"
                                    className="pr-20"
                                    required
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    tokens
                                </div>
                            </div>
                        </div>

                        {/* Price Per Token Input */}
                        <div className="space-y-2">
                            <Label htmlFor="pricePerToken">Your Price Per Token</Label>
                            <div className="relative">
                                <Input
                                    id="pricePerToken"
                                    type="number"
                                    placeholder={`Min: $${actualPricePerToken.toFixed(2)}`}
                                    value={pricePerToken}
                                    onChange={(e) => setPricePerToken(e.target.value)}
                                    min="0.01"
                                    step="0.01"
                                    className="pr-12"
                                    required
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    USD
                                </div>
                            </div>

                            {/* Price comparison indicator */}
                            {parsedPricePerToken > 0 && (
                                <div className="flex items-start gap-2 text-xs">
                                    {isInstantPurchase ? (
                                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                            <Zap className="w-3 h-3" />
                                            <span>Instant purchase from admin</span>
                                        </div>
                                    ) : isMarketplaceOrder ? (
                                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                            <Clock className="w-3 h-3" />
                                            <span>Marketplace order - awaiting match</span>
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        {/* Investment Summary */}
                        {tokenAmount && pricePerToken && (
                            <Card className="bg-muted/50">
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Tokens</span>
                                            <span className="font-medium">{tokenAmount}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Price per token</span>
                                            <span className="font-medium">${parsedPricePerToken.toFixed(2)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Total Investment</span>
                                            <span className="text-lg font-semibold text-primary">
                                                ${totalAmount.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Order Type Explanation */}
                        {parsedPricePerToken > 0 && (
                            <Card className={
                                isInstantPurchase
                                    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                                    : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                            }>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        {isInstantPurchase ? (
                                            <>
                                                <Zap className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                                <div className="text-sm">
                                                    <p className="font-medium text-green-800 dark:text-green-200 mb-1">
                                                        Instant Purchase
                                                    </p>
                                                    <p className="text-green-700 dark:text-green-300">
                                                        Your price is at or above market price. Tokens will be purchased instantly from admin inventory.
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                                <div className="text-sm">
                                                    <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                                                        Marketplace Order
                                                    </p>
                                                    <p className="text-amber-700 dark:text-amber-300">
                                                        Your price is below market price. Order will be placed in the marketplace and matched when a seller accepts your price.
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Security Notice */}
                        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800 dark:text-blue-200">
                                <p className="font-medium">Secure Transaction</p>
                                <p className="text-xs mt-1">
                                    Your investment is protected by smart contracts and blockchain technology.
                                </p>
                            </div>
                        </div>
                    </form>

                    {/* Action Buttons - Sticky at bottom */}
                    <div className="flex gap-3 pt-4 border-t flex-shrink-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            onClick={handleSubmit}
                            className="flex-1"
                            disabled={
                                !tokenAmount ||
                                !pricePerToken ||
                                totalAmount <= 0 ||
                                isLoading

                            }
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Calculator className="w-4 h-4 mr-2" />
                                    {isInstantPurchase ? "Buy Instantly" : "Create Order"}
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <CheckCircle className="w-5 h-5" />
                            {transactionData.type === "instant" ? "Purchase Successful!" : "Order Created!"}
                        </DialogTitle>
                        <DialogDescription>
                            {transactionData.type === "instant"
                                ? "Your tokens have been purchased and added to your portfolio"
                                : "Your order has been placed in the marketplace and will be matched with a seller"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Tokens
                                    </span>
                                    <span className="font-medium">{tokenAmount}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Price Per Token
                                    </span>
                                    <span className="font-medium">${pricePerToken}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Total Amount
                                    </span>
                                    <span className="font-medium">${totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Property
                                    </span>
                                    <span className="font-medium text-xs">{propertyName}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Type
                                    </span>
                                    <Badge variant={transactionData.type === "instant" ? "default" : "secondary"}>
                                        {transactionData.type === "instant" ? (
                                            <><Zap className="w-3 h-3 mr-1" />Instant</>
                                        ) : (
                                            <><Clock className="w-3 h-3 mr-1" />Marketplace</>
                                        )}
                                    </Badge>
                                </div>
                                {transactionData.hash && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Transaction
                                        </span>
                                        <span className="font-mono text-xs text-primary">
                                            {transactionData.hash.slice(0, 10)}...
                                            {transactionData.hash.slice(-8)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <div className="text-sm">
                                <p className="font-medium">Next Steps</p>
                                <p className="text-muted-foreground">
                                    {transactionData.type === "instant"
                                        ? "View your investment in the portfolio dashboard"
                                        : "Monitor your order status in the marketplace"}
                                </p>
                            </div>
                        </div>

                        <Button onClick={handleSuccessClose} className="w-full">
                            View Portfolio
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
