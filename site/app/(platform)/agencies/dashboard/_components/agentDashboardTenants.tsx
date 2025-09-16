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

    return (
        <section className="my-4">
            <header className="flex flex-row justify-between mb-4">
                <h2>Tenant Managmement</h2>
                <p>{props.tenants.length} active tenants</p>
            </header>
            <ul>
                {props.tenants.map((tenant, index) => {
                    return (
                        <li key={index} className="mb-4">
                            <Collapsible
                                open={storeIfOpen[index]}
                                onOpenChange={(open) => handleOpenCollapsible(index, open)}
                            >
                                <div className="flex flex-row justify-between items-center">
                                    <div className="lg:flex lg:flex-row lg:justify-between lg:flex-1">
                                        <div className="flex flex-row lg:flex-col gap-2 flex-wrap mb-2">
                                            <p>{tenant.name}</p>
                                            <p className="flex flex-row flex-wrap gap-2">
                                                <span><MapPin /></span>
                                                {tenant.property}
                                            </p>
                                        </div>

                                        <div className="flex flex-row lg:flex-col gap-2">
                                            <p>Ksh {tenant.rent}/month</p>
                                            <p>{tenant.status}</p>
                                        </div>
                                    </div>

                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="icon" className="size-8">
                                            <ChevronsUpDown />
                                            <span className="sr-only">Toggle</span>
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>
                                <CollapsibleContent>
                                    <section className="flex flex-col gap-4">
                                        <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                                            <section>
                                                <h3>Contact Information</h3>
                                                <p>
                                                    <span>Email: </span>
                                                    <span>{tenant.contactInfo.email}</span>
                                                </p>
                                                <p>
                                                    <span>Number: </span>
                                                    <span>{tenant.contactInfo.number}</span>
                                                </p>
                                            </section>

                                            <section>
                                                <h3>Lease Information</h3>
                                                <p>
                                                    <span>Initial Date: </span>
                                                    <span>{new Date(tenant.leaseInfo.initialDate).toLocaleDateString()}</span>
                                                </p>
                                                <p>
                                                    <span>Property: </span>
                                                    <span>{tenant.leaseInfo.property}</span>
                                                </p>
                                            </section>
                                        </div>


                                        <section>
                                            <header className="flex flex-row gap-1">
                                                <DollarSign />
                                                <h3>Payment History</h3>
                                            </header>
                                            <ul className="flex flex-col gap-2">
                                                {tenant.paymentHistory.map((payment, j) => (
                                                    <li key={j} className="flex flex-row justify-between">
                                                        <div className="flex flex-row gap-2">
                                                            <Calendar />
                                                            <p>{new Date(payment.date).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="flex flex-row gap-2">
                                                            <p>KSh {payment.amount}</p>
                                                            <p>{payment.status}</p>
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
                })}
            </ul>
        </section>
    );
}