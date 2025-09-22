"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AgentPropertyTenants } from "@/types/agent_dashboard";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { DollarSign, House } from "lucide-react";
import { useState } from "react";

export default function PropertyTenants(props: { tenants: AgentPropertyTenants[] }) {
    const [storeIfOpen, setIfOpen] = useState<boolean[]>(new Array(props.tenants.length).fill(false));

    function handleOpenCollapsible(index: number, state: boolean) {
        const newStoreIfOpen = [...storeIfOpen];
        newStoreIfOpen[index] = state;
        setIfOpen(newStoreIfOpen);
    }

    const tenants = props.tenants.map((tenant, index) => {
        const paymentHistoryItems = tenant.paymentHistory.map((payment, i) => (
            <li className="flex flex-row justify-between" key={i}>
                <p>{new Date(payment.date).toDateString()}</p>
                <div className="flex flex-row gap-1">
                    <p>Ksh {payment.amount}</p>
                    <p>{payment.status}</p>
                </div>
            </li>
        ));

        return (
            <li key={index}>
                <Collapsible
                    open={storeIfOpen[index]}
                    onOpenChange={(open) => handleOpenCollapsible(index, open)}
                >
                    <CollapsibleTrigger asChild>
                        <div className="flex flex-row justify-between">
                            <div className="flex flex-row items-center gap-2">
                                <House className="w-6 h-6 text-primary" />
                                <div>
                                    <p>{tenant.name}</p>
                                    {tenant.unit && (<p>Unit 12A</p>)}
                                </div>
                            </div>

                            <div>
                                <p>Ksh {tenant.rent}/month</p>
                                <p>Since {new Date(tenant.joinDate).toDateString()}</p>
                            </div>
                        </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                        <section>
                            <div className="mt-4 bg-slate-100 p-2 lg:px-6">
                                <header className="flex flex-row gap-2 items-center">
                                    <DollarSign className="w-4 h-4" />
                                    <h3>Payment History</h3>
                                </header>

                                <ul className="flex flex-col gap-2 mt-2">
                                    {paymentHistoryItems}
                                </ul>
                            </div>
                        </section>
                    </CollapsibleContent>
                </Collapsible>
            </li>
        );
    })

    return (
        <section className="my-4">
            <Card>
                <CardHeader>
                    <h2>Property Tenants</h2>
                    <p>{props.tenants.length} active tenants</p>
                </CardHeader>
                <CardContent>
                    <ul className="flex flex-col gap-4">
                        {tenants}
                    </ul>
                </CardContent>
            </Card>
        </section>
    );
}