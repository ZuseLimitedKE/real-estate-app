"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import marketPlaceAbi from "@/smartcontract/abi/MarketPlace.json";
import erc20Abi from "@/smartcontract/abi/ERC20.json";
import { formatUnits, parseUnits } from "viem";

interface DepositUSDCProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function DepositUSDC({ open, setOpen, onSuccess }: DepositUSDCProps) {
  const { isConnected, address } = useAccount();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT as `0x${string}`;
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

    const parsedAmount = useMemo(() => {
      if (!amount || isNaN(Number(amount))) return BigInt(0);
      try {
        return parseUnits(amount, decimals);
      } catch {
        return BigInt(0);
      }
    }, [amount, decimals]);
    
  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: isApprovePending,
    reset: resetApprove,
    error: approveError,
  } = useWriteContract();
  const {
    writeContract: writeDeposit,
    data: depositHash,
    isPending: isDepositPending,
    reset: resetDeposit,
    error: depositError,
  } = useWriteContract();

  const { isLoading: waitingApprove, isSuccess: approved } =
    useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: waitingDeposit, isSuccess: deposited } =
    useWaitForTransactionReceipt({ hash: depositHash });

  const busy =
    isApprovePending || isDepositPending || waitingApprove || waitingDeposit;

  // Handle approval success -> trigger deposit
  useEffect(() => {
    if (approved && !depositHash && !isDepositPending && !waitingDeposit) {
      console.log("✅ Approval successful, calling depositToken");
      writeDeposit({
        address: MARKETPLACE,
        abi: marketPlaceAbi.abi,
        functionName: "depositToken",
        args: [USDC, parsedAmount],
      });
    }
  }, [approved, depositHash, isDepositPending, waitingDeposit, writeDeposit, MARKETPLACE, USDC, parsedAmount]);

  // Handle deposit success
  useEffect(() => {
    if (deposited) {
      console.log("✅ Deposit successful!");
      toast.success("USDC deposited to escrow");
      onSuccess?.();
      setOpen(false);
      // Reset form
      setAmount("");
      resetApprove();
      resetDeposit();
    }
  }, [deposited, onSuccess, setOpen, resetApprove, resetDeposit]);

  // Handle errors
  useEffect(() => {
    if (approveError) {
      console.error("❌ Approve error:", approveError);
      toast.error(approveError.message || "Approval failed");
      setLoading(false);
    }
  }, [approveError]);

  useEffect(() => {
    if (depositError) {
      console.error("❌ Deposit error:", depositError);
      toast.error(depositError.message || "Deposit failed");
      setLoading(false);
    }
  }, [depositError]);

  const handleDeposit = async () => {
    try {
      console.log("🔍 Deposit Debug Info:", {
        isConnected,
        MARKETPLACE,
        USDC,
        amount,
        parsedAmount: parsedAmount.toString(),
      });

      if (!isConnected) {
        toast.error("Connect your wallet first");
        return;
      }
      if (!MARKETPLACE || !USDC) {
        toast.error("Missing contract addresses");
        console.error("Missing addresses:", { MARKETPLACE, USDC });
        return;
      }
      if (parsedAmount <= BigInt(0)) {
        toast.error("Enter a valid amount");
        return;
      }

      setLoading(true);

      console.log("✅ Calling writeApprove with:", {
        address: USDC,
        functionName: "approve",
        args: [MARKETPLACE, parsedAmount.toString()],
      });

      // Approve Marketplace to spend USDC
      writeApprove({
        address: USDC,
        abi: erc20Abi.abi,
        functionName: "approve",
        args: [MARKETPLACE, parsedAmount],
      });
    } catch (e: any) {
      console.error("❌ Approval error:", e);
      toast.error(e?.message || "Approval failed");
      setLoading(false); 
    } finally {
      //setLoading(false)
    }
  };

  const handleClose = () => {
    if (!busy) {
      setOpen(false);
      setAmount("");
      resetApprove();
      resetDeposit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deposit USDC to Escrow</DialogTitle>
          <DialogDescription>
            Approve and deposit USDC into the marketplace escrow to place buy
            orders.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Amount (USDC)</label>
            <Input
              type="number"
              min="0"
              step="0.000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
            />
          </div>
          {loading && (
            <p className="text-xs text-gray-500">
              Waiting for wallet confirmation or transaction to complete…
            </p>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleDeposit}
              disabled={busy || loading}
            >
              {busy || loading ? "Processing..." : "Approve & Deposit"}
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Note: Approve and deposit require two on-chain transactions and some HBAR for gas.
        </p>
      </DialogContent>
    </Dialog>
  );
}