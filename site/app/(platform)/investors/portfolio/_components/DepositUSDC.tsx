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
  usePublicClient
} from "wagmi";
import marketPlaceAbi from "@/smartcontract/abi/MarketPlace.json";
import erc20Abi from "@/smartcontract/abi/ERC20.json";
import { formatUnits, parseUnits, BaseError, ContractFunctionRevertedError } from "viem";
import { associateTokentoContract } from "@/server-actions/marketplace/actions";

interface DepositUSDCProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function DepositUSDC({ open, setOpen, onSuccess }: DepositUSDCProps) {
  const { isConnected, address } = useAccount();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const publicClient = usePublicClient();
  const MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT as `0x${string}`;
  const USDC = process.env.NEXT_PUBLIC_USDC_TOKEN as `0x${string}`;
  console.log("🔍 Deposit Debug Info:", {
    MARKETPLACE,
    USDC,
  }
  );
  if (!MARKETPLACE || !USDC) {
    console.error("Missing contract addresses:", { MARKETPLACE, USDC });
    toast.error("Page setup error");
  }
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
    writeContractAsync: approveAsync,
    data: approveHash,
    isPending: isApprovePending,
    reset: resetApprove,
    error: approveError,
  } = useWriteContract();
  const {
    writeContract: writeDeposit,
    writeContractAsync: depositAsync,
    data: depositHash,
    isPending: isDepositPending,
    reset: resetDeposit,
    error: depositError,
  } = useWriteContract();

  const {
    data: approveReceipt,
    isLoading: waitingApprove,
    isSuccess: approved,
    isError: approveTxError,
  } = useWaitForTransactionReceipt({ hash: approveHash });
  const {
    data: depositReceipt,
    isLoading: waitingDeposit,
    isSuccess: deposited,
    isError: depositTxError,
  } = useWaitForTransactionReceipt({ hash: depositHash });
  const busy =
    isApprovePending || isDepositPending || waitingApprove || waitingDeposit;

  // Handle approval success -> trigger deposit
  // useEffect(() => {
  //   if (approved && !depositHash && !isDepositPending && !waitingDeposit) {
  //     console.log("✅ Approval successful, calling depositToken");
  //     depositAsync({
  //       address: MARKETPLACE,
  //       abi: marketPlaceAbi.abi,
  //       functionName: "depositToken",
  //       args: [USDC, parsedAmount],
  //     });
  //     console.log("📝 Deposit tx sent:", depositHash);
  //   }
  // }, [approved, depositHash, isDepositPending, waitingDeposit, writeDeposit, MARKETPLACE, USDC, parsedAmount]);

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
  useEffect(() => {
    if (approveReceipt && approveReceipt.status === "reverted") {
      console.error("❌ Approve reverted:", approveReceipt);
      toast.error("Approve reverted");
      setLoading(false);
    }
  }, [approveReceipt]);

  useEffect(() => {
    if (depositReceipt && depositReceipt.status === "reverted") {
      console.error("❌ Deposit reverted:", depositReceipt);
      toast.error("Deposit reverted");
      setLoading(false);
    }
  }, [depositReceipt]);

  // Handle errors from writers (decode viem errors)
  useEffect(() => {
    if (approveError) {
      const msg = decodeViemError(approveError);
      console.error("❌ Approve error:", approveError, msg);
      toast.error(msg || "Approval failed");
      setLoading(false);
    }
  }, [approveError]);

  useEffect(() => {
    if (depositError) {
      const msg = decodeViemError(depositError);
      console.error("❌ Deposit error:", depositError, msg);
      toast.error(msg || "Deposit failed");
      setLoading(false);
    }
  }, [depositError]);
  const handleDeposit = async () => {
    try {
      //Associate my mock usdc token to contract
      // const results = await associateTokentoContract(USDC);
      // if (!results.success) {
      //   toast.error("Failed to associate USDC token to contract");
      //   return;
      // }
      console.log("🔍 Deposit Debug Info:", {
        isConnected,
        MARKETPLACE,
        USDC,
        amount,
        parsedAmount: parsedAmount.toString(),
      });
      if (!publicClient) {
        toast("failed to initialize public client");
        return;
      }
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
      try {
        await publicClient.simulateContract({
          account: address!,
          address: USDC,
          abi: erc20Abi.abi,
          functionName: "approve",
          args: [MARKETPLACE, parsedAmount],
        });
      } catch (e: any) {
        const msg = decodeViemError(e);
        console.error("❌ Approve simulation failed:", e, msg);
        toast.error(msg || "Approval simulation failed");
        setLoading(false);
        return;
      }
      console.log("✅ Calling writeApprove with:", {
        address: USDC,
        functionName: "approve",
        args: [MARKETPLACE, parsedAmount.toString()],
      });

      // Approve Marketplace to spend USDC
      const hash = await approveAsync({
        address: USDC,
        abi: erc20Abi.abi,
        functionName: "approve",
        args: [MARKETPLACE, parsedAmount],
      });
      console.log("📝 Approve tx sent:", hash);
      //Deposit USDC to Marketplace escrow
      //Simulate contract call
      // try {
      //   await publicClient.simulateContract({
      //     address: MARKETPLACE,
      //     abi: marketPlaceAbi.abi,
      //     functionName: "depositToken",
      //     args: [USDC, parsedAmount],
      //   });
      // } catch (e: any) {
      //   const msg = decodeViemError(e);
      //   console.error("❌ Approve simulation failed:", e, msg);
      //   toast.error(msg || "Approval simulation failed");
      //   setLoading(false);
      //   return;
      // }
      // Call depositToken function
      depositAsync({
        address: MARKETPLACE,
        abi: marketPlaceAbi.abi,
        functionName: "depositToken",
        args: [USDC, parsedAmount],
      })
      console.log("📝 Deposit tx sent:", depositHash);
      // await publicClient?.waitForTransactionReceipt({hash: approveHash!});
    } catch (e: any) {
      const msg = decodeViemError(e);
      console.error("❌ Approval error:", e, msg);
      toast.error(msg || "Approval failed");
      setLoading(false);
    } finally {
      setLoading(false)
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