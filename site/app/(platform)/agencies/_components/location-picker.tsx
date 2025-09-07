import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Building, Home } from "lucide-react";
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface LocationResult {
  display_name: string;
  formatted_address: string;
  neighborhood?: string;
  lat: number;
  lng: number;
  place_id: string;
  place_type: string;
}

export function LocationPicker({
  onCoordinatesChange,
  initialCoordinates,
}: {
  onCoordinatesChange: (coords: { lat: number; lng: number } | null) => void;
  initialCoordinates?: { lat: number; lng: number } | null;
}) {
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(initialCoordinates || null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationResult | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  // Debounce search query by 400ms
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const searchLocation = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      setError(null);
      return;
    }

    // cancel previous request
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();

    setIsGeocoding(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search-locations?query=${encodeURIComponent(query)}`,
        { signal: controllerRef.current.signal },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Search failed");
      }

      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error: any) {
      if (error.name === "AbortError") return; // ignore aborted requests
      console.error("Search failed:", error);
      setError(error instanceof Error ? error.message : "Search failed");
      setSearchResults([]);
    } finally {
      setIsGeocoding(false);
    }
  }, []);
  useEffect(() => {
    if (!selectedLocation) {
      searchLocation(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, searchLocation, selectedLocation]);

  const selectLocation = useCallback(
    (result: LocationResult) => {
      const lat = Number(result.lat);
      const lng = Number(result.lng);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        setError("Invalid coordinates from search result");
        return;
      }

      const coords = { lat, lng };
      setCoordinates(coords);
      setSelectedLocation(result);
      onCoordinatesChange(coords);
      setSearchResults([]);
      setSearchQuery(result.display_name);
      setError(null);
    },
    [onCoordinatesChange],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);

      if (e.target.value.length <= 2) {
        setSearchResults([]);
        setError(null);
      }
    },
    [],
  );

  const getPlaceTypeIcon = (placeType: string) => {
    if (placeType.includes("premise") || placeType.includes("subpremise")) {
      return <Building className="h-4 w-4" />;
    }
    return <Home className="h-4 w-4" />;
  };

  const getPlaceTypeBadge = (placeType: string) => {
    const typeMap: Record<
      string,
      { label: string; variant: "default" | "secondary" | "outline" }
    > = {
      premise: { label: "Building", variant: "default" },
      subpremise: { label: "Unit", variant: "secondary" },
      street_address: { label: "Address", variant: "outline" },
      establishment: { label: "Business", variant: "secondary" },
      address: { label: "Address", variant: "outline" },
    };

    const type = typeMap[placeType] || {
      label: "Location",
      variant: "outline",
    };
    return (
      <Badge variant={type.variant} className="text-xs">
        {type.label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Property Location Search
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Search for specific addresses, buildings, estates, or neighborhoods in
          Kenya
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="locationSearch">Property Address or Location</Label>
          <div className="relative">
            <Input
              id="locationSearch"
              type="text"
              placeholder="e.g. Kilimani, Westlands, Karen Shopping Centre..."
              value={searchQuery}
              onChange={handleInputChange}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="border rounded-md bg-background shadow-lg max-h-80 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={result.place_id || index}
                  type="button"
                  className="w-full text-left p-4 hover:bg-muted border-b last:border-b-0 focus:bg-muted focus:outline-none transition-colors"
                  onClick={() => selectLocation(result)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getPlaceTypeIcon(result.place_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">
                          {result.display_name}
                        </span>
                        {getPlaceTypeBadge(result.place_type)}
                      </div>

                      {result.neighborhood && (
                        <div className="text-xs text-blue-600 mb-1">
                          📍 {result.neighborhood}
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground mb-1">
                        {result.formatted_address}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {isGeocoding && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-muted-foreground border-t-transparent"></div>
              Searching properties and locations...
            </div>
          )}
        </div>

        {coordinates && selectedLocation && (
          <div className="p-4 bg-primary/10 border border-primary rounded-md">
            <div className="flex items-center gap-2 text-primary mb-2">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Property Location Selected</span>
            </div>

            <div className="space-y-1 text-sm">
              <div className="font-medium text-primary/80">
                {selectedLocation.display_name}
              </div>

              {selectedLocation.neighborhood && (
                <div className="text-primary/60">
                  Area: {selectedLocation.neighborhood}
                </div>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 bg-transparent hover:bg-transparent hover:text-primary"
              onClick={() => {
                setCoordinates(null);
                setSelectedLocation(null);
                onCoordinatesChange(null);
                setSearchQuery("");
                setError(null);
                setSearchResults([]);
              }}
            >
              Clear Selection
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
