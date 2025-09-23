import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import AgentDashboardProperties from "./_components/agentDashboardProperties";
import AgentDashboardTenants from "./_components/agentDashboardTenants";
import { useSearchParams } from "next/navigation";
import AgentDashboardStatistics from "./_components/dashboardStatistics";

const PROPERTIES_PAGE_SEARCH_PARAM = "propertiesPage";
const TENANTS_PAGE_SEARCH_PARAM = "tenantsPage";

export default function AgentDashboard() {
    const searchParams = useSearchParams();
    const propertiesPage = searchParams.get(PROPERTIES_PAGE_SEARCH_PARAM);
    const tenantsPage = searchParams.get(TENANTS_PAGE_SEARCH_PARAM);

    let propertiesPageNum = 1;
    let tenantsPageNum = 1;

    if(propertiesPage) {
        propertiesPageNum = Number.parseInt(propertiesPage);
    }

    if (tenantsPage) {
        tenantsPageNum = Number.parseInt(tenantsPage);
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
