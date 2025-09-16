"use server"

import { Errors, MyError } from "@/constants/errors";
import { AgencyModel } from "@/db/models/agency";
import { UserModel } from "@/db/models/user";
import { DashboardProperties } from "@/types/agent_dashboard";

export default async function getDashboardProperties(userid: string, page: number): Promise<DashboardProperties[]> {
    try {
        // Verify that user exists and is an agent
        const agent = await UserModel.findById(userid);
        // TODO: Add check for if agent type
        if (!agent) {
            throw new MyError(Errors.NOT_AUTHORIZED);
        }

        const properties = await AgencyModel.getDashboardProperties(userid, page);
        return properties;
    } catch(err) {
        console.error(`Error getting dashboard properties for agent ${userid}`, err);
        throw new MyError(Errors.NOT_GET_AGENCY_PROPERTIES);
    }
}