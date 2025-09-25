"use client";
import { useEffect, useMemo, useState } from "react";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Plus } from "lucide-react";
import { GetProperties } from "@/server-actions/property/get-property";

const PropertyListingPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await GetProperties();
        const mapped = (res || []).map((p: any) => {
          const totalFractions = p.totalFractions || 0;
          const owned = Array.isArray(p.property_owners)
            ? p.property_owners.reduce(
                (a: number, o: any) => a + (o.amount_owned || 0),
                0
              )
            : 0;
          const availablePct =
            totalFractions > 0
              ? Math.max(0, Math.round(100 - (owned / totalFractions) * 100))
              : 0;
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
                ? `${(
                    ((p.proposedRentPerMonth * 12) / p.property_value) *
                    100
                  ).toFixed(1)}%`
                : "—",
            investors: Array.isArray(p.property_owners)
              ? p.property_owners.length
              : 0,
            availableShares: availablePct,
            minInvestment: p.serviceFeePercent
              ? `${p.serviceFeePercent}% fee`
              : "—",
            verified: p.property_status === "approved",
          };
        });
        if (isMounted) setProperties(mapped);
      } catch (e) {
        console.error(e);
        if (isMounted) setError("Failed to load properties");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (showForm) {
    return (
      <div className="min-h-screen bg-background">
        <main className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="mb-4"
              >
                ← Back to Properties
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Investment Properties
              </h1>
              <p className="text-xl text-muted-foreground">
                Discover verified properties ready for fractional investment
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="westlands">Westlands</SelectItem>
                  <SelectItem value="kilimani">Kilimani</SelectItem>
                  <SelectItem value="parklands">Parklands</SelectItem>
                  <SelectItem value="lavington">Lavington</SelectItem>
                  <SelectItem value="upper-hill">Upper Hill</SelectItem>
                  <SelectItem value="karen">Karen</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="yield-high">Highest Yield</SelectItem>
                  <SelectItem value="yield-low">Lowest Yield</SelectItem>
                  <SelectItem value="value-high">Highest Value</SelectItem>
                  <SelectItem value="value-low">Lowest Value</SelectItem>
                  <SelectItem value="availability">Most Available</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                More Filters
              </Button>
            </div>
          </div>

          {/* Properties Grid */}
          {loading ? (
            <div className="text-center text-muted-foreground py-12">
              Loading properties…
            </div>
          ) : error ? (
            <div className="text-center text-destructive py-12">{error}</div>
          ) : properties.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No properties found.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {properties.map((property, index) => (
                <PropertyCard key={property.id || index} {...property} />
              ))}
            </div>
          )}

          {/* Load More */}
          <div className="text-center">
            <Button variant="outline" size="lg">
              Load More Properties
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PropertyListingPage;