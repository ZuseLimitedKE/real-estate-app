"use server"

import { requireRole } from "@/auth/utils";
import { Errors, MyError } from "@/constants/errors";
import { AgencyModel } from "@/db/models/agency";
import { DashboardProperties } from "@/types/agent_dashboard";

export default async function getDashboardProperties(page: number): Promise<DashboardProperties[]> {
    try {
        // Verify that user exists and is an agent
        const payload = await requireRole("agency");
        const pageNum = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
        const properties = await AgencyModel.getDashboardProperties(payload.userId, pageNum);
        return properties;
    } catch(err) {
        console.error('Error getting dashboard properties for agent', err);
        throw new MyError(Errors.NOT_GET_AGENCY_PROPERTIES);
    }
}