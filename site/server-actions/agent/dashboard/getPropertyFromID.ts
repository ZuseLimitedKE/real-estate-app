import { requireRole } from "@/auth/utils";
import { Errors, MyError } from "@/constants/errors";
import { AgencyModel } from "@/db/models/agency";
import { AgentProperty } from "@/types/agent_dashboard";

export default async function getPropertyFromID(id: string): Promise<AgentProperty | null> {
    try {
        const payload = await requireRole("agency");
        const property = await AgencyModel.getPropertyFromID(payload.userId, id);
        return property;
    } catch (err) {
        console.error(`Error getting property ${id}`, err);
        throw new MyError(Errors.NOT_GET_PROPERTY);
    }
}