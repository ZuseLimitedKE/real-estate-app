"use client";
import { useState } from "react";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Plus } from "lucide-react";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

const PropertyListingPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

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
    },
    {
      id: "4",
      image: property1,
      title: "Westlands Towers",
      location: "Westlands, Nairobi",
      value: "KSh 67M",
      yield: "9.2%", 
      investors: 301,
      availableShares: 28,
      minInvestment: "KSh 25,000",
      verified: true,
    },
    {
      id: "5",
      image: property2,
      title: "Upper Hill Residence",
      location: "Upper Hill, Nairobi",
      value: "KSh 38M",
      yield: "7.5%",
      investors: 156,
      availableShares: 72,
      minInvestment: "KSh 18,000",
      verified: false,
    },
    {
      id: "6",
      image: property3,
      title: "Karen Estate",
      location: "Karen, Nairobi",
      value: "KSh 89M",
      yield: "8.7%",
      investors: 89,
      availableShares: 15,
      minInvestment: "KSh 50,000",
      verified: true,
    },
  ];

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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {properties.map((property, index) => (
              <PropertyCard key={index} {...property} />
            ))}
          </div>

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