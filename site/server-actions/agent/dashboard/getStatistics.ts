import { requireRole } from "@/auth/utils";
import { Errors, MyError } from "@/constants/errors";
import { AgencyModel } from "@/db/models/agency";

export interface AgencyStatistics {
    totalEarnings: number,
    occupancyRate: number,
    totalProperties: number,
    activeTenants: number
}

export default async function getAgencyStatistics(): Promise<AgencyStatistics> {
    try {
        const payload = await requireRole('agency');
        const statistics = await AgencyModel.getAgentStatistics(payload.userId);
        return statistics;
    } catch(err) {
        console.error("Error getting agency dashboard statistics", err);
        throw new MyError(Errors.NOT_GET_AGENT_DASHBOARD_STATISTICS);
    }
}