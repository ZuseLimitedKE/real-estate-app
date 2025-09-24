import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import AgentDashboardProperties from "./_components/agentDashboardProperties";
import AgentDashboardTenants from "./_components/agentDashboardTenants";
import AgentDashboardStatistics from "./_components/dashboardStatistics";
import { Suspense } from "react";
import LoadingAgentDashboardStatistics from "./_components/loadingDashboardStatistics";
import LoadingAgentDashboardProperties from "./_components/loadingAgentDashboardProperties";
import LoadingAgentDashboardTenants from "./_components/loadingAgentDashboardTenants";

interface PageProps {
  searchParams: {
    propertiesPage?: string;
    tenantsPage?: string;
  };
}

export default async function AgentDashboard({ searchParams }: PageProps) {
  const parsePage = (v?: string) => {
    const n = Number.parseInt(v ?? "1", 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  };
  const { propertiesPage, tenantsPage } = await searchParams;
  const propertiesPageNum = parsePage(propertiesPage);
  const tenantsPageNum = parsePage(tenantsPage);

  return (
    <main>
      <header className="flex lg:flex-row flex-col lg:justify-between gap-4 my-4">
        <div>
          <h1 className="text-2xl font-bold">Agent Dashboard</h1>
          <p className="font-light text-slate-500">
            Manage your properties and track tenants
          </p>
        </div>

        <Button>
          <Plus />
          <p>Add New Property</p>
        </Button>
      </header>

      <Suspense fallback={<LoadingAgentDashboardStatistics />}>
        <AgentDashboardStatistics />
      </Suspense>

      <article>
        <div>
          <Tabs defaultValue="properties" className="w-full">
            <TabsList className="w-full flex-row justify-between">
              <TabsTrigger value="properties" className="flex-1">
                Properties
              </TabsTrigger>
              <TabsTrigger value="tenants" className="flex-1">
                Tenants
              </TabsTrigger>
            </TabsList>
            <TabsContent value="properties">
              <Suspense fallback={<LoadingAgentDashboardProperties />}>
                <AgentDashboardProperties page={propertiesPageNum} />
              </Suspense>
            </TabsContent>
            <TabsContent value="tenants">
              <Suspense fallback={<LoadingAgentDashboardTenants />}>
                <AgentDashboardTenants page={tenantsPageNum} />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </article>
    </main>
  );
}
