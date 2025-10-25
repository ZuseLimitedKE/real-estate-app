"use server"

import { AuthError, requireRole } from "@/auth/utils";
import { Errors, MyError } from "@/constants/errors";
import { AgencyModel } from "@/db/models/agency";
import { DistributePropertyInvestor } from "@/types/property_details";

// Assumes that the property passed to it already exists. Current implementation is for single properties
export default async function getPropertyInvestors(single_property_id: string, unitID?: string): Promise<DistributePropertyInvestor[]> {
    try {
        // Should only be called for agency
        await requireRole("agency");

        // Get investors of the property
        const investors = await AgencyModel.getPropertyInvestors(single_property_id, unitID);
        return investors;
    } catch(err) {
        console.error("Error getting property investors", err);
        if (err instanceof AuthError) {
            throw new MyError(Errors.NOT_AUTHORIZED);
        }

        throw new MyError("Could not get property investors");
    }
}