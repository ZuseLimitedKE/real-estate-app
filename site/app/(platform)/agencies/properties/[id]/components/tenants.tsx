"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AgentPropertyTenants } from "@/types/agent_dashboard";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { ChevronsUpDown, DollarSign, House } from "lucide-react";
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
                    <p className="font-bold">Ksh {payment.amount}</p>
                    <p className="px-2 py-1 rounded-full bg-primary text-white font-bold text-xs">{payment.status}</p>
                </div>
            </li>
        ));

        return (
            <li key={index}>
                <Collapsible
                    open={storeIfOpen[index]}
                    onOpenChange={(open) => handleOpenCollapsible(index, open)}
                >
                    <CollapsibleTrigger className="flex w-full flex-row justify-between text-left">
                        <div className="flex flex-row items-center gap-2">
                            <House className="w-6 h-6 text-primary" />
                            <div>
                                <p className="font-bold">{tenant.name}</p>
                                {tenant.unit && (<p className="text-slate-500">Unit {tenant.unit}</p>)}
                            </div>
                        </div>

                        <div className="flex flex-row gap-1 items-center">
                            <div>
                                <p className="font-bold">Ksh {tenant.rent}/month</p>
                                <p className="text-slate-500">Since {new Date(tenant.joinDate).toDateString()}</p>
                            </div>
                            <ChevronsUpDown className="w-4 h-4" />
                        </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                        <section>
                            <div className="mt-4 bg-slate-100 p-2 lg:px-6">
                                <header className="flex flex-row gap-2 items-center font-bold">
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
                    <h2 className="text-lg font-bold">Property Tenants</h2>
                    <p className="text-sm text-slate-500">{props.tenants.length} active tenants</p>
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