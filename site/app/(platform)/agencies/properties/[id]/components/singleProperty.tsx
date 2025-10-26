import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentProperty } from "@/types/agent_dashboard";
import { Edit, MapPin } from "lucide-react";
import Image from "next/image";
import PropertyOverview from "./overview";
import PropertyFinancials from "./financials";
import PropertyDocuments from "./documents";
import PropertyTenants from "./tenants";
import Link from "next/link";
import PaymentsDistribution from "./distribution";

export default function SinglePropertyDetails(props: AgentProperty['single_property']) {
    if (!props) {
        return (<div></div>);
    }

    const hasMultipleImages = props.images.length > 1;

    return (
        <main className="container mx-auto px-4 py-8 space-y-8">
            <header className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-bold text-foreground">
                                {props.name}
                            </h1>
                            <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                                {props.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-5 h-5" />
                            <span className="text-lg">{props.address}</span>
                        </div>
                    </div>

                    <Button asChild size="lg" className="lg:w-auto w-full">
                        <Link
                            href={`/agencies/properties/${props.id}/edit`}
                            className="flex items-center gap-2"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Property
                        </Link>
                    </Button>

                </div>
            </header>

            <section className="space-y-6">
                <div className="relative">
                    <Carousel className="w-full max-w-4xl mx-auto">
                        <CarouselContent>
                            {props.images.map((image, index) => (
                                <CarouselItem key={index}>
                                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                                        <Image
                                            src={image || "/placeholder.svg"}
                                            fill
                                            className="object-cover"
                                            alt={`${props.name} image ${index + 1}`}
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
                            1 / {props.images.length}
                        </div>
                    )}
                </div>

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full md:grid-cols-5 grid-cols-3 h-12">
                        <TabsTrigger value="overview" className="text-sm font-medium">
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="financials" className="text-sm font-medium">
                            Financials
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="text-sm font-medium">
                            Documents
                        </TabsTrigger>
                        <TabsTrigger value="distribution" className="text-sm font-medium">
                            Distribution
                        </TabsTrigger>
                        <TabsTrigger value="tenants" className="text-sm font-medium">
                            Tenants
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-8">
                        <TabsContent value="overview" className="mt-0">
                            <PropertyOverview overview={props.overview} />
                        </TabsContent>
                        <TabsContent value="financials" className="mt-0">
                            <PropertyFinancials finances={props.financials} />
                        </TabsContent>
                        <TabsContent value="documents" className="mt-0">
                            <PropertyDocuments documents={props.documents} />
                        </TabsContent>
                        <TabsContent value="distribution" className="mt-0">
                            <PaymentsDistribution propertyId={props.id} monthlyRevenue={props.financials.monthlyRevenue}/>
                        </TabsContent>
                        <TabsContent value="tenants" className="mt-0">
                            <PropertyTenants tenant={props.tenant} />
                        </TabsContent>
                    </div>
                </Tabs>
            </section>
        </main>
    );
}