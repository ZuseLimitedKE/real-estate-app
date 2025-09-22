import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Eye, House, MapPin, Pencil, Percent, Plus, Trash, Users } from "lucide-react";
import AgentDashboardStatisticsItem from "./_components/agentDashboardStatistics";
import AgentDashboardProperties from "./_components/agentDashboardProperties";
import AgentDashboardTenants from "./_components/agentDashboardTenants";
import getDashboardProperties from "@/server-actions/agent/dashboard/getProperties";
import getTenants from "@/server-actions/agent/dashboard/getTenants";
import getAgencyStatistics from "@/server-actions/agent/dashboard/getStatistics";

export default async function AgentDashboard() {
    let properties = await getDashboardProperties(1);
    let tenants = await getTenants(1);
    const statistics = await getAgencyStatistics();

    async function updatePropertiesPageNum(page: number) {
        properties = await getDashboardProperties(page)
    }

    return (
        <main>
            <header className="flex lg:flex-row flex-col lg:justify-between gap-4 my-4">
                <div>
                    <h1 className="text-2xl font-bold">Agent Dashboard</h1>
                    <p className="font-light text-slate-500">Manage your properties and track tenants</p>
                </div>

                <Button>
                    <Plus />
                    <p>Add New Property</p>
                </Button>
            </header>

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

            <article>
                <div>
                    <Tabs defaultValue="properties" className="w-full">
                        <TabsList className="w-full flex-row justify-between">
                            <TabsTrigger value="properties" className="flex-1">Properties</TabsTrigger>
                            <TabsTrigger value="tenants" className="flex-1">Tenants</TabsTrigger>
                        </TabsList>
                        <TabsContent value="properties">
                            <AgentDashboardProperties properties={properties} />
                        </TabsContent>
                        <TabsContent value="tenants">
                            <AgentDashboardTenants tenants={tenants} />
                        </TabsContent>
                    </Tabs>
                </div>
            </article>
        </main>
    );
}
