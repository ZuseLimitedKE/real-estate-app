"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { DollarSign, House } from "lucide-react";
import { useState } from "react";

export default function PropertyTenants() {
    // const [storeIfOpen, setIfOpen] = useState<boolean[]>(new Array(props.tenants.length).fill(false));
    const [storeIfOpen, setIfOpen] = useState<boolean[]>([false, false]);

    function handleOpenCollapsible(index: number, state: boolean) {
        const newStoreIfOpen = [...storeIfOpen];
        newStoreIfOpen[index] = state;
        setIfOpen(newStoreIfOpen);
    }

    return (
        <section className="my-4">
            <Card>
                <CardHeader>
                    <h2>Property Tenants</h2>
                    <p>2 active tenants</p>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <Collapsible
                        open={storeIfOpen[0]}
                        onOpenChange={(open) => handleOpenCollapsible(0, open)}
                    >
                        <CollapsibleTrigger asChild>
                            <div className="flex flex-row justify-between">
                                <div className="flex flex-row items-center gap-2">
                                    <House className="w-6 h-6 text-primary" />
                                    <div>
                                        <p>John Doe</p>
                                        <p>Unit 12A</p>
                                    </div>
                                </div>

                                <div>
                                    <p>Ksh 35,000/month</p>
                                    <p>Since 15/01/2024</p>
                                </div>
                            </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                            <section>
                                <div className="mt-4 bg-slate-100 p-2">
                                    <header className="flex flex-row gap-2 items-center">
                                        <DollarSign className="w-4 h-4" />
                                        <h3>Payment History</h3>
                                    </header>

                                    <ul className="flex flex-col gap-2 mt-2">
                                        <li className="flex flex-row justify-between">
                                            <p>01/03/2024</p>
                                            <div className="flex flex-row gap-1">
                                                <p>Ksh 35,000</p>
                                                <p>paid</p>
                                            </div>
                                        </li>
                                        <li className="flex flex-row justify-between">
                                            <p>01/04/2024</p>
                                            <div className="flex flex-row gap-1">
                                                <p>Ksh 35,000</p>
                                                <p>paid</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </section>
                        </CollapsibleContent>
                    </Collapsible>

                    <Collapsible
                        open={storeIfOpen[1]}
                        onOpenChange={(open) => handleOpenCollapsible(1, open)}
                    >
                        <CollapsibleTrigger asChild>
                            <div className="flex flex-row justify-between">
                                <div className="flex flex-row items-center gap-2">
                                    <House className="w-6 h-6 text-primary" />
                                    <div>
                                        <p>John Doe</p>
                                        <p>Unit 12A</p>
                                    </div>
                                </div>

                                <div>
                                    <p>Ksh 35,000/month</p>
                                    <p>Since 15/01/2024</p>
                                </div>
                            </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                            <section>
                                <div className="mt-4 bg-slate-100 p-2">
                                    <header className="flex flex-row gap-2 items-center">
                                        <DollarSign className="w-4 h-4" />
                                        <h3>Payment History</h3>
                                    </header>

                                    <ul className="flex flex-col gap-2 mt-2">
                                        <li className="flex flex-row justify-between">
                                            <p>01/03/2024</p>
                                            <div className="flex flex-row gap-1">
                                                <p>Ksh 35,000</p>
                                                <p>paid</p>
                                            </div>
                                        </li>
                                        <li className="flex flex-row justify-between">
                                            <p>01/04/2024</p>
                                            <div className="flex flex-row gap-1">
                                                <p>Ksh 35,000</p>
                                                <p>paid</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </section>
                        </CollapsibleContent>
                    </Collapsible>
                </CardContent>
            </Card>
        </section>
    );
}