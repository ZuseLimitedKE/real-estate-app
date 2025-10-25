"use server"

import { requireRole } from "@/auth/utils";
import { MyError } from "@/constants/errors";
import { AgencyModel } from "@/db/models/agency";

export default async function getDistributionHistory(property_id: string, unitID?: string) {
    try {
        // Only agent should be able to call this
        await requireRole("agency");

        // Get distribution history for property
        return await AgencyModel.getDistributionHistory(property_id);
    } catch(err) {
        console.error(`Error getting distribution history for property ${property_id}`, err);
        throw new MyError("Error getting distribution history", {cause: err});
    }
}