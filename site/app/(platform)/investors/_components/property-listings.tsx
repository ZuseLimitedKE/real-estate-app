"use client";

import { useMemo, useState } from "react";
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
import { Search, Filter } from "lucide-react";

interface Property {
  id: string;
  image: string;
  title: string;
  location: string;
  value: string;
  yield: string;
  investors: number;
  availableShares: number;
  minInvestment: string;
  verified: boolean;
}

interface PropertyListingClientProps {
  initialProperties: Property[];
}

export function PropertyListings({
  initialProperties,
}: PropertyListingClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const filteredAndSortedProperties = useMemo(() => {
    let filtered = initialProperties.filter((property) => {
      const matchesSearch =
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLocation =
        locationFilter === "all" ||
        property.location.toLowerCase().includes(locationFilter.toLowerCase());

      return matchesSearch && matchesLocation;
    });

    switch (sortBy) {
      case "yield-high":
        filtered.sort((a, b) => {
          const yieldA = parseFloat(a.yield.replace("%", "")) || 0;
          const yieldB = parseFloat(b.yield.replace("%", "")) || 0;
          return yieldB - yieldA;
        });
        break;
      case "yield-low":
        filtered.sort((a, b) => {
          const yieldA = parseFloat(a.yield.replace("%", "")) || 0;
          const yieldB = parseFloat(b.yield.replace("%", "")) || 0;
          return yieldA - yieldB;
        });
        break;
      case "value-high":
        filtered.sort((a, b) => {
          const valueA = parseInt(a.value.replace(/[^\d]/g, "")) || 0;
          const valueB = parseInt(b.value.replace(/[^\d]/g, "")) || 0;
          return valueB - valueA;
        });
        break;
      case "value-low":
        filtered.sort((a, b) => {
          const valueA = parseInt(a.value.replace(/[^\d]/g, "")) || 0;
          const valueB = parseInt(b.value.replace(/[^\d]/g, "")) || 0;
          return valueA - valueB;
        });
        break;
      case "availability":
        filtered.sort((a, b) => b.availableShares - a.availableShares);
        break;
      default:
        // Keep original order
        break;
    }

    return filtered;
  }, [initialProperties, searchTerm, locationFilter, sortBy]);

  return (
    <>
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
      {filteredAndSortedProperties.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          {searchTerm || locationFilter !== "all"
            ? "No properties match your filters."
            : "No properties found."}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredAndSortedProperties.map((property, index) => (
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
    </>
  );
}
