"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import type { AgentDashboardTenantsData } from "@/types/agent_dashboard";
import { Calendar, ChevronsUpDown, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AgentDashboardTenantCollapsible(props: {
  tenant: AgentDashboardTenantsData;
}) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full p-6 text-left hover:bg-slate-50 transition-colors">
        <div className="flex-1 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                {props.tenant.name}
              </h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{props.tenant.property}</span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  {new Intl.NumberFormat("en-KE", {
                    style: "currency",
                    currency: "KES",
                  }).format(props.tenant.rent)}
                </p>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                {props.tenant.status}
              </span>
            </div>
          </div>
        </div>

        <ChevronsUpDown
          className="w-5 h-5 ml-4 text-muted-foreground"
          aria-hidden="true"
        />
        <span className="sr-only">Toggle tenant details</span>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-6 pb-6 space-y-6">
          <hr className="border-border" />

          <div className="grid gap-6 md:grid-cols-2">
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Contact Information
              </h3>
              <div className="space-y-2">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Email
                  </span>
                  <span className="text-sm text-foreground">
                    {props.tenant.contactInfo.email}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Phone
                  </span>
                  <span className="text-sm text-foreground">
                    {props.tenant.contactInfo.number}
                  </span>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Lease Information
              </h3>
              <div className="space-y-2">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Start Date
                  </span>
                  <span className="text-sm text-foreground">
                    {new Date(
                      props.tenant.leaseInfo.initialDate,
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Property
                  </span>
                  <span className="text-sm text-foreground">
                    {props.tenant.leaseInfo.property}
                  </span>
                </div>
              </div>
            </section>
          </div>
          {props.tenant.paymentHistory && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Payment History
                </h3>
              </div>

              <div className="space-y-3">
                {props.tenant.paymentHistory.map((payment, j) => (
                  <div
                    key={j}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">
                          {new Date(payment.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-semibold text-foreground">
                        KSh {payment.amount.toLocaleString()}
                      </p>
                      <Badge variant="default" className="font-semibold">
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
