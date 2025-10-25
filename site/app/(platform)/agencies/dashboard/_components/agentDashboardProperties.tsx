import PaginationControls from "@/components/paginationControls";
import getDashboardProperties from "@/server-actions/agent/dashboard/getProperties";
import { MapPin } from "lucide-react";
import Image from "next/image";
import { AgentPropertiesDropdown } from "./agentPropertiesDropdown";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default async function AgentDashboardProperties(props: {
  page: number;
}) {
  const { properties, totalPages } = await getDashboardProperties(props.page);

  const propertiesListItems = properties.map((p) => {
    if (p.apartment) {
      const firstUnitImage =
        p.apartment.unit_templates[0]?.image || "/no-propertyfound.png";

      const unitTemplates = p.apartment.unit_templates.map((t, index) => {
        const detailItems = t.details.map((d, detailIndex) => (
          <div key={detailIndex} className="flex items-center gap-1 text-sm">
            <span className="font-medium text-muted-foreground">
              {d.title}:
            </span>
            <span className="text-foreground">{d.value}</span>
          </div>
        ));

        return (
          <AccordionItem
            key={index}
            value={`unit-${index}`}
            className="border-b border-border last:border-b-0"
          >
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-3 w-full text-left">
                <div className="relative h-12 w-12 flex-shrink-0 rounded overflow-hidden bg-muted">
                  <Image
                    src={t.image || "/placeholder.svg"}
                    alt={t.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-foreground truncate">
                    {t.name}
                  </h5>
                  <p className="text-sm text-muted-foreground">
                    {t.numUnits} units • KSh {t.rent.toLocaleString()}/month
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2">
                {detailItems}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      });

      return (
        <li key={p.apartment.id}>
          <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="relative h-32 bg-muted flex-shrink-0">
              <Image
                src={firstUnitImage || "/placeholder.svg"}
                alt={p.apartment.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col">
              {/* Header with title and actions */}
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

              {/* Location */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm truncate">{p.apartment.location}</span>
              </div>

              {/* Unit Templates Accordion */}
              <div className="border-t border-border pt-3 mt-auto">
                <Accordion type="single" collapsible className="w-full">
                  {unitTemplates}
                </Accordion>
              </div>
            </div>
          </div>
        </li>
      );
    } else if (p.single) {
      const keyDetails = p.single.details.filter((d) =>
        ["bedroom", "bathroom", "parking"].some((key) =>
          d.title.toLowerCase().includes(key),
        ),
      );

      const allOtherDetails = p.single.details.filter(
        (d) =>
          !["bedroom", "bathroom", "parking"].some((key) =>
            d.title.toLowerCase().includes(key),
          ),
      );

      const keyDetailItems = keyDetails.map((d, index) => (
        <div key={index} className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {d.title}
          </span>
          <span className="text-lg font-semibold text-foreground">
            {d.value}
          </span>
        </div>
      ));

      const otherDetailItems = allOtherDetails.map((d, index) => (
        <div key={index} className="flex items-center gap-1 text-sm">
          <span className="font-medium text-muted-foreground">{d.title}:</span>
          <span className="text-foreground">{d.value}</span>
        </div>
      ));

      return (
        <li key={p.single.id}>
          <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="relative h-32 bg-muted flex-shrink-0">
              <Image
                src={p.single.image || "/placeholder.svg"}
                alt={p.single.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col">
              {/* Header with title and actions */}
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

              {/* Location */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm truncate">{p.single.location}</span>
              </div>

              {keyDetailItems.length > 0 && (
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-border">
                  {keyDetailItems}
                </div>
              )}

              <div className="mt-auto pt-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Monthly Rent
                </p>
                <p className="text-2xl font-bold text-foreground">
                  KSh {p.single.rent.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground">
                    /month
                  </span>
                </p>
              </div>

              {otherDetailItems.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="details" className="border-0">
                      <AccordionTrigger className="hover:no-underline py-2 text-sm">
                        <span className="font-medium text-muted-foreground">
                          View All Details
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-0 pt-3">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          {otherDetailItems}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}
            </div>
          </div>
        </li>
      );
    } else {
      return <div></div>;
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
