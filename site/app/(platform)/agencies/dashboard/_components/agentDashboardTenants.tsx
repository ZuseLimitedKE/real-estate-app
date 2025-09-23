"use server";

import getTenants from "@/server-actions/agent/dashboard/getTenants";
import AgentDashboardTenantCollapsible from "./agentDashboardTenantCollapsible";
import PaginationControls from "@/components/paginationControls";

export default async function AgentDashboardTenants(props: { page: number }) {
  const { tenants, totalPages } = await getTenants(props.page);

  const tenantItems = tenants.map((tenant, index) => {
    return (
      <li key={index} className="mb-4 p-3 border border-slate-200 rounded-lg">
        <AgentDashboardTenantCollapsible tenant={tenant} />
      </li>
    );
  });

  return (
    <article>
      <header className="flex flex-row justify-between my-4">
        <h2 className="font-bold text-2xl">Tenant Managmement</h2>
        <p className="text-slate-400">{tenants.length} active tenants</p>
      </header>
      <ul>{tenantItems}</ul>
      <div className="mt-4 flex flex-row justify-center">
        <PaginationControls currentPage={props.page} totalPages={totalPages} paramName="tenantsPage" />
      </div>
    </article>
  );
}
