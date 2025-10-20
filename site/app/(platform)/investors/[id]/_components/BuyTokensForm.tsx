"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Wallet,
  CreditCard,
  CheckCircle,
  Calculator,
  Coins,
  TrendingUp,
  Shield,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useWriteContract, useAccount, useTransactionReceipt } from "wagmi";
import marketplaceAbi from "@/smartcontract/abi/MarketPlace.json";

const MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT as `0x${string}`;
const PROPERTY_TOKEN = process.env.NEXT_PUBLIC_PROPERTY_TOKEN as `0x${string}`;

interface BuyTokensFormProps {
  propertyId: string;
  propertyName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface PaymentOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
}

const paymentOptions: PaymentOption[] = [
  {
    id: "wallet",
    name: "Pay with Wallet",
    description: "Connect your Web3 wallet",
    icon: <Wallet className="w-4 h-4" />,
    available: true,
  },
  {
    id: "stripe",
    name: "Pay with Stripe",
    description: "Credit card or bank transfer",
    icon: <CreditCard className="w-4 h-4" />,
    available: true,
  },
  {
    id: "full",
    name: "Pay Fully",
    description: "Complete payment upfront",
    icon: <CheckCircle className="w-4 h-4" />,
    available: true,
  },
  {
    id: "partial",
    name: "Pay Partially",
    description: "Pay in installments",
    icon: <Clock className="w-4 h-4" />,
    available: false, // Simulating this option as not available
  },
];

import {
  getTokenPrice,
  purchaseTokens,
} from "@/server-actions/tokens/purchase-tokens";

export default function BuyTokensForm({
  propertyId,
  propertyName,
  isOpen,
  onClose,
}: BuyTokensFormProps) {
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [pricePerToken, setPricePerToken] = useState<number>(0);
  const [nonce, setNonce] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [transactionData, setTransactionData] = useState<{
    hash?: string;
    amount?: number;
  }>({});
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { address } = useAccount();
  const { writeContractAsync, isError } = useWriteContract();
  const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed } = useTransactionReceipt({
    hash: txHash,
  });

  // Calculate total amount
  const totalAmount = tokenAmount ? parseFloat(tokenAmount) * pricePerToken : 0;

  // Fetch token price on component mount
  useEffect(() => {
    const fetchPrice = async () => {
      setIsLoadingPrice(true);
      try {
        const result = await getTokenPrice(propertyId);
        if (result.success && result.pricePerToken) {
          setPricePerToken(result.pricePerToken);
        } else {
          console.error("Failed to fetch token price:", result.message);
        }
      } catch (error) {
        console.error("Failed to fetch token price:", error);
      } finally {
        setIsLoadingPrice(false);
      }
    };

    if (isOpen) {
      fetchPrice();
    }
  }, [propertyId, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTokenAmount("");
      setSelectedPayment("");
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
        });
        setNonce("");
        setTokenAmount("");
        setShowSuccessModal(true);
        toast.success("Transaction successful!");
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

    if (!tokenAmount || !selectedPayment || totalAmount <= 0 || !nonce) {
      return;
    }
    if (!address) {
      toast.error("Please connect your wallet.");
      return;
    }

    setIsLoading(true);

    try {    
      const hash = await writeContractAsync({
        address: MARKETPLACE,
        abi: marketplaceAbi.abi,
        functionName: "initBuyOrder",
        args: [BigInt(nonce), PROPERTY_TOKEN, BigInt(tokenAmount)],
      });
    
      console.log("Buy order TX submitted:", hash);
      setTxHash(hash);
    } catch (err) {
      console.error("Transaction error:", err);
      toast.error("Transaction rejected or failed to submit.");
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
        <DialogContent className="sm:max-w-xl max-h-[700px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              Buy Tokens
            </DialogTitle>
            <DialogDescription>
              Invest in {propertyName} by purchasing fractional ownership tokens
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Nonce Input */}
            <div className="space-y-2">
              <label htmlFor="nonce" className="text-sm font-medium">
                Nonce
              </label>
              <Input
                placeholder="Nonce (e.g. 1)"
                value={nonce}
                onChange={(e) => setNonce(e.target.value)}
              />
            </div>
            {/* Token Amount Input */}
            <div className="space-y-2">
              <label htmlFor="tokenAmount" className="text-sm font-medium">
                Number of Tokens
              </label>
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

            {/* Price Information */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Price per token
                    </span>
                    <div className="flex items-center gap-2">
                      {isLoadingPrice ? (
                        <div className="w-16 h-4 bg-muted animate-pulse rounded" />
                      ) : (
                        <span className="font-medium">
                          ${pricePerToken.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {tokenAmount && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Total Amount
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-primary">
                            ${totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Payment Method</label>
              <div className="grid gap-2">
                {paymentOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`relative p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedPayment === option.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : option.available
                        ? "border-border hover:border-primary/50"
                        : "border-muted bg-muted/50 cursor-not-allowed opacity-50"
                    }`}
                    onClick={() =>
                      option.available && setSelectedPayment(option.id)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-md ${
                          selectedPayment === option.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{option.name}</span>
                          {!option.available && (
                            <Badge variant="secondary" className="text-xs">
                              Coming Soon
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                      {selectedPayment === option.id && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium">Secure Transaction</p>
                <p className="text-xs mt-1">
                  Your investment is protected by smart contracts and blockchain
                  technology.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
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
                className="flex-1"
                disabled={
                  !tokenAmount ||
                  !selectedPayment ||
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
                    Calculate & Buy
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              Purchase Successful!
            </DialogTitle>
            <DialogDescription>
              Your tokens have been purchased and added to your portfolio
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Tokens Purchased
                  </span>
                  <span className="font-medium">{tokenAmount} tokens</span>
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
                  <span className="font-medium">{propertyName}</span>
                </div>
                {transactionData.hash && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Transaction Hash
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
                  View your investment in the portfolio dashboard
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
