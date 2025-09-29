import { requireAnyRole } from "@/auth/utils";
import { Errors, MyError } from "@/constants/errors";
import { AgencyModel } from "@/db/models/agency";
import { AgentDashboardTenantsData } from "@/types/agent_dashboard";

export default async function getTenants(page: number): Promise<{tenants: AgentDashboardTenantsData[], totalPages: number}> {
    try {
        // Verify that user exists and is an agent
        const payload = await requireAnyRole("agency");
        const pageNum = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
        const {tenants, totalPages} = await AgencyModel.getTenantsProperties(payload.userId, pageNum);
        return {tenants, totalPages};
    } catch (err) {
        console.error("Error getting tenants for agent's properties", err);
        throw new MyError(Errors.NOT_GET_AGENCY_TENANTS);
    }
}   