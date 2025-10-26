"use client"

import { ApartmentUnitTemplate } from "@/types/agent_dashboard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";
import { useState } from "react";
import { Collapsible } from "@/components/ui/collapsible";
import { CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { ChevronsUpDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUIForAmenity } from "./overview";
import ApartmentPropertyTemplateUnitView from "../../../dashboard/_components/apartmentPropertyTemplateUnit";

export default function ApartmentTemplateView({ template, propertyid }: { template: ApartmentUnitTemplate, propertyid: string }) {
    const hasMultipleImages = template.images.length > 1;
    const [open, setOpen] = useState<boolean>(false);

    const amenitiesUI = template.overview.amenities.map((amenity, index) => (
        <div key={index}>{getUIForAmenity(amenity)}</div>
    ));

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
                    {template.name}
                </p>

                <ChevronsUpDown
                    className="w-5 h-5 ml-4 text-muted-foreground"
                    aria-hidden="true"
                />
                <span className="sr-only">Toggle tenant details</span>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-8 p-2">
                <div className="relative">
                    <Carousel className="w-full max-w-4xl mx-auto">
                        <CarouselContent>
                            {template.images.map((image, index) => (
                                <CarouselItem key={index}>
                                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                                        <Image
                                            src={image || "/placeholder.svg"}
                                            fill
                                            className="object-cover"
                                            alt={`${template.name} image ${index + 1}`}
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        {hasMultipleImages && (
                            <>
                                <CarouselPrevious className="left-4" />
                                <CarouselNext className="right-4" />
                            </>
                        )}
                    </Carousel>

                    {hasMultipleImages && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                            1 / {template.images.length}
                        </div>
                    )}
                </div>

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-12">
                        <TabsTrigger value="overview" className="text-sm font-medium">
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="units" className="text-sm font-medium">
                            Units
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-8">
                        <TabsContent value="overview" className="mt-0">
                            <section className="p-2">
                                <header>
                                    <h4 className="text-2xl font-bold text-foreground">Unit Template Details</h4>
                                </header>

                                <section className="space-y-6">
                                    <div className="flex items-center justify-between py-4 border-b border-border">
                                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                            Size
                                        </span>
                                        <p className="text-lg font-semibold text-foreground">
                                            {template.overview.size}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                            Amenities
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {amenitiesUI}
                                        </div>
                                    </div>

                                </section>
                            </section>
                        </TabsContent>

                        <TabsContent value="units" className="mt-0">
                            <section className="p-2">
                                <header>
                                    <h4 className="text-2xl font-bold text-foreground">Units</h4>
                                </header>

                                <section className="space-y-3 mt-4">
                                    {template.units.map((t, index) => <ApartmentPropertyTemplateUnitView unit={t} key={index} propertyid={propertyid}/>)}
                                </section>
                            </section>
                        </TabsContent>
                    </div>
                </Tabs>
            </CollapsibleContent>
        </Collapsible>


    );
}