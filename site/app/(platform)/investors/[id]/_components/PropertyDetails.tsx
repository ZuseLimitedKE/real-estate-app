"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import BuyTokensForm from "./BuyTokensForm";
import type { PropertyDetailView } from "@/types/property";
import { useAccount, useReadContract } from "wagmi";
import erc20Abi from "@/smartcontract/abi/ERC20.json";
import marketPlaceAbi from "@/smartcontract/abi/MarketPlace.json";
import {
  MapPin,
  TrendingUp,
  Users,
  Verified,
  ArrowLeft,
  Building,
  DollarSign,
  Activity,
  Home,
  CheckCircle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DepositUSDC from "../../portfolio/_components/DepositUSDC";

interface PropertyDetailsClientProps {
  property: PropertyDetailView;
}
const PropertyMap = dynamic(() => import("./PropertyMap"), { ssr: false });

function isApartment(property: PropertyDetailView): boolean {
  return (
    (property.original?.apartmentDetails?.units &&
      Array.isArray(property.original.apartmentDetails.units) &&
      property.original.apartmentDetails.units.length > 0) ??
    false
  );
}

export function PropertyDetails({ property }: PropertyDetailsClientProps) {
  const [buyTokensDialog, setBuyTokensDialog] = useState(false);
  const [insufficientUSDCAlert, setInsufficientUSDCAlert] = useState(false);
  const [openDepositUSDCDialog, setOpenDepositUSDCDialog] = useState(false);
  const { address } = useAccount();

  const MARKETPLACE = process.env
    .NEXT_PUBLIC_MARKETPLACE_CONTRACT as `0x${string}`;
  const USDC = process.env.NEXT_PUBLIC_USDC_TOKEN as `0x${string}`;

  const { data: escrowBalance, isLoading: isEscrowLoading } = useReadContract({
    address: MARKETPLACE,
    abi: marketPlaceAbi.abi,
    functionName: "getEscrowBalance",
    args: [USDC, address ?? "0x0000000000000000000000000000000000000000"],
    query: { enabled: !!address },
  });

  const { data: decimals } = useReadContract({
    address: USDC,
    abi: erc20Abi.abi,
    functionName: "decimals",
  });

  const formattedBalance =
    escrowBalance && decimals
      ? Number(escrowBalance) / 10 ** Number(decimals)
      : 0;

  const handleDepositUSDCClick = () => {
    setOpenDepositUSDCDialog(true);
  };

  const isApt = isApartment(property);

  return (
    <>
      <Link href="/investors">
        <Button
          variant="outline"
          className="mb-6 flex items-center gap-2 bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Properties
        </Button>
      </Link>

      {/* Hero Section */}
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <div className="relative rounded-lg overflow-hidden mb-6">
            <Image
              src={property.image || "/placeholder.svg"}
              alt={property.title}
              width={1200}
              height={600}
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
            {property.gallery.map((img: string, index: number) => (
              <Image
                key={index}
                src={img || "/placeholder.svg"}
                alt={`${property.title} ${index + 1}`}
                width={400}
                height={200}
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
                  <p className="text-sm text-muted-foreground">Annual Yield</p>
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
                onClick={() => {
                  if (formattedBalance === 0) {
                    setInsufficientUSDCAlert(true);
                  } else {
                    setBuyTokensDialog(true);
                  }
                }}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Invest Now
              </Button>

              <Button variant="outline" className="w-full bg-transparent">
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
          {isApt ? (
            // APARTMENT-SPECIFIC OVERVIEW
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Apartment Overview
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
                          <span className="text-foreground capitalize">
                            {property.propertyType}
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
                            {property.yearBuilt || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">
                        Occupancy & Units
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
                          <span className="text-success font-semibold">
                            {property.occupancyRate}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Monthly Rent (Total)
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

              {/* Unit Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Unit Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {property.original?.apartmentDetails?.units?.map(
                      (unit: any, index: number) => (
                        <div
                          key={index}
                          className="border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50"
                        >
                          {/* Unit Image */}
                          {unit.images && unit.images[0] && (
                            <div className="relative h-40 overflow-hidden bg-gray-200 dark:bg-gray-700">
                              <Image
                                src={unit.images[0] || "/placeholder.svg"}
                                alt={unit.name}
                                width={400}
                                height={200}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                              {/* Occupancy Badge */}
                              <div className="absolute top-3 right-3">
                                <Badge
                                  className={`${unit.tenant
                                      ? "bg-success text-success-foreground"
                                      : "bg-amber-500 text-white"
                                    } border-0`}
                                >
                                  {unit.tenant ? "Occupied" : "Vacant"}
                                </Badge>
                              </div>
                            </div>
                          )}

                          {/* Unit Details */}
                          <div className="p-4 space-y-4">
                            <div>
                              <h5 className="font-bold text-lg text-foreground mb-1">
                                {unit.name}
                              </h5>
                              <p className="text-sm text-muted-foreground">
                                {unit.description || "Unit details"}
                              </p>
                            </div>

                            {/* Specs Grid */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-slate-50 dark:bg-slate-900/20 rounded-lg p-3">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                                  Bedrooms
                                </p>
                                <p className="text-lg font-bold text-foreground">
                                  {unit.bedrooms || "N/A"}
                                </p>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-900/20 rounded-lg p-3">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                                  Bathrooms
                                </p>
                                <p className="text-lg font-bold text-foreground">
                                  {unit.bathrooms || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Rent Section */}
                            <div className="border-t border-border pt-3">
                              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                                Monthly Rent
                              </p>
                              <p className="text-2xl font-bold text-success">
                                KSh{" "}
                                {new Intl.NumberFormat().format(
                                  unit.proposedRentPerMonth || 0,
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            // SINGLE PROPERTY OVERVIEW
            <>
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
                          <span className="text-foreground capitalize">
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
                    {property.amenities.map(
                      (amenity: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-foreground">{amenity}</span>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
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
                  <span className="text-muted-foreground">Annual Yield</span>
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
                      Number.parseFloat(property.yield.replace("%", "")) + 12.5
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
              {property?.original?.location?.coordinates ? (
                <PropertyMap
                  lat={property.original.location.coordinates.lat}
                  lng={property.original.location.coordinates.lng}
                  title={property.title}
                  location={property.location}
                />
              ) : (
                <div className="h-96 bg-muted rounded-lg mb-6 flex items-center justify-center border border-border">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      No map coordinates provided
                    </p>
                  </div>
                </div>
              )}
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
              {property?.original?.documents &&
                property?.original?.documents?.length > 0 ? (
                <div className="space-y-3">
                  {property.original.documents?.map((doc, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-between bg-transparent"
                      asChild
                    >
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="flex items-center gap-2">
                          <span>📄</span>
                          <span className="text-left">
                            <div className="font-medium">{doc.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {doc.type} • {doc.size}
                            </div>
                          </span>
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Download
                        </span>
                      </a>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    No documents available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Buy Tokens Modal */}
      <BuyTokensForm
        propertyId={property.id}
        propertyName={property.title}
        isOpen={buyTokensDialog}
        onClose={() => setBuyTokensDialog(false)}
      />
      <AlertDialog
        open={insufficientUSDCAlert}
        onOpenChange={setInsufficientUSDCAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Insufficient Funds</AlertDialogTitle>
            <AlertDialogDescription>
              Please deposit some USDC to escrow before investing in this
              property
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDepositUSDCClick}>
              Deposit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DepositUSDC
        open={openDepositUSDCDialog}
        setOpen={setOpenDepositUSDCDialog}
      />
    </>
  );
}
