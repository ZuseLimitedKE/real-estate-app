"use server"

import { DollarSign, House, Percent, Users } from "lucide-react";
import AgentDashboardStatisticsItem from "./agentDashboardStatisticsItem";
import getAgencyStatistics from "@/server-actions/agent/dashboard/getStatistics";

export default async function AgentDashboardStatistics() {
    const statistics = await getAgencyStatistics();
    
    return (
        <article className="lg:grid lg:grid-cols-2 lg:gap-4 flex flex-col gap-3 mb-4">
            <AgentDashboardStatisticsItem
                title="Total Earnings"
                icon={<DollarSign className="w-4 h-4" />}
                value={`$${statistics.totalEarnings}`}
            />
            <AgentDashboardStatisticsItem
                title="Occupancy Rate"
                icon={<Percent className="w-4 h-4" />}
                value={`${statistics.occupancyRate}%`}
            />
            <AgentDashboardStatisticsItem
                title="Total Properties"
                icon={<House className="w-4 h-4" />}
                value={statistics.totalProperties.toString()}
            />
            <AgentDashboardStatisticsItem
                title="Active Tenants"
                icon={<Users className="w-4 h-4" />}
                value={statistics.activeTenants.toString()}
            />
        </article>

    );
}