import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, MapPin } from "lucide-react";
import Image from "next/image";
import PropertyOverview from "./components/overview";
import PropertyFinancials from "./components/financials";
import PropertyDocuments from "./components/documents";
import PropertyTenants from "./components/tenants";
import getPropertyFromID from "@/server-actions/agent/dashboard/getPropertyFromID";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function AgentPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getPropertyFromID(id);

  if (!property) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-2xl">
          <CardHeader className="text-center">
            <h1 className="text-3xl font-bold text-foreground">
              Property Not Found
            </h1>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground text-lg">
              The property you selected either does not exist or is not owned by
              your agency.
            </p>
            <p className="text-muted-foreground">
              Please go back to your dashboard page to select an existing
              property
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const hasMultipleImages = property.images.length > 1;

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      <header className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold text-foreground">
                {property.name}
              </h1>
              <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                {property.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-5 h-5" />
              <span className="text-lg">{property.address}</span>
            </div>
          </div>

          <Button size="lg" className="lg:w-auto w-full">
            <Edit className="w-4 h-4 mr-2" />
            Edit Property
          </Button>
        </div>
      </header>

      <section className="space-y-6">
        <div className="relative">
          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
              {property.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={image || "/placeholder.svg"}
                      fill
                      className="object-cover"
                      alt={`${property.name} image ${index + 1}`}
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
              1 / {property.images.length}
            </div>
          )}
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-12">
            <TabsTrigger value="overview" className="text-sm font-medium">
              Overview
            </TabsTrigger>
            <TabsTrigger value="financials" className="text-sm font-medium">
              Financials
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-sm font-medium">
              Documents
            </TabsTrigger>
            <TabsTrigger value="tenants" className="text-sm font-medium">
              Tenants
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="overview" className="mt-0">
              <PropertyOverview overview={property.overview} />
            </TabsContent>
            <TabsContent value="financials" className="mt-0">
              <PropertyFinancials finances={property.financials} />
            </TabsContent>
            <TabsContent value="documents" className="mt-0">
              <PropertyDocuments documents={property.documents} />
            </TabsContent>
            <TabsContent value="tenants" className="mt-0">
              <PropertyTenants tenants={property.tenants} />
            </TabsContent>
          </div>
        </Tabs>
      </section>
    </main>
  );
}
