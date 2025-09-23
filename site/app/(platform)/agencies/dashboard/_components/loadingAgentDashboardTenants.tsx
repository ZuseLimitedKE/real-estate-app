import { Skeleton } from "@/components/ui/skeleton";
import { ChevronsUpDown } from "lucide-react";

export default function LoadingAgentDashboardTenants() {
    return (
    <article>
      <header className="flex flex-row justify-between my-4">
        <h2 className="font-bold text-2xl">Tenant Managmement</h2>
      </header>
      <section>
        <ul className="flex flex-col gap-4">
          <li className="flex flex-row justify-between items-center p-2 border rounded-md">
            <Skeleton className="h-[50px] w-3/4"/>
            <ChevronsUpDown />
          </li>
          <li className="flex flex-row justify-between items-center p-2 border rounded-md">
            <Skeleton className="h-[50px] w-3/4"/>
            <ChevronsUpDown />
          </li>
        </ul>
      </section>
    </article>
  );
}