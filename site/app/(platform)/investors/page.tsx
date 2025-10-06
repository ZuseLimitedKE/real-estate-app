import { Suspense } from "react";
import { PropertyListings } from "./_components/property-listings";
import { GetProperties } from "@/server-actions/property/get-property";

function transformProperty(p: any) {
  const totalFractions = p.totalFractions || 0;
  const owned = Array.isArray(p.property_owners)
    ? p.property_owners.reduce(
      (a: number, o: any) => a + (o.amount_owned || 0),
      0,
    )
    : 0;
  const availablePct =
    totalFractions > 0
      ? Math.max(0, Math.round(100 - (owned / totalFractions) * 100))
      : 0;

  // Calculate price per token (assuming property value divided by total fractions)
  const pricePerToken = p.property_value && p.totalFractions 
    ? p.property_value / p.totalFractions 
    : 0;

  // Mock projected return (in a real app, this would come from property data)
  const projectedReturn = "8.5-12%";

  return {
    id: p._id?.toString?.() ?? "",
    image: (p.images && p.images[0]) || "/logo.png",
    title: p.name ?? "Property",
    location: p.location?.address ?? "—",
    value: p.property_value
      ? `KSh ${new Intl.NumberFormat().format(p.property_value)}`
      : "—",
    yield:
      p.proposedRentPerMonth && p.property_value
        ? `${(((p.proposedRentPerMonth * 12) / p.property_value) * 100).toFixed(
          1,
        )}%`
        : "—",
    investors: Array.isArray(p.property_owners) ? p.property_owners.length : 0,
    availableShares: availablePct,
    minInvestment: p.serviceFeePercent ? `${p.serviceFeePercent}` : "$10",
    verified: p.property_status === "approved",
    listingDate: p.createdAt || new Date().toISOString(),
    pricePerToken:
      pricePerToken > 0
        ? `KSh ${new Intl.NumberFormat("en-KE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(pricePerToken)}`
        : "KSh 0.00",
    projectedReturn: projectedReturn,
  };
}

async function getTransformedProperties() {
  try {
    const res = await GetProperties();
    return (res || []).map(transformProperty);
  } catch (error) {
    console.error("Failed to fetch properties:", error);
    throw new Error("Failed to load properties");
  }
}

export default async function PropertyListingPage() {
  const properties = await getTransformedProperties();

  return (
    <div className="min-h-screen bg-background">
      <main className="py-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
            <div>
              <p className="text-[16px] text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                Own a share of premium real estate with as little as Ksh 100.
              </p>
            </div>
          </div>

          <Suspense fallback={<PropertyListingSkeleton />}>
            <PropertyListings initialProperties={properties} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function PropertyCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="w-full h-48 bg-muted"></div>

      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        {/* Title and location */}
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded w-16"></div>
            <div className="h-5 bg-muted rounded w-20"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded w-12"></div>
            <div className="h-5 bg-muted rounded w-16"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded w-20"></div>
            <div className="h-5 bg-muted rounded w-14"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded w-18"></div>
            <div className="h-5 bg-muted rounded w-12"></div>
          </div>
        </div>

        {/* Button skeleton */}
        <div className="pt-4">
          <div className="h-10 bg-muted rounded w-full"></div>
        </div>
      </div>
    </div>
  );
}

function PropertyListingSkeleton() {
  return (
    <>
      {/* Filters skeleton */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="h-10 bg-muted rounded animate-pulse"></div>
          <div className="h-10 bg-muted rounded animate-pulse"></div>
          <div className="h-10 bg-muted rounded animate-pulse"></div>
          <div className="h-10 bg-muted rounded animate-pulse"></div>
        </div>
      </div>

      {/* Properties grid skeleton */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {Array.from({ length: 6 }).map((_, index) => (
          <PropertyCardSkeleton key={index} />
        ))}
      </div>

      {/* Load more button skeleton */}
      <div className="text-center">
        <div className="h-11 bg-muted rounded w-48 mx-auto animate-pulse"></div>
      </div>
    </>
  );
}
