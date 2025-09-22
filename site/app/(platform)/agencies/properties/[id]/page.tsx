import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, MapPin } from "lucide-react";
import Image from "next/image";
import PropertyOverview from "./components/overview";
import PropertyFinancials from "./components/financials";
import PropertyDocuments from "./components/documents";
import PropertyTenants from "./components/tenants";

export default function AgentPropertyPage() {
    return (
        <main>
            <header className="lg:flex lg:flex-row lg:justify-between lg:gap-4 lg:items-center">
                <div className="flex flex-row justify-between items-center lg:flex-1">
                    <div>
                        <h1>Riverside Appartments</h1>
                        <p className="flex flex-row gap-2 items-center">
                            <span><MapPin className="w-4 h-4" /></span>
                            <span>123 River Road, Westlands, Nairobi</span>
                        </p>
                    </div>

                    <p>active</p>
                </div>


                <Button className="w-full my-4 lg:w-[150px]">
                    <Edit className="w-4 h-4" />
                    <p>Edit Property</p>
                </Button>

            </header>
            <article>
                <div className="lg:bg-slate-200">
                    <Carousel className="w-full max-w-xs my-4 lg:mx-auto ">
                        <CarouselContent>
                            {Array.from({ length: 5 }).map((_, index) => (
                                <CarouselItem key={index}>
                                    <div className="p-1">
                                        <Image
                                            src={"/executive-apartments-karen-nairobi.jpg"}
                                            width={500}
                                            height={500}
                                            alt="Riverside Appartments image"
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </div>


                <Tabs defaultValue="overview" className="w-full my-4">
                    <TabsList className="w-full flex-row justify-between">
                        <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                        <TabsTrigger value="financials" className="flex-1">Financials</TabsTrigger>
                        <TabsTrigger value="documents" className="flex-1">Documents</TabsTrigger>
                        <TabsTrigger value="tenants" className="flex-1">Tenants</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview">
                        <PropertyOverview />
                    </TabsContent>
                    <TabsContent value="financials">
                        <PropertyFinancials />
                    </TabsContent>
                    <TabsContent value="documents">
                        <PropertyDocuments />
                    </TabsContent>
                    <TabsContent value="tenants">
                        <PropertyTenants />
                    </TabsContent>
                </Tabs>
            </article>
        </main>
    );
}