import getTenants from "@/server-actions/agent/dashboard/getTenants";
import AgentDashboardTenantCollapsible from "./agentDashboardTenantCollapsible";
import PaginationControls from "@/components/paginationControls";

export default async function AgentDashboardTenants(props: { page: number }) {
  const { tenants, totalPages } = await getTenants(props.page);

  const tenantItems = tenants.map((tenant, index) => {
    return (
      <li key={index} className="mb-4 p-3">
        <AgentDashboardTenantCollapsible tenant={tenant} />
      </li>
    );
  });

  return (
    <article>
      <header className="flex flex-row justify-between my-4 px-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My tenants</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and monitor your tenants
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">
            {tenants.length} {tenants.length > 1 ? "tenants" : "tenant"}
          </p>
        </div>
      </header>
      <ul>{tenantItems}</ul>
      <div className="mt-4 flex flex-row justify-center">
        <PaginationControls
          currentPage={props.page}
          totalPages={totalPages}
          paramName="tenantsPage"
        />
      </div>
    </article>
  );
}
