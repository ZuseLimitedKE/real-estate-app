"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TokenPurchaseSourceEnum } from "@/types/investor";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Coins } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAccount, useTransactionReceipt, useWriteContract } from "wagmi";
import { z } from "zod";
import erc20Abi from "@/smartcontract/abi/ERC20.json";

interface WhereBuyFromProps {
    isOpen: boolean,
    onOpenChange: (open: boolean) => void,
    tokenBalanceInAdminAccount: number,
}

const USDC = process.env.NEXT_PUBLIC_USDC_TOKEN as `0x${string}`;

// This form asks the user if they want to buy from admin or marketplace
export default function AskUserWhereBuyFrom({
    isOpen,
    onOpenChange,
    tokenBalanceInAdminAccount
}: WhereBuyFromProps) {
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
    const { address } = useAccount();
    const { writeContractAsync, isError } = useWriteContract();
    const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed } = useTransactionReceipt({
        hash: txHash,
    });

    const whereBuyFromForm = z.object({
        tokenSource: z.enum([TokenPurchaseSourceEnum.ADMIN, TokenPurchaseSourceEnum.MARKETPLACE]),
        numTokens: z.number("Enter how many tokens you want to buy").gt(0, "You must buy some tokens2")
    });

    const form = useForm({
        resolver: zodResolver(whereBuyFromForm),
        defaultValues: {
            tokenSource: TokenPurchaseSourceEnum.ADMIN
        }
    })

    useEffect(() => {
        if (isConfirmed && receipt) {
            console.log("Transaction confirmed:", receipt);

            if (receipt.status === "success") {
                toast.success("Transaction successful!");

                // Send tokens from admin to user
                
            } else {
                console.error("Transaction reverted:", receipt);
                toast.error("Transaction failed!");
            }

            setTxHash(undefined);
            // setIsLoading(false);
        }
    }, [isConfirmed, receipt, txHash]);

    const tokenSource = form.watch("tokenSource");

    const onSubmit = async (data: z.infer<typeof whereBuyFromForm>) => {
        try {
            // If the user wants to buy from admin
            if (data.tokenSource === TokenPurchaseSourceEnum.ADMIN) {
                // Check if the admin account has the required number of tokens
                if (tokenBalanceInAdminAccount === 0) {
                    toast.error("Admin account has no tokens");
                    onOpenChange(false);
                    return;
                }

                // If it doesn't show the user that the amount is too much
                if (data.numTokens > tokenBalanceInAdminAccount) {
                    form.setError("numTokens", {
                        type: "manual",
                        message: "Too many tokens, please choose a smaller number"
                    });
                    return;
                }

                if (!address) {
                    toast.error("Please connect your wallet.");
                    return;
                }

                // Make payment (transfering USDC to admin)
                const hash = await writeContractAsync({
                    address: USDC,
                    abi: erc20Abi.abi,
                    functionName: "transfer",
                    args: [address, BigInt(data.numTokens * 10^6)]
                });

                setTxHash(hash);
            }
        } catch (err) {
            toast.error("Could not invest in property, contact admin");
            console.error("Could not invest in property");
        }
    }

    return (
        <section>
            <Dialog
                open={isOpen}
                onOpenChange={onOpenChange}
            >
                <DialogTitle>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Coins className="w-5 h-5 text-primary" />
                            Buy Tokens
                        </DialogTitle>
                    </DialogHeader>
                </DialogTitle>
                <DialogContent className="sm:max-w-xl max-h-[700px] overflow-y-auto">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Where to get stocks from */}
                        <Controller
                            name="tokenSource"
                            control={form.control}
                            render={({ field }) => (
                                <div className="space-y-2">
                                    <Label htmlFor="buy_admin">Where do you want to buy the tokens from</Label>
                                    <RadioGroup
                                        id="buy_admin"
                                        value={field.value}
                                        className="flex flex-row flex-wrap gap-4 items-center"
                                        onValueChange={field.onChange}
                                    >
                                        <div className="flex items-center gap-3">
                                            <RadioGroupItem value={TokenPurchaseSourceEnum.ADMIN} id="buy_from_admin" />
                                            <Label htmlFor="buy_from_admin">Admin</Label>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <RadioGroupItem value={TokenPurchaseSourceEnum.MARKETPLACE} id="buy_from_marketplace" />
                                            <Label htmlFor="buy_from_marketplace">Marketplace</Label>
                                        </div>
                                    </RadioGroup>
                                    {form.formState.errors.tokenSource && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {form.formState.errors.tokenSource.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />

                        {/* Get number of stocks to buy */}
                        <div className="space-y-2">
                            <Label htmlFor="num_tokens_buy">How many tokens do you want to buy?</Label>
                            <Input
                                id="num_tokens_buy"
                                placeholder="0.1"
                                step={0.1}
                                min={0.01}
                                {...form.register("numTokens", { valueAsNumber: true })}
                            />
                            {form.formState.errors.numTokens && (
                                <p className="text-sm text-red-500 mt-1">
                                    {form.formState.errors.numTokens.message}
                                </p>
                            )}
                        </div>

                        {tokenSource && tokenSource === TokenPurchaseSourceEnum.ADMIN ? (
                            <div className="flex gap-1">
                                <p className="text-muted-foreground">Number of available tokens:</p>
                                <p className="font-bold">{tokenBalanceInAdminAccount}</p>
                            </div>
                        ) : (
                            <div></div>
                        )}

                        <Button>
                            Invest
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    );
}