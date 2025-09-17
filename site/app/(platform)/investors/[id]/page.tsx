"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
<<<<<<< HEAD
import BuyTokensForm from "./_components/BuyTokensForm";
=======
>>>>>>> 41b49ab571a6f2a8cd0eeb57b3c0c56fbeb0c64d
import {
  MapPin,
  TrendingUp,
  Users,
  Verified,
  ArrowLeft,
  Calendar,
  Home,

  Building,
  DollarSign,
  Target,
  Activity,
  Clock,
  CheckCircle,
} from "lucide-react";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

const PropertyDetailsScreen = () => {
  const { id } = useParams();
  const [isBuyTokensOpen, setIsBuyTokensOpen] = useState(false);

  // Mock property data - in real app, this would come from API/database
  const properties = [
    {
      id: "1",
      image: property1,
      title: "Kilimani Heights",
      location: "Kilimani, Nairobi",
      value: "KSh 35M",
      yield: "7.8%",
      investors: 142,
      availableShares: 45,
      minInvestment: "KSh 15,000",
      verified: true,
      description:
        "A premium residential apartment complex in the heart of Kilimani, offering modern amenities and excellent rental yields. This property features contemporary design with high-quality finishes throughout.",
      propertyType: "Residential Apartments",
      bedrooms: "1-3 Bedrooms",
      bathrooms: "1-2 Bathrooms",
      area: "850 - 1,200 sq ft",
      yearBuilt: "2021",
      totalUnits: 48,
      occupancyRate: 94,
      monthlyRent: "KSh 45,000 - KSh 85,000",
      amenities: [
        "Swimming Pool",
        "Gym",
        "Parking",
        "Security",
        "Backup Generator",
        "Water Tank",
        "CCTV",
        "Elevator",
      ],
      gallery: [property1, property2, property3],
    },
    {
      id: "2",
      image: property2,
      title: "Parklands Plaza",
      location: "Parklands, Nairobi",
      value: "KSh 52M",
      yield: "8.9%",
      investors: 218,
      availableShares: 32,
      minInvestment: "KSh 20,000",
      verified: true,
      description:
        "Commercial plaza in the vibrant Parklands area, featuring retail shops and office spaces with high foot traffic and excellent visibility.",
      propertyType: "Commercial Plaza",
      bedrooms: "N/A",
      bathrooms: "Multiple",
      area: "2,500 - 5,000 sq ft",
      yearBuilt: "2020",
      totalUnits: 24,
      occupancyRate: 96,
      monthlyRent: "KSh 80,000 - KSh 150,000",
      amenities: [
        "Parking",
        "Security",
        "Backup Generator",
        "Elevator",
        "Reception",
        "Conference Rooms",
      ],
      gallery: [property2, property1, property3],
    },
    {
      id: "3",
      image: property3,
      title: "Lavington Gardens",
      location: "Lavington, Nairobi",
      value: "KSh 41M",
      yield: "8.1%",
      investors: 189,
      availableShares: 58,
      minInvestment: "KSh 12,000",
      verified: true,
      description:
        "Luxury residential compound in prestigious Lavington, offering spacious family homes with beautiful gardens and premium amenities.",
      propertyType: "Townhouses",
      bedrooms: "3-4 Bedrooms",
      bathrooms: "3-4 Bathrooms",
      area: "1,800 - 2,400 sq ft",
      yearBuilt: "2022",
      totalUnits: 16,
      occupancyRate: 100,
      monthlyRent: "KSh 120,000 - KSh 180,000",
      amenities: [
        "Private Garden",
        "Parking",
        "Security",
        "Playground",
        "Clubhouse",
        "Swimming Pool",
      ],
      gallery: [property3, property1, property2],
    },
  ];

  const property = properties.find((p) => p.id === id);

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <main className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Property Not Found
            </h1>
            <Link href="/properties">
              <Button variant="default">Back to Properties</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link href="/investors">
            <Button variant="outline" className="mb-6 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Properties
            </Button>
          </Link>

          {/* Hero Section */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="relative rounded-lg overflow-hidden mb-6">
                <Image
                  src={property.image}
                  alt={property.title}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-success text-success-foreground"
                  >
                    {property.yield} Yield
                  </Badge>
                  {property.verified && (
                    <Badge
                      variant="secondary"
                      className="bg-primary text-primary-foreground"
                    >
                      <Verified className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>

              {/* Property Gallery */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {property.gallery.map((img, index) => (
                  <Image
                    key={index}
                    src={img}
                    alt={`${property.title} ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {property.title}
                  </CardTitle>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.location}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Property Value
                      </p>
                      <p className="text-xl font-bold text-foreground">
                        {property.value}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Annual Yield
                      </p>
                      <p className="text-xl font-bold text-success">
                        {property.yield}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">
                        Available Shares
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {property.availableShares}%
                      </span>
                    </div>
                    <Progress
                      value={100 - property.availableShares}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {100 - property.availableShares}% funded
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Min Investment
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {property.minInvestment}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Investors
                      </span>
                      <span className="text-sm font-medium text-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {property.investors}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="default"
                    className="w-full"
                    size="lg"
                    onClick={() => setIsBuyTokensOpen(true)}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Invest Now
                  </Button>

                  <Button variant="outline" className="w-full">
                    Download Prospectus
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Property Details Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Property Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {property.description}
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">
                        Property Details
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Property Type
                          </span>
                          <span className="text-foreground">
                            {property.propertyType}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Bedrooms
                          </span>
                          <span className="text-foreground">
                            {property.bedrooms}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Bathrooms
                          </span>
                          <span className="text-foreground">
                            {property.bathrooms}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Area</span>
                          <span className="text-foreground">
                            {property.area}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Year Built
                          </span>
                          <span className="text-foreground">
                            {property.yearBuilt}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">
                        Investment Metrics
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Total Units
                          </span>
                          <span className="text-foreground">
                            {property.totalUnits}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Occupancy Rate
                          </span>
                          <span className="text-success">
                            {property.occupancyRate}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Monthly Rent
                          </span>
                          <span className="text-foreground">
                            {property.monthlyRent}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Amenities & Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-foreground">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financials" className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Investment Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Annual Yield
                      </span>
                      <span className="text-2xl font-bold text-success">
                        {property.yield}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Capital Appreciation (1Y)
                      </span>
                      <span className="text-lg font-semibold text-success">
                        +12.5%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Total Return (1Y)
                      </span>
                      <span className="text-lg font-semibold text-success">
                        +
                        {(
                          parseFloat(property.yield.replace("%", "")) + 12.5
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-muted-foreground">
                        Dividend paid: KSh 2,340
                      </span>
                      <span className="text-xs text-muted-foreground">
                        2 days ago
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-muted-foreground">
                        New investor joined
                      </span>
                      <span className="text-xs text-muted-foreground">
                        1 week ago
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-muted-foreground">
                        Rent collected: 98%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        2 weeks ago
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="location" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location & Neighborhood
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg mb-6 flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Interactive Map Placeholder
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-foreground">
                        Transport
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Matatu stage - 2 min walk</li>
                        <li>• Bus stop - 5 min walk</li>
                        <li>• CBD - 15 min drive</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-foreground">
                        Shopping
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Supermarket - 3 min walk</li>
                        <li>• Shopping mall - 10 min drive</li>
                        <li>• Local market - 5 min walk</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-foreground">
                        Healthcare
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Clinic - 5 min walk</li>
                        <li>• Hospital - 8 min drive</li>
                        <li>• Pharmacy - 2 min walk</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Legal Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      📄 Property Title Deed
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      📊 Financial Prospectus
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      🏗️ Building Plans & Approvals
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      📋 Property Valuation Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      ⚖️ Legal Due Diligence Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* Buy Tokens Modal */}
      <BuyTokensForm
        propertyId={property.id}
        propertyName={property.title}
        isOpen={isBuyTokensOpen}
        onClose={() => setIsBuyTokensOpen(false)}
      />
    </div>
  );
};

export default PropertyDetailsScreen;
