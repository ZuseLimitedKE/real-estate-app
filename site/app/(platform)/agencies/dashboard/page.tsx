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
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{
    propertiesPage?: string;
    tenantsPage?: string;
  }>;
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
    <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-bold">Agent Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage your properties and track tenants
          </p>
        </div>

        <Button className="font-semibold w-fit" asChild>
          <Link href={"/agencies/register"}>
            <Plus className="w-4 h-4" />
            Add New Property
          </Link>
        </Button>
      </header>

      <div className="space-y-8">
        <Suspense fallback={<LoadingAgentDashboardStatistics />}>
          <AgentDashboardStatistics />
        </Suspense>

        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="properties" className="mt-0">
              <Suspense fallback={<LoadingAgentDashboardProperties />}>
                <AgentDashboardProperties page={propertiesPageNum} />
              </Suspense>
            </TabsContent>
            <TabsContent value="tenants" className="mt-0">
              <Suspense fallback={<LoadingAgentDashboardTenants />}>
                <AgentDashboardTenants page={tenantsPageNum} />
              </Suspense>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </main>
  );
}
