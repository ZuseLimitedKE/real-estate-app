"use server"

import { requireRole } from "@/auth/utils";
import { MyError } from "@/constants/errors";
import { InvestorProperties } from "@/types/portfolio";

export default async function getPropertiesOwnedByInvestor(): Promise<InvestorProperties[]> {
    try {
        // Should only be called by investors
        const payload = await requireRole("investor");

        // Get data from database
        payload.userId
    } catch(err) {
        console.error("Error getting properties owned by investor", {error: err});
        throw new MyError("Could not get properties owned by investor", {cause: err});
    }
}