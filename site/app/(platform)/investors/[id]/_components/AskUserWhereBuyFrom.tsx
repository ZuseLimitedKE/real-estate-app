"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TokenPurchaseSourceEnum } from "@/types/investor";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface WhereBuyFromProps {
    isOpen: boolean,
    onOpenChange: (open: boolean) => void,
    tokenBalanceInAdminAccount: number,
}

// This form asks the user if they want to buy from admin or marketplace
export default function AskUserWhereBuyFrom({
    isOpen,
    onOpenChange,
    tokenBalanceInAdminAccount
}: WhereBuyFromProps) {
    

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
            }
        } catch(err) {
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

                        <Button>
                            Invest
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    );
}