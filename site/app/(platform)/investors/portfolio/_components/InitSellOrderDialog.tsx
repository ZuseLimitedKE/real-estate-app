"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
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
const MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT as `0x${string}`;
const PROPERTY_TOKEN = process.env.NEXT_PUBLIC_PROPERTY_TOKEN as `0x${string}`;

interface InitSellOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const getNonce = () => new Date().getTime();
const getExpiry = () => Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days from now
export default function InitSellOrderDialog({ open, onOpenChange }: InitSellOrderDialogProps) {
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const nonce = getNonce();
  const expiry = getExpiry();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { writeContractAsync } = useWriteContract();

  const handleInitSell = async () => {
    if (!amount || !nonce || !address) return;

    setIsSubmitting(true);
    try {
      const tx = await writeContractAsync({
        address: MARKETPLACE,
        abi: marketPlaceAbi.abi,
        functionName: "initSellOrder",
        args: [BigInt(nonce), PROPERTY_TOKEN, BigInt(amount)],
      });
      //TODO: Check on how to do price per share later
      await createOrder({nonce: nonce.toString(), expiry: expiry, propertyToken: PROPERTY_TOKEN, remainingAmount: amount, orderType: "SELL", pricePerShare: '1'}, address, '0xImplementThisLater');
      toast.success("Sell order created successfully");
      setAmount("");

      onOpenChange(false);
    } catch (err) {
      console.error("❌ Sell order failed:", err);
      toast.error("Failed to create sell order.");
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