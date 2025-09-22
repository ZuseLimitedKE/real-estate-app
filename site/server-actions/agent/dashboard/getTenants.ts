import { requireAnyRole } from "@/auth/utils";
import { Errors, MyError } from "@/constants/errors";
import { AgencyModel } from "@/db/models/agency";
import { AgentDashboardTenantsData } from "@/types/agent_dashboard";

export default async function getTenants(page: number): Promise<AgentDashboardTenantsData[]> {
    try {
        // Verify that user exists and is an agent
        const payload = await requireAnyRole("agency");

        const tenants = await AgencyModel.getTenantsProperties(payload.userId, page);
        return tenants
    } catch (err) {
        console.error("Error getting tenants for agent's properties", err);
        throw new MyError(Errors.NOT_GET_AGENCY_TENANTS);
    }
}   