"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PropertyTenant } from "@/types/agent_dashboard";
import {
  DollarSign,
  Mouse as House,
} from "lucide-react";

export default function PropertyTenants({ tenant }: { tenant: PropertyTenant | undefined }) {
  const paymentHistoryItems = tenant ? tenant.paymentHistory.map((payment, i) => (
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
  )) : <div></div>;

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">
          Property Tenant
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tenant ? (
          <div>
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <House className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground text-lg">
                    {tenant.name}
                  </p>
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
              </div>
            </div>

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
          </div>
        ) : (
          <p className="text-sm font-slate-500">There is not tenant</p>
        )}
      </CardContent>
    </Card>
  );
}
