import { type NextRequest, NextResponse } from "next/server";
import { unstable_cache, revalidateTag } from "next/cache";

async function fetchLocationData(query: string) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("Google Places API key not configured");
  }

  const results: any[] = [];

  try {
    // 1. Google Places Autocomplete
    const placesResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?` +
      `input=${encodeURIComponent(query)}&` +
      `components=country:ke&` +
      `types=address|establishment&` +
      `key=${apiKey}`,
    );

    if (placesResponse.ok) {
      const placesData = await placesResponse.json();
      if (placesData.status === "OK" && placesData.predictions?.length > 0) {
        const placesDetails = await Promise.all(
          placesData.predictions.slice(0, 2).map(async (prediction: any) => {
            try {
              const detailResponse = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?` +
                `place_id=${prediction.place_id}&` +
                `fields=geometry,formatted_address,address_components,name,types&` +
                `key=${apiKey}`,
              );

              const detailData = await detailResponse.json();
              if (detailData.status === "OK" && detailData.result) {
                const result = detailData.result;
                const addressComponents = result.address_components || [];
                const neighborhood = addressComponents.find(
                  (comp: any) =>
                    comp.types.includes("neighborhood") ||
                    comp.types.includes("sublocality"),
                )?.long_name;

                return {
                  display_name: prediction.description,
                  formatted_address: result.formatted_address,
                  neighborhood,
                  lat: result.geometry.location.lat,
                  lng: result.geometry.location.lng,
                  place_id: prediction.place_id,
                  place_type: result.types?.[0] || "address",
                  source: "google_places",
                  confidence: "high",
                };
              }
              return null;
            } catch (error) {
              console.error("Places detail error:", error);
              return null;
            }
          }),
        );

        results.push(...placesDetails.filter(Boolean));
      }
    }

    // 2. Fallback to Geocoding
    if (results.length < 3) {
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?` +
        `address=${encodeURIComponent(query + ", Kenya")}&` +
        `key=${apiKey}`,
      );

      if (geocodeResponse.ok) {
        const geocodeData = await geocodeResponse.json();
        if (geocodeData.status === "OK" && geocodeData.results?.length > 0) {
          const geocodeResults = geocodeData.results
            .slice(0, 2)
            .map((result: any) => {
              const addressComponents = result.address_components || [];
              const neighborhood = addressComponents.find(
                (comp: any) =>
                  comp.types.includes("neighborhood") ||
                  comp.types.includes("sublocality"),
              )?.long_name;

              return {
                display_name: result.formatted_address,
                formatted_address: result.formatted_address,
                neighborhood,
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                place_id: result.place_id,
                place_type: result.types?.[0] || "geocode",
                source: "google_geocoding",
                confidence: "medium",
              };
            });

          // dedupe
          const existingIds = new Set(results.map((r) => r.place_id));
          const newResults = geocodeResults.filter(
            (r: any) => !existingIds.has(r.place_id),
          );
          results.push(...newResults);
        }
      }
    }

    // 3. Sort by relevance
    return results
      .sort((a, b) => {
        if (a.confidence === "high" && b.confidence !== "high") return -1;
        if (b.confidence === "high" && a.confidence !== "high") return 1;
        if (a.neighborhood && !b.neighborhood) return -1;
        if (b.neighborhood && !a.neighborhood) return 1;
        return 0;
      })
      .slice(0, 5);
  } catch (error) {
    console.error("Hybrid search error:", error);
    return [];
  }
}

// Cache Wrapper Function
function getCachedLocationData(query: string) {
  return unstable_cache(
    () => fetchLocationData(query),
    [`location-search:${query}`], // query-specific cache key
    {
      revalidate: 3600, // 1 hour
      tags: ["locations"], // all queries share this tag
    },
  )();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = (searchParams.get("query") ?? "").trim();

  if (query.length === 0) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 },
    );
  }

  try {
    const results = await getCachedLocationData(query);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Location search failed:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
//clears location cache
export async function POST() {
  revalidateTag("locations");
  return NextResponse.json({ message: "Location cache cleared" });
}
