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
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, Zap, Calculator } from "lucide-react";
import { toast } from "sonner";
import {
  useAccount,
  usePublicClient,
  useWriteContract,
  useWaitForTransactionReceipt,
  useTransactionReceipt,
} from "wagmi";
import marketplaceAbi from "@/smartcontract/abi/MarketPlace.json";
import erc20Abi from "@/smartcontract/abi/ERC20.json";
import { parseUnits } from "viem";
import { createOrder } from "@/server-actions/marketplace/actions";
import { TokenId } from "@hashgraph/sdk";
import { decodeViemError } from "./decode-viem";
import { getAssociatedTokens } from "@/server-actions/tokens/purchase-tokens";
import { associateTokentoContract } from "@/server-actions/marketplace/actions";

const MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT as `0x${string}`;
const MARKETPLACE_HEDERA_ACCOUNTID = process.env.NEXT_PUBLIC_MARKETPLACE_HEDERA_ACCOUNTID as string;
const USDC = process.env.NEXT_PUBLIC_USDC_TOKEN as `0x${string}`;
interface SellFormProps {
  propertyId: string;
  propertyName: string;
  tokenAddress: string;
  isOpen: boolean;
  onClose: () => void;
}

const getNonce = () => new Date().getTime();
const getExpiry = () => Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

export default function SellForm({ propertyId, propertyName, tokenAddress, isOpen, onClose }: SellFormProps) {
  const [amount, setAmount] = useState("");
  const [pricePerToken, setPricePerToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<"form" | "approve" | "deposit" | "init-order" | "complete">("form");
  const [approveHash, setApproveHash] = useState<`0x${string}` | undefined>();
  const [depositHash, setDepositHash] = useState<`0x${string}` | undefined>();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { data: approveReceipt, isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveHash });
  const { data: depositReceipt, isSuccess: depositConfirmed } = useWaitForTransactionReceipt({ hash: depositHash });
  const { data: receipt, isSuccess: isConfirmed } = useTransactionReceipt({ hash: txHash });
  const nonce = getNonce();
  const expiry = getExpiry();
  
  // Normalize token address to EVM address if it's a Hedera TokenId string
  let tokenEvm: `0x${string}`;
  try {
    const evm = TokenId.fromString(tokenAddress).toEvmAddress();
    tokenEvm = `0x${evm}` as `0x${string}`;
  } catch {
    // If tokenAddress is already an EVM address, cast it
    tokenEvm = tokenAddress as `0x${string}`;
  }

  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setPricePerToken("");
      setIsLoading(false);
      setCurrentStep("form");
      setApproveHash(undefined);
      setDepositHash(undefined);
      setTxHash(undefined);
    }
  }, [isOpen]);

  // Chain: when approve confirmed -> deposit
  useEffect(() => {
    if (approveConfirmed && approveReceipt && currentStep === "approve") {
      if (approveReceipt.status === "success") {
        setCurrentStep("deposit");
        handleDeposit();
      } else {
        toast.error("Approve transaction reverted");
        setIsLoading(false);
        setCurrentStep("form");
      }
    }
  }, [approveConfirmed, approveReceipt, currentStep]);

  // Chain: when deposit confirmed -> init sell order
  useEffect(() => {
    if (depositConfirmed && depositReceipt && currentStep === "deposit") {
      if (depositReceipt.status === "success") {
        setCurrentStep("init-order");
        handleInitSellOrder();
      } else {
        toast.error("Deposit transaction reverted");
        setIsLoading(false);
        setCurrentStep("form");
      }
    }
  }, [depositConfirmed, depositReceipt, currentStep]);

  // Finalize when initSellOrder confirmed
  useEffect(() => {
    if (isConfirmed && receipt && currentStep === "init-order") {
      if (receipt.status === "success") {
        setCurrentStep("complete");
        toast.success("Sell order created successfully");
        setIsLoading(false);
        // reset form
        setAmount("");
        setPricePerToken("");
        setTxHash(undefined);
        setApproveHash(undefined);
        setDepositHash(undefined);
        // close modal after short delay
        setTimeout(() => onClose(), 800);
      } else {
        toast.error("Init sell order reverted");
        setIsLoading(false);
        setCurrentStep("form");
      }
    }
  }, [isConfirmed, receipt, currentStep, onClose]);

  const handleApprove = async () => {
    if (!publicClient || !address) return;
    try {
      setIsLoading(true);
      const parsedAmount = BigInt(amount);
      if (parsedAmount <= BigInt(0)) {
        toast.error("Enter a valid token amount");
        setIsLoading(false);
        return;
      }
      const totalAmount = parseFloat(amount) * parseFloat(pricePerToken);
      // simulate approve
      if (!publicClient) {
        toast.error("Public client not available");
        setIsLoading(false);
        setCurrentStep("form");
        return;
      }
      try{
        
        //check if token is associated to contract
        const associatedTokens = await getAssociatedTokens(MARKETPLACE_HEDERA_ACCOUNTID);
        console.log("Associated tokens:", associatedTokens);
        if (!associatedTokens.includes(tokenAddress)) {
          console.log("Token not associated, associating now:", tokenAddress);  
          // if not associated, associate it
          const result = await associateTokentoContract(tokenEvm);
          if(result.success === false){
            console.error("Failed to associate token:", );
            toast.error("Failed to associate token, try again later");
            setIsLoading(false);
            setCurrentStep("form");
            return;
          }
        }
      }
      catch(error: any){
        console.error("Error fetching associated tokens:", error);
        toast.error("An error occured, try again later");
        setIsLoading(false);
        setCurrentStep("form");
        return;
      }
      try {
        await publicClient.simulateContract({
          account: address,
          address: tokenEvm,
          abi: erc20Abi.abi,
          functionName: "approve",
          args: [MARKETPLACE, parseUnits(amount.toString(), 6)],
        });
      } catch (e: any) {
        const msg = decodeViemError(e);
        console.error("Approve simulation error:", msg);
        toast.error(msg || "Approve simulation failed");
        setIsLoading(false);
        return;
      }

      const hash = await writeContractAsync({
        address: tokenEvm,
        abi: erc20Abi.abi,
        functionName: "approve",
        args: [MARKETPLACE, parseUnits(amount.toString(), 6)],
      });
      setApproveHash(hash);
      toast.info("Step 1/3: Approve submitted. Confirm in wallet.");
    } catch (err: any) {
      const msg = decodeViemError(err);
      console.error("Approve error:", msg);
      toast.error(msg || "Approve failed");
      setIsLoading(false);
      setCurrentStep("form");
    }
  };

  const handleDeposit = async () => {
    if (!publicClient || !address) return;
    try {
      const parsedAmount = BigInt(amount);
      if (parsedAmount <= BigInt(0)) {
        toast.error("Enter a valid token amount");
        setIsLoading(false);
        return;
      }
      // simulate deposit
      if (!publicClient) {
        toast.error("Public client not available");
        setIsLoading(false);
        setCurrentStep("form");
        return;
      }
      try {
        await publicClient.simulateContract({
          account: address,
          address: MARKETPLACE,
          abi: marketplaceAbi.abi,
          functionName: "depositToken",
          args: [tokenEvm, parseUnits(amount.toString(), 6)],
        });
      } catch (e: any) {
        const msg = decodeViemError(e);
        console.error("Deposit simulation error:", e);
        toast.error(msg || "Deposit simulation failed");
        setIsLoading(false);
        setCurrentStep("form");
        return;
      }

      const hash = await writeContractAsync({
        address: MARKETPLACE,
        abi: marketplaceAbi.abi,
        functionName: "depositToken",
        args: [tokenEvm, parseUnits(amount.toString(), 6)],
      });
      setDepositHash(hash);
      toast.info("Step 2/3: Deposit submitted. Confirm in wallet.");
    } catch (err: any) {
      const msg = decodeViemError(err);
      console.error("Deposit error:", msg);
      toast.error(msg || "Deposit failed");
      setIsLoading(false);
      setCurrentStep("form");
    }
  };

  const handleInitSellOrder = async () => {
    try {
      const parsedAmount = BigInt(amount);
      if (!publicClient) {
        toast.error("Public client not available");
        setIsLoading(false);
        setCurrentStep("form");
        return;
      }
      const totalAmount = parseFloat(amount) * parseFloat(pricePerToken);
      // simulate initSellOrder
      try {
        await publicClient.simulateContract({
          account: address!,
          address: MARKETPLACE,
          abi: marketplaceAbi.abi,
          functionName: "initSellOrder",
          args: [BigInt(nonce), tokenEvm, parseUnits(amount.toString(), 6)],
        });
      } catch (e: any) {
        const msg = decodeViemError(e);
        toast.error(msg || "Init sell order simulation failed");
        setIsLoading(false);
        setCurrentStep("form");
        return;
      }

      const hash = await writeContractAsync({
        address: MARKETPLACE,
        abi: marketplaceAbi.abi,
        functionName: "initSellOrder",
        args: [BigInt(nonce), tokenEvm, parseUnits(amount.toString(), 6)],
      });
      setTxHash(hash);
      toast.info("Step 3/3: Init sell order submitted. Confirm in wallet.");

      // store order in DB
      await createOrder({
        nonce: nonce.toString(),
        expiry,
        propertyToken: tokenEvm,
        remainingAmount: parsedAmount.toString(),
        orderType: "SELL",
        pricePerShare: (parseFloat(pricePerToken)).toString(),
      }, '0xDD1184EeC78eD419d948887B8793E64a62f13895', address!);

    } catch (err: any) {
      const msg = decodeViemError(err);
      toast.error(msg || "Init sell order failed");
      setIsLoading(false);
      setCurrentStep("form");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid token amount");
      return;
    }
    if (!pricePerToken || Number(pricePerToken) <= 0) {
      toast.error("Enter a valid price per token");
      return;
    }
    if (!address) {
      toast.error("Connect wallet");
      return;
    }

    // Kick off approve -> deposit -> init sequence
    setIsLoading(true);
    setCurrentStep("approve");
    await handleApprove();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sell {propertyName} Tokens</DialogTitle>
          <DialogDescription>Create a sell order on the marketplace</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="sell-amount">Number of tokens</Label>
            <Input id="sell-amount" type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="sell-price">Price per token (USD)</Label>
            <Input id="sell-price" type="number" min="0.01" step="0.01" value={pricePerToken} onChange={(e) => setPricePerToken(e.target.value)} />
          </div>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm">Total</div>
                <div className="font-medium">${(Number(amount || 0) * Number(pricePerToken || 0)).toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>

          {currentStep !== "form" && (
            <Card className="bg-amber-50">
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {currentStep === "approve" ? <div className="w-4 h-4 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" /> : <CheckCircle className="w-4 h-4 text-green-600" />}
                    <div className="text-xs">Step 1: Approve token allowance</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentStep === "deposit" ? <div className="w-4 h-4 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" /> : <CheckCircle className="w-4 h-4 text-green-600" />}
                    <div className="text-xs">Step 2: Deposit tokens to escrow</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentStep === "init-order" ? <div className="w-4 h-4 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" /> : <CheckCircle className="w-4 h-4 text-green-600" />}
                    <div className="text-xs">Step 3: Initialize sell order</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Processing...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />Create Sell Order
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
