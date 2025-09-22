"use client"
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { Calendar, ChevronsUpDown, DollarSign, MapPin } from "lucide-react";
import { useState } from "react";

interface AgentDashboardTenantsData {
    name: string,
    property: string,
    rent: number,
    status: string,
    contactInfo: {
        email: string,
        number: string
    },
    leaseInfo: {
        property: string,
        initialDate: Date
    },
    paymentHistory: {
        date: Date,
        amount: number,
        status: string
    }[]
}

export default function AgentDashboardTenants(props: { tenants: AgentDashboardTenantsData[] }) {
    const [storeIfOpen, setIfOpen] = useState<boolean[]>(new Array(props.tenants.length).fill(false));

    function handleOpenCollapsible(index: number, state: boolean) {
        const newStoreIfOpen = [...storeIfOpen];
        newStoreIfOpen[index] = state;
        setIfOpen(newStoreIfOpen);
    }

    const tenantItems = props.tenants.map((tenant, index) => {
        return (
            <li key={index} className="mb-4 p-3 border border-slate-200 rounded-lg">
                <Collapsible
                    open={storeIfOpen[index]}
                    onOpenChange={(open) => handleOpenCollapsible(index, open)}
                >
                    <CollapsibleTrigger asChild>
                        <div className="flex flex-row justify-between items-center">
                            <div className="lg:flex lg:flex-row lg:justify-between lg:flex-1">
                                <div className="flex flex-row lg:flex-col gap-2 flex-wrap mb-2">
                                    <p className="font-bold text-lg">{tenant.name}</p>
                                    <p className="flex flex-row flex-wrap gap-2 text-slate-400 items-center text-sm">
                                        <span><MapPin className="w-3 h-3" /></span>
                                        <span className="">{tenant.property}</span>
                                    </p>
                                </div>

                                <div className="flex flex-row lg:flex-col gap-2">
                                    <p className="font-bold">Ksh {tenant.rent}/month</p>
                                    <p className="px-2 py-1 rounded-full bg-primary text-white font-bold text-xs">{tenant.status}</p>
                                </div>
                            </div>

                            <Button variant="ghost" size="icon" className="size-8">
                                <ChevronsUpDown />
                                <span className="sr-only">Toggle</span>
                            </Button>
                        </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                        <section className="flex flex-col gap-4">
                            <hr className="mt-4"/>
                            <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                                <section>
                                    <h3 className="text-lg font-bold mb-2">Contact Information</h3>
                                    <p className="text-sm">
                                        <span className="font-bold">Email: </span>
                                        <span>{tenant.contactInfo.email}</span>
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-bold">Number: </span>
                                        <span>{tenant.contactInfo.number}</span>
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-lg font-bold mb-2">Lease Information</h3>
                                    <p className="text-sm">
                                        <span className="font-bold">Initial Date: </span>
                                        <span>{new Date(tenant.leaseInfo.initialDate).toLocaleDateString()}</span>
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-bold">Property: </span>
                                        <span>{tenant.leaseInfo.property}</span>
                                    </p>
                                </section>
                            </div>


                            <section>
                                <header className="flex flex-row gap-1 items-center mb-2">
                                    <DollarSign className="w-4 h-4"/>
                                    <h3 className="text-lg font-bold">Payment History</h3>
                                </header>
                                <ul className="flex flex-col gap-2">
                                    {tenant.paymentHistory.map((payment, j) => (
                                        <li key={j} className="flex flex-row justify-between">
                                            <div className="flex flex-row gap-2 items-center">
                                                <Calendar className="w-4 h-4 text-slate-400"/>
                                                <p className="font-bold">{new Date(payment.date).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex flex-row gap-2">
                                                <p className="font-bold">KSh {payment.amount}</p>
                                                <p className="px-2 py-1 rounded-full bg-primary text-white font-bold text-xs">{payment.status}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </section>
                    </CollapsibleContent>
                </Collapsible>
            </li>
        );
    });

    return (
        <article>
            <header className="flex flex-row justify-between my-4">
                <h2 className="font-bold text-2xl">Tenant Managmement</h2>
                <p className="text-slate-400">{props.tenants.length} active tenants</p>
            </header>
            <ul>
                {tenantItems}
            </ul>
        </article>
    );
}