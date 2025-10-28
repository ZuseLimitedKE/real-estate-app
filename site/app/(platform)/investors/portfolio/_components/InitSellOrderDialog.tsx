"use client";

import { useState } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract, usePublicClient } from "wagmi";
import marketPlaceAbi from "@/smartcontract/abi/MarketPlace.json";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createOrder } from "@/server-actions/marketplace/actions";
import { TokenId } from "@hashgraph/sdk";
import { formatUnits, parseUnits, BaseError, ContractFunctionRevertedError } from "viem";
import erc20Abi from "@/smartcontract/abi/ERC20.json";

const MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT as `0x${string}`;
const PROPERTY_TOKEN = process.env.NEXT_PUBLIC_PROPERTY_TOKEN as `0x${string}`;

interface InitSellOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}
const getNonce = () => new Date().getTime();
const getExpiry = () => Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days from now
export default function InitSellOrderDialog({ open, onOpenChange, onSuccess }: InitSellOrderDialogProps) {
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const nonce = getNonce();
  const expiry = getExpiry();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const publicClient = usePublicClient();

  const { writeContractAsync } = useWriteContract();
  const {
    writeContract: writeDeposit,
    writeContractAsync: depositAsync,
    data: depositHash,
    isPending: isDepositPending,
    reset: resetDeposit,
    error: depositError,
  } = useWriteContract();
  const {
    data: depositReceipt,
    isLoading: waitingDeposit,
    isSuccess: deposited,
    isError: depositTxError,
  } = useWaitForTransactionReceipt({ hash: depositHash });
  const {
    writeContract: writeApprove,
    writeContractAsync: approveAsync,
    data: approveHash,
    isPending: isApprovePending,
    reset: resetApprove,
    error: approveError,
  } = useWriteContract();
  const {
    data: approveReceipt,
    isLoading: waitingApprove,
    isSuccess: approved,
    isError: approveTxError,
  } = useWaitForTransactionReceipt({ hash: approveHash });
  const handleInitSell = async () => {
    //TODO: REPLACE LATER AND USE THE CORRECT PROPERTY TOKEN
    if (!amount || !nonce || !address) return;
    if (!publicClient) {
      toast.error("Public client not available");
      return;
    }
    setIsSubmitting(true);
    try {
      console.log("📤 Creating sell order on marketplace");
      //Approve allowance
      try {
        await publicClient.simulateContract({
          account: address!,
          address: PROPERTY_TOKEN,
          abi: erc20Abi.abi,
          functionName: "approve",
          args: [MARKETPLACE, amount],
        });
      } catch (e: any) {
        const msg = decodeViemError(e);
        console.error("❌ Approve simulation failed:", e, msg);
        toast.error(msg || "Approval simulation failed");
        return;
      }
      //Deposit property tokens to escrow
      //TODO: Replace this later
      //const tokenEvmAddress = TokenId.fromString(PROPERTY_TOKEN).toEvmAddress();
      depositAsync({
        address: MARKETPLACE,
        abi: marketPlaceAbi.abi,
        functionName: "depositToken",
        args: [PROPERTY_TOKEN, amount],
      })
      console.log("📝 Deposit tx sent:", depositHash);
      // All sell orders go through marketplace for matching
      const tx = await writeContractAsync({
        address: MARKETPLACE,
        abi: marketPlaceAbi.abi,
        functionName: "initSellOrder",
        args: [BigInt(nonce), PROPERTY_TOKEN, BigInt(amount)],
      });

      console.log("Sell order TX submitted:", tx);

      // Store sell order in database for marketplace matching
      await createOrder({
        nonce: nonce.toString(),
        expiry: expiry,
        propertyToken: PROPERTY_TOKEN,
        remainingAmount: amount,
        orderType: "SELL",
        pricePerShare: '1' // TODO: Implement proper price per share calculation
      }, address, '0xDD1184EeC78eD419d948887B8793E64a62f13895');

      toast.success("Sell order created successfully on marketplace");
      setAmount("");
      onSuccess && onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("❌ Sell order failed:", err);
      toast.error(err?.message || "Failed to create sell order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Initialize Sell Order</DialogTitle>
          <DialogDescription>
            Create a sell order for your property tokens on the marketplace.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">

          <Input
            type="number"
            placeholder="Number of property tokens to sell"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
          />
          <Button
            onClick={handleInitSell}
            disabled={isSubmitting || !amount || !nonce}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Create Sell Order"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function decodeViemError(e: any): string {
  try {
    if (e instanceof BaseError) {
      const revert = e.walk((err) => err instanceof ContractFunctionRevertedError);
      if (revert) {
        // Prefer decoded custom error name or reason
        // @ts-expect-error viem typed errors carry details
        return revert.shortMessage || revert.reason || revert.message;
      }
      return e.shortMessage || e.message;
    }
    return e?.message || String(e);
  } catch {
    return "Transaction failed";
  }
}