"use server"

import { requireRole } from "@/auth/utils";
import { MyError } from "@/constants/errors";
import realEstateManagerContract from "@/smartcontract/registerContract";
import { DistributePropertyInvestor } from "@/types/property_details";

export default async function distributeFund(investor: DistributePropertyInvestor, totalAmount: number, decimals: number, tokenAddress: string): Promise<string> {
    try {
        await requireRole("agency");

        // Parse details to send to registerContract
        const transactionID = await realEstateManagerContract.distributeFund(
            investor.walletAddress,
            Math.floor((investor.percentage / 100) * totalAmount * (10**decimals)),
            tokenAddress
        );

        return transactionID;
    } catch(err) {
        console.error("Could not send investor their portion of funds", err);
        throw new MyError("Could not send investor their portion of funds");
    }
}