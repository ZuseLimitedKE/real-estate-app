"use server";

import getTenants from "@/server-actions/agent/dashboard/getTenants";
import AgentDashboardTenantCollapsible from "./agentDashboardTenantCollapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronsUpDown } from "lucide-react";

export default async function AgentDashboardTenants(props: {page: number}) {
  const tenants = await getTenants(props.page);

  const tenantItems = tenants.map((tenant, index) => {
    return (
      <li key={index} className="mb-4 p-3 border border-slate-200 rounded-lg">
        <AgentDashboardTenantCollapsible tenant={tenant}/>
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
      {/* <div className="mt-4 flex flex-row justify-center">
        <PaginationControls
          page={page}
          updatePage={(num) => {
            // Get data for next page
            setPage(num);
          }}
          isThereMore={props.tenants.length >= RESULT_PAGE_SIZE}
        />
      </div> */}
    </article>
  );
}
