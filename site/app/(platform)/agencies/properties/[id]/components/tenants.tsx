"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgentPropertyTenants } from "@/types/agent_dashboard";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import {
  ChevronDown,
  ChevronRight,
  DollarSign,
  Mouse as House,
} from "lucide-react";
import { useState } from "react";

export default function PropertyTenants(props: {
  tenants: AgentPropertyTenants[];
}) {
  const [storeIfOpen, setIfOpen] = useState<boolean[]>(
    new Array(props.tenants.length).fill(false),
  );

  function handleOpenCollapsible(index: number, state: boolean) {
    const newStoreIfOpen = [...storeIfOpen];
    newStoreIfOpen[index] = state;
    setIfOpen(newStoreIfOpen);
  }

  const tenants = props.tenants.map((tenant, index) => {
    const paymentHistoryItems = tenant.paymentHistory.map((payment, i) => (
      <li
        className="flex items-center justify-between py-3 border-b border-border last:border-0"
        key={i}
      >
        <p className="text-muted-foreground">
          {new Date(payment.date).toDateString()}
        </p>
        <div className="flex items-center gap-3">
          <p className="font-semibold text-foreground">
            Ksh {payment.amount.toLocaleString()}
          </p>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${payment.status === "Paid"
                ? "bg-success/10 text-success"
                : payment.status === "Pending"
                  ? "bg-warning/10 text-warning"
                  : "bg-destructive/10 text-destructive"
              }`}
          >
            {payment.status}
          </span>
        </div>
      </li>
    ));

    return (
      <li key={index} className="border border-border rounded-lg bg-card">
        <Collapsible
          open={storeIfOpen[index]}
          onOpenChange={(open) => handleOpenCollapsible(index, open)}
        >
          <CollapsibleTrigger className="w-full p-6 text-left hover:bg-muted/50 transition-colors rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <House className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground text-lg">
                    {tenant.name}
                  </p>
                  {tenant.unit && (
                    <p className="text-muted-foreground">Unit {tenant.unit}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right space-y-1">
                  <p className="font-bold text-foreground text-lg">
                    Ksh {tenant.rent.toLocaleString()}/month
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Since {new Date(tenant.joinDate).toDateString()}
                  </p>
                </div>
                {storeIfOpen[index] ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="px-6 pb-6">
              <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground text-lg">
                    Payment History
                  </h3>
                </div>

                <ul className="space-y-0">{paymentHistoryItems}</ul>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </li>
    );
  });

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">
          Property Tenants
        </CardTitle>
        <p className="text-muted-foreground">
          {props.tenants.length} active tenant
          {props.tenants.length !== 1 ? "s" : ""}
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">{tenants}</ul>
      </CardContent>
    </Card>
  );
}
