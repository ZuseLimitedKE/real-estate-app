import { Suspense } from "react";
import Link from "next/link";
import { PropertyDetails } from "./_components/PropertyDetails";
import { GetProperty } from "@/server-actions/property/get-property";
import type { PropertyDetailView } from "@/types/property";
import { Button } from "@/components/ui/button";

function transformPropertyForView(found: any): PropertyDetailView {
  const totalFractions: number =
    typeof found.totalFractions === "number" ? found.totalFractions : 0;
  const totalOwned: number = Array.isArray(found.property_owners)
    ? found.property_owners.reduce(
      (sum: number, owner: any) => sum + (owner?.amount_owned || 0),
      0,
    )
    : 0;
  const availableSharesPct: number =
    totalFractions > 0
      ? Math.max(0, Math.round(100 - (totalOwned / totalFractions) * 100))
      : 100;

  const valueNumber: number =
    typeof found.property_value === "number" ? found.property_value : 0;
  const monthlyRentNumber: number =
    typeof found.proposedRentPerMonth === "number"
      ? found.proposedRentPerMonth
      : 0;
  const annualYieldPct: string =
    valueNumber > 0 && monthlyRentNumber > 0
      ? `${(((monthlyRentNumber * 12) / valueNumber) * 100).toFixed(1)}%`
      : "0%";

  const units = found.apartmentDetails?.units;
  const totalUnits = Array.isArray(units) ? units.length : 0;
  const occupiedUnits = Array.isArray(units)
    ? units.filter((u: any) => Boolean(u?.tenant)).length
    : 0;
  const occupancyRate =
    totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  return {
    original: found,
    id: found._id?.toString?.() ?? "",
    image: (Array.isArray(found.images) && found.images[0]) || "/logo.png",
    title: found.name ?? "",
    location: found.location?.address ?? "",
    value: `KSh ${new Intl.NumberFormat().format(valueNumber)}`,
    yield: annualYieldPct,
    investors: Array.isArray(found.property_owners)
      ? found.property_owners.length
      : 0,
    availableShares: availableSharesPct,
    minInvestment: `${found.serviceFeePercent ?? 0}% fee`,
    verified: found.property_status === "approved",
    description: found.description ?? "",
    propertyType: found.type ?? "",
    bedrooms:
      typeof found.amenities?.bedrooms === "number"
        ? `${found.amenities.bedrooms} Bedrooms`
        : "",
    bathrooms:
      typeof found.amenities?.bathrooms === "number"
        ? `${found.amenities.bathrooms} Bathrooms`
        : "",
    area:
      typeof found.gross_property_size === "number"
        ? `${found.gross_property_size} sq ft`
        : "",
    yearBuilt: "",
    totalUnits: totalUnits,
    occupancyRate: occupancyRate,
    monthlyRent: `KSh ${new Intl.NumberFormat().format(monthlyRentNumber)}`,
    amenities: Object.entries(found.amenities || {})
      .filter(([_, v]) => Boolean(v))
      .map(([k]) =>
        k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      ),
    gallery:
      Array.isArray(found.images) && found.images.length > 0
        ? found.images
        : ["/logo.png"],
  };
}

interface PropertyDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getPropertyData(id: string) {
  try {
    const property = await GetProperty(id);
    if (!property) {
      return null;
    }
    return transformPropertyForView(property);
  } catch (error) {
    console.error("Failed to fetch property:", error);
    return null;
  }
}

export default async function PropertyDetailsPage({
  params,
}: PropertyDetailsPageProps) {
  const { id } = await params;
  const property = await getPropertyData(id);

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Property Not Found
          </h1>
          <p className="text-muted-foreground">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild className="font-semibold">
            <Link href="/properties">Back to Properties</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<PropertyDetailsSkeleton />}>
            <PropertyDetails property={property} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function PropertyDetailsSkeleton() {
  return (
    <>
      {/* Back Button Skeleton */}
      <div className="h-10 w-40 bg-muted rounded mb-6 animate-pulse"></div>

      {/* Hero Section Skeleton */}
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          {/* Main Image Skeleton */}
          <div className="w-full h-96 bg-muted rounded-lg mb-6 animate-pulse"></div>

          {/* Gallery Skeleton */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-24 bg-muted rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        {/* Sticky Card Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <div>
              <div className="h-8 bg-muted rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-20 animate-pulse"></div>
                <div className="h-6 bg-muted rounded w-24 animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-16 animate-pulse"></div>
                <div className="h-6 bg-muted rounded w-20 animate-pulse"></div>
              </div>
            </div>

            <div className="h-2 bg-muted rounded animate-pulse"></div>

            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                </div>
              ))}
            </div>

            <div className="h-11 bg-muted rounded animate-pulse"></div>
            <div className="h-10 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-8">
        <div className="h-10 bg-muted rounded animate-pulse"></div>
        <div className="space-y-6">
          <div className="h-32 bg-muted rounded animate-pulse"></div>
          <div className="h-48 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    </>
  );
}
