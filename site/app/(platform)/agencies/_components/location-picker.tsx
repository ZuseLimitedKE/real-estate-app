import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MapPin, Search } from "lucide-react";
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
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsGeocoding(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search-locations?query=${encodeURIComponent(query)}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Search failed");
      }

      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Location search failed:", error);
      setError(error instanceof Error ? error.message : "Search failed");
      setSearchResults([]);
    } finally {
      setIsGeocoding(false);
    }
  };

  const selectLocation = (result: any) => {
    const lat = Number(result.lat);
    const lng = Number(result.lng);
    //finite check to avoid propagating NaN
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setError("Invalid coordinates from search result");
      return;
    }
    const coords = { lat, lng };
    setCoordinates(coords);
    onCoordinatesChange(coords);
    setSearchResults([]);
    setSearchQuery(result.display_name);
    setError(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="locationSearch">Search for Property Location</Label>
          <div className="relative">
            <Input
              id="locationSearch"
              type="text"
              placeholder="Search for address, landmark, or area in Kenya..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length > 2) {
                  searchLocation(e.target.value);
                } else {
                  setSearchResults([]);
                  setError(null);
                }
              }}
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
            <div className="border rounded-md bg-background shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={result.place_id || index}
                  type="button"
                  className="w-full text-left p-3 hover:bg-muted border-b last:border-b-0 focus:bg-muted focus:outline-none"
                  onClick={() => selectLocation(result)}
                >
                  <div className="font-medium text-sm">
                    {result.display_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {result.formatted_address}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {result.lat.toFixed(6)}, {result.lng.toFixed(6)}
                  </div>
                </button>
              ))}
            </div>
          )}

          {isGeocoding && (
            <p className="text-sm text-muted-foreground">
              Searching locations...
            </p>
          )}
        </div>

        {coordinates && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-md">
            <div className="flex items-center gap-2 text-purple-800">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Location Selected</span>
            </div>
            <p className="text-sm text-purple-700 mt-1">
              Coordinates: {coordinates.lat.toFixed(6)},{" "}
              {coordinates.lng.toFixed(6)}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 bg-transparent hover:scale-105 hover:text-black/80"
              onClick={() => {
                setCoordinates(null);
                onCoordinatesChange(null);
                setSearchQuery("");
                setError(null);
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
