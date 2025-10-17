import PaginationControls from "@/components/paginationControls";
import getDashboardProperties from "@/server-actions/agent/dashboard/getProperties";
import { MapPin } from "lucide-react";
import Image from "next/image";
import { AgentPropertiesDropdown } from "./agentPropertiesDropdown";
import { Badge } from "@/components/ui/badge";

export default async function AgentDashboardProperties(props: {
  page: number;
}) {
  const { properties, totalPages } = await getDashboardProperties(props.page);

  const propertiesListItems = properties.map((p) => {
    if (p.apartment) {
      const unitTemplates = p.apartment.unit_templates.map((t, index) => {
        const detailItems = t.details.map((d, index) => (
          <div key={index} className="flex items-center gap-1 text-sm">
            <span className="font-medium text-muted-foreground">{d.title}:</span>
            <span className="text-foreground">{d.value}</span>
          </div>
        ));

        return (
          <li key={index} className="m-1">
            <h4 className="font-semibold text-foreground truncate">{t.name}</h4>
            <div className="relative h-48 bg-muted">
              <Image
                src={t.image || "/placeholder.svg"}
                alt={t.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex flex-row gap-2">
              <span className="font-medium text-muted-foreground">Number of units:</span>
              <span className="text-foreground">{t.numUnits}</span>
            </div>

            <div>
              <span className="font-medium text-muted-foreground">Proposed rent of each unit:</span>
              <p className="text-xl font-bold text-foreground">
                KSh {t.rent.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground">
                  /month
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {detailItems}
            </div>
          </li>
        );
      });

      return (
        <li key={p.apartment.id}>
          <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground truncate">
                    {p.apartment.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="default" className="font-semibold">
                      {p.apartment.status}
                    </Badge>
                  </div>
                </div>
                <AgentPropertiesDropdown id={p.apartment.id} />
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm truncate">{p.apartment.location}</span>
              </div>

              <section>
                <h4 className="font-semibold text-foreground truncate">Types of units</h4>
                <div className="space-y-2">
                  {unitTemplates}
                </div>
              </section>
            </div>
          </div>
        </li>
      )
    } else if (p.single) {
      const detailItems = p.single.details.map((d, index) => (
        <div key={index} className="flex items-center gap-1 text-sm">
          <span className="font-medium text-muted-foreground">{d.title}:</span>
          <span className="text-foreground">{d.value}</span>
        </div>
      ));

      return (
        <li key={p.single.id}>
          <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-48 bg-muted">
              <Image
                src={p.single.image || "/placeholder.svg"}
                alt={p.single.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground truncate">
                    {p.single.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="default" className="font-semibold">
                      {p.single.status}
                    </Badge>
                  </div>
                </div>
                <AgentPropertiesDropdown id={p.single.id} />
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm truncate">{p.single.location}</span>
              </div>

              {/* Property Details - Improved layout */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {detailItems}
              </div>

              {/* Rent Price - Made more prominent */}
              <div className="pt-2 border-t border-border">
                <p className="text-xl font-bold text-foreground">
                  KSh {p.single.rent.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground">
                    /month
                  </span>
                </p>
              </div>
            </div>
          </div>
        </li>
      );
    } else {
      return (<div></div>);
    }
  });

  return (
    <article className="space-y-6">
      <header className="flex items-center justify-between mt-8 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Properties</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and monitor your property portfolio
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">
            {properties.length}{" "}
            {properties.length > 1 ? "properties" : "property"}
          </p>
        </div>
      </header>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {propertiesListItems}
      </ul>

      {/* Pagination */}
      <div className="flex justify-center pt-6">
        <PaginationControls
          currentPage={props.page}
          totalPages={totalPages}
          paramName="propertiesPage"
        />
      </div>
    </article>
  );
}
