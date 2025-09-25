"use client"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { AgentDashboardTenantsData } from "@/types/agent_dashboard";
import { Calendar, ChevronsUpDown, DollarSign, MapPin } from "lucide-react";

export default function AgentDashboardTenantCollapsible(props: {tenant: AgentDashboardTenantsData}) {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <Collapsible
            open={open}
            onOpenChange={setOpen}
            className="p-2 border rounded-md"
        >
            <CollapsibleTrigger className="flex flex-row justify-between items-center w-full text-left ">
                <div className="lg:flex lg:flex-row lg:justify-between lg:flex-1">
                    <div className="flex flex-row lg:flex-col gap-2 flex-wrap mb-2">
                        <p className="font-bold text-lg">{props.tenant.name}</p>
                        <p className="flex flex-row flex-wrap gap-2 text-slate-400 items-center text-sm">
                            <span>
                                <MapPin className="w-3 h-3" />
                            </span>
                            <span className="">{props.tenant.property}</span>
                        </p>
                    </div>

                    <div className="flex flex-row lg:flex-col gap-2">
                        <p className="font-bold">
                            {new Intl.NumberFormat("en-KE", {
                                style: "currency",
                                currency: "KES",
                            }).format(props.tenant.rent)}
                            /month
                        </p>
                        <p className="px-2 py-1 rounded-full bg-primary text-white font-bold text-xs lg:self-end">
                            {props.tenant.status}
                        </p>
                    </div>
                </div>

                <ChevronsUpDown aria-hidden="true" />
                <span className="sr-only">Toggle</span>
            </CollapsibleTrigger>

            <CollapsibleContent>
                <section className="flex flex-col gap-4">
                    <hr className="mt-4" />
                    <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                        <section>
                            <h3 className="text-lg font-bold mb-2">
                                Contact Information
                            </h3>
                            <p className="text-sm">
                                <span className="font-bold">Email: </span>
                                <span>{props.tenant.contactInfo.email}</span>
                            </p>
                            <p className="text-sm">
                                <span className="font-bold">Number: </span>
                                <span>{props.tenant.contactInfo.number}</span>
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold mb-2">Lease Information</h3>
                            <p className="text-sm">
                                <span className="font-bold">Initial Date: </span>
                                <span>
                                    {new Date(
                                        props.tenant.leaseInfo.initialDate,
                                    ).toLocaleDateString()}
                                </span>
                            </p>
                            <p className="text-sm">
                                <span className="font-bold">Property: </span>
                                <span>{props.tenant.leaseInfo.property}</span>
                            </p>
                        </section>
                    </div>

                    <section>
                        <header className="flex flex-row gap-1 items-center mb-2">
                            <DollarSign className="w-4 h-4" />
                            <h3 className="text-lg font-bold">Payment History</h3>
                        </header>
                        <ul className="flex flex-col gap-2">
                            {props.tenant.paymentHistory.map((payment, j) => (
                                <li key={j} className="flex flex-row justify-between">
                                    <div className="flex flex-row gap-2 items-center">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <p className="font-bold">
                                            {new Date(payment.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        <p className="font-bold">KSh {payment.amount}</p>
                                        <p className="px-2 py-1 rounded-full bg-primary text-white font-bold text-xs">
                                            {payment.status}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                </section>
            </CollapsibleContent>
        </Collapsible>
    );
}