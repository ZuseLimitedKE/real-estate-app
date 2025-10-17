"use client"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApartmentUnit, SinglePropertyFinances } from "@/types/agent_dashboard";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import PropertyFinancials from "../../properties/[id]/components/financials";
import PropertyTenants from "../../properties/[id]/components/tenants";

export default function ApartmentPropertyTemplateUnitView({ unit }: { unit: ApartmentUnit }) {
    const [open, setOpen] = useState<boolean>(false);

    const finances: SinglePropertyFinances = {
        propertyValue: unit.financials.unitValue,
        ...unit.financials
    }

    return (
        <Collapsible
            open={open}
            onOpenChange={setOpen}
            className="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
            <CollapsibleTrigger
                className="flex items-center justify-between w-full p-6 text-left hover:bg-slate-50 transition-colors"
            >
                <p className="text-xl font-semibold text-foreground">
                    {unit.name}
                </p>

                <ChevronsUpDown
                    className="w-5 h-5 ml-4 text-muted-foreground"
                    aria-hidden="true"
                />
                <span className="sr-only">Toggle unit details</span>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-4 p-2">
                <Tabs defaultValue="financials" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-12">
                        <TabsTrigger value="financials" className="text-sm font-medium">
                            Financials
                        </TabsTrigger>
                        <TabsTrigger value="tenant" className="text-sm font-medium">
                            Tenant
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-8">
                        <TabsContent value="financials" className="mt-0">
                            <PropertyFinancials
                                finances={finances}
                            />
                        </TabsContent>

                        <TabsContent value="tenant" className="mt-0">
                            <PropertyTenants tenant={unit.tenant}/>
                        </TabsContent>
                    </div>
                </Tabs>
            </CollapsibleContent>
        </Collapsible>
    );
}