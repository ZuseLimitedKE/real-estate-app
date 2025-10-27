"use server"

import { AuthError, requireRole } from "@/auth/utils";
import { Errors, MyError } from "@/constants/errors";
import { InvestorModel } from "@/db/models/investor";
import { InvestorProperties } from "@/types/portfolio";

export default async function getPropertiesOwnedByInvestor(): Promise<InvestorProperties[]> {
    try {
        // Should only be called by investors
        const payload = await requireRole("investor");

        // Get data from database
        const properties = await InvestorModel.getPropertiesOwned(payload.userId);
        return properties;
    } catch (err) {
        console.error("Error getting properties owned by investor", { error: err });
        if (err instanceof AuthError) {
            throw new MyError(Errors.UNAUTHORIZED);
        }
        throw new MyError("Could not get properties owned by investor", { cause: err });
    }
}