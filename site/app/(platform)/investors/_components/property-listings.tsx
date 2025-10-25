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
import { Search, SlidersHorizontal, Grid3X3, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  listingDate: Date;
  pricePerToken: string;
  projectedReturn: string;
}

interface PropertyListingClientProps {
  initialProperties: Property[];
}

export function PropertyListings({
  initialProperties,
}: PropertyListingClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [propertyType, setPropertyType] = useState("all");
  const [yieldRange, setYieldRange] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const filteredAndSortedProperties = useMemo(() => {
    const filtered = initialProperties.filter((property) => {
      const matchesSearch =
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLocation =
        locationFilter === "all" ||
        property.location.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesYield =
        yieldRange === "all" ||
        (yieldRange === "low" && Number.parseFloat(property.yield) < 5) ||
        (yieldRange === "medium" &&
          Number.parseFloat(property.yield) >= 5 &&
          Number.parseFloat(property.yield) < 10) ||
        (yieldRange === "high" && Number.parseFloat(property.yield) >= 10);

      return matchesSearch && matchesLocation && matchesYield;
    });

    switch (sortBy) {
      case "yield-high":
        filtered.sort((a, b) => {
          const yieldA = Number.parseFloat(a.yield.replace("%", "")) || 0;
          const yieldB = Number.parseFloat(b.yield.replace("%", "")) || 0;
          return yieldB - yieldA;
        });
        break;
      case "yield-low":
        filtered.sort((a, b) => {
          const yieldA = Number.parseFloat(a.yield.replace("%", "")) || 0;
          const yieldB = Number.parseFloat(b.yield.replace("%", "")) || 0;
          return yieldA - yieldB;
        });
        break;
      case "price-high":
        filtered.sort((a, b) => {
          const valueA = Number.parseInt(a.value.replace(/[^\d]/g, "")) || 0;
          const valueB = Number.parseInt(b.value.replace(/[^\d]/g, "")) || 0;
          return valueB - valueA;
        });
        break;
      case "price-low":
        filtered.sort((a, b) => {
          const valueA = Number.parseInt(a.value.replace(/[^\d]/g, "")) || 0;
          const valueB = Number.parseInt(b.value.replace(/[^\d]/g, "")) || 0;
          return valueA - valueB;
        });
        break;
      case "availability":
        filtered.sort((a, b) => b.availableShares - a.availableShares);
        break;
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.listingDate).getTime() -
            new Date(a.listingDate).getTime(),
        );
        break;
      default:
        // Keep original order
        break;
    }

    return filtered;
  }, [initialProperties, searchTerm, locationFilter, yieldRange, sortBy]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setLocationFilter("all");
    setPropertyType("all");
    setYieldRange("all");
    setPriceRange("all");
    setSortBy("newest");
  };

  const activeFilterCount = [
    searchTerm,
    locationFilter !== "all",
    propertyType !== "all",
    yieldRange !== "all",
    priceRange !== "all",
  ].filter(Boolean).length;

  return (
    <>
      {/* Top Row: Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-3">
        {/* Filters Button */}
        <Button
          variant="outline"
          className="flex items-center gap-2 h-12 rounded-lg w-12 p-0 justify-center bg-transparent"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Search Input with Search Button */}
        <div className="flex flex-1 gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 rounded-lg w-full"
            />
          </div>
          <Button
            variant="default"
            className="h-12 px-8 rounded-lg cursor-pointer"
          >
            <Search className="w-4 h-4 mx-2" />
          </Button>
        </div>

        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-10 rounded-lg w-full md:w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="yield-high">Highest Yield</SelectItem>
            <SelectItem value="yield-low">Lowest Yield</SelectItem>
            <SelectItem value="price-high">Highest Value</SelectItem>
            <SelectItem value="price-low">Lowest Value</SelectItem>
            <SelectItem value="availability">Most Available</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-4">
          <div className="grid md:grid-cols-5 gap-4">
            {/* Location Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
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
            </div>

            {/* Property Type Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Property Type
              </label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Yield Range Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Yield Range
              </label>
              <Select value={yieldRange} onValueChange={setYieldRange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Yields" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Yields</SelectItem>
                  <SelectItem value="low">Low (&lt;5%)</SelectItem>
                  <SelectItem value="medium">Medium (5-10%)</SelectItem>
                  <SelectItem value="high">High (&gt;10%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Price Range
              </label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Prices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-500k">Under $500K</SelectItem>
                  <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                  <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                  <SelectItem value="over-5m">Over $5M</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button - Now in the same row */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="w-full h-10 bg-transparent"
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Results Header Row */}
      <div className="flex justify-between items-center mb-3">
        {/* Left: Results Count */}
        <div>
          <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
            {filteredAndSortedProperties.length}{" "}
            {filteredAndSortedProperties.length === 1
              ? "Property"
              : "Properties"}{" "}
            Found
          </h2>
        </div>

        {/* Right: View Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
            View:
          </span>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Properties Grid/List */}
      {filteredAndSortedProperties.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-3 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No properties found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || locationFilter !== "all" || yieldRange !== "all"
              ? "Try adjusting your filters to see more properties."
              : "No properties are currently available for investment."}
          </p>
          {(searchTerm || locationFilter !== "all" || yieldRange !== "all") && (
            <Button onClick={clearAllFilters}>Clear All Filters</Button>
          )}
        </div>
      ) : (
        <div
          className={`${viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"} mb-12`}
        >
          {filteredAndSortedProperties.map((property, index) => (
            <PropertyCard key={property.id || index} {...property} />
          ))}
        </div>
      )}

      {/* Load More */}
      {filteredAndSortedProperties.length > 0 && (
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            className="rounded-xl bg-transparent"
          >
            Load More Properties
          </Button>
        </div>
      )}
    </>
  );
}
