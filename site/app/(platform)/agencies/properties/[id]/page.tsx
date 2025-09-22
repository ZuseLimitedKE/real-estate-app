import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, MapPin } from "lucide-react";
import Image from "next/image";
import PropertyOverview from "./components/overview";
import PropertyFinancials from "./components/financials";
import PropertyDocuments from "./components/documents";
import PropertyTenants from "./components/tenants";
import { AMENITIES } from "@/types/agent_dashboard";

export default function AgentPropertyPage() {
    const property = {
        name: "Riverside Appartments",
        address: "123 River Road, Westlands, Nairobi",
        status: "active",
        images: ["/executive-apartments-karen-nairobi.jpg", "/garden-city-residences-thika-road-nairobi.jpg"],
        overview: {
            propertyDetails: {
                type: "Residential",
                size: 2500,
                units: 24,
                floors: 6,
                parkingSpace: 30,
                createdAt: new Date()
            },
            occupancy: {
                occupied: 22,
                monthlyRevenue: 85000,
                totalUnits: 24,
                rate: 92.0
            },
            about: "Modern residential complex featuring contemporary design and premium amenities. Located in the heart of Westlands with easy access to shopping centers, restaurants, and business districts.",
            amenities: [AMENITIES.WIFI, AMENITIES.PARKING, AMENITIES.SWIMMING, AMENITIES.FITNESS],
        },
        financials: {
            propertyValue: 15000000,
            expectedYield: 8.5,
            monthlyRevenue: 85000,
            annualRevenue: 1020000,
            roi: 6.08,
        },
        documents: [
            {
                name: "Title Deed",
                type: "PDF",
                size: "2.3MB",
                url: "something"
            },
            {
                name: "Title Deed",
                type: "PDF",
                size: "2.3MB",
                url: "something"
            }
        ],
        tenants: [
            {
                name: "John Doe",
                unit: "Unit 12A",
                rent: 35000,
                joinDate: new Date("15/01/2024"),
                paymentHistory: [
                    {
                        date: new Date("01/03/2024"),
                        amount: 35000,
                        status: "paid"
                    },
                    {
                        date: new Date("01/03/2024"),
                        amount: 35000,
                        status: "paid"
                    }
                ]
            },
            {
                name: "John Doe",
                unit: "Unit 12A",
                rent: 35000,
                joinDate: new Date("15/01/2024"),
                paymentHistory: [
                    {
                        date: new Date("01/03/2024"),
                        amount: 35000,
                        status: "paid"
                    },
                    {
                        date: new Date("01/03/2024"),
                        amount: 35000,
                        status: "paid"
                    }
                ]
            }
        ]
    };

    return (
        <main>
            <header className="lg:flex lg:flex-row lg:justify-between lg:gap-4 lg:items-center">
                <div className="flex flex-row justify-between items-center lg:flex-1">
                    <div>
                        <h1 className="font-bold text-xl">{property.name}</h1>
                        <p className="flex flex-row gap-2 items-center text-sm text-slate-500">
                            <span><MapPin className="w-4 h-4" /></span>
                            <span>{property.address}</span>
                        </p>
                    </div>

                    <p className="px-2 py-1 rounded-full bg-primary text-white font-bold text-xs">{property.status}</p>
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
                            {property.images.map((image, index) => (
                                <CarouselItem key={index}>
                                    <div className="p-1">
                                        <Image
                                            src={image}
                                            width={500}
                                            height={500}
                                            alt={`${property.name} image ${index}`}
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
                        <PropertyOverview overview={property.overview} />
                    </TabsContent>
                    <TabsContent value="financials">
                        <PropertyFinancials finances={property.financials} />
                    </TabsContent>
                    <TabsContent value="documents">
                        <PropertyDocuments documents={property.documents} />
                    </TabsContent>
                    <TabsContent value="tenants">
                        <PropertyTenants tenants={property.tenants} />
                    </TabsContent>
                </Tabs>
            </article>
        </main>
    );
}