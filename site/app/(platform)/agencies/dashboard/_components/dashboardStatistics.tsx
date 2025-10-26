import { TrendingUp, Building2, Users, BarChart3 } from "lucide-react";
import AgentDashboardStatisticsItem from "./agentDashboardStatisticsItem";
import getAgencyStatistics from "@/server-actions/agent/dashboard/getStatistics";

export default async function AgentDashboardStatistics() {
  const statistics = await getAgencyStatistics();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <AgentDashboardStatisticsItem
        title="Total Earnings"
        icon={<TrendingUp className="w-4 h-4" />}
        value={`Ksh ${statistics.totalEarnings.toLocaleString()}`}
      />
      <AgentDashboardStatisticsItem
        title="Occupancy Rate"
        icon={<BarChart3 className="w-4 h-4" />}
        value={`${statistics.occupancyRate}%`}
      />
      <AgentDashboardStatisticsItem
        title="Total Properties"
        icon={<Building2 className="w-4 h-4" />}
        value={statistics.totalProperties.toString()}
      />
      <AgentDashboardStatisticsItem
        title="Active Tenants"
        icon={<Users className="w-4 h-4" />}
        value={statistics.activeTenants.toString()}
      />
    </div>
  );
}
