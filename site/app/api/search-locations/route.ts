import { type NextRequest, NextResponse } from "next/server";
/**
 * Handle GET requests to search locations using Google Places Autocomplete and Details APIs.
 *
 * Validates the `query` search parameter and the `GOOGLE_PLACES_API_KEY` env var, then calls
 * the Places Autocomplete API (restricted to country=ke) and up to the first 5 place detail
 * lookups (fields: geometry, formatted_address) to return enriched results.
 *
 * Response shapes:
 * - 200: { results: Array<{ display_name: string; formatted_address: string; lat: number; lng: number; place_id: string }> }
 * - 200: { results: [] } when Google returns no valid predictions
 * - 400: { error: "Query parameter is required" } when `query` is missing
 * - 500: { error: "Google Places API key not configured" } when env var is missing
 * - 500: { error: "Search failed" } on unexpected failures
 *
 * Notes:
 * - Limits detailed place lookups to the top 5 autocomplete predictions.
 * - Uses `encodeURIComponent` on the query and requests only geometry + formatted_address from Details API.
 */
export async function GET(request: NextRequest) {
  //TODO: auth check
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 },
    );
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Places API key not configured" },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:ke&key=${apiKey}`,
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "OK" && data.predictions) {
      // Get place details for each prediction to get coordinates
      const detailedResults = await Promise.all(
        data.predictions.slice(0, 5).map(async (prediction: any) => {
          try {
            const detailResponse = await fetch(
              `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&fields=geometry,formatted_address&key=${apiKey}`,
            );
            const detailData = await detailResponse.json();

            if (detailData.status === "OK" && detailData.result) {
              return {
                display_name: prediction.description,
                formatted_address: detailData.result.formatted_address,
                lat: detailData.result.geometry.location.lat,
                lng: detailData.result.geometry.location.lng,
                place_id: prediction.place_id,
              };
            }
            return null;
          } catch (error) {
            console.error("Error fetching place details:", error);
            return null;
          }
        }),
      );

      const validResults = detailedResults.filter((result) => result !== null);
      return NextResponse.json({ results: validResults });
    } else {
      console.error(
        "Google Places API error:",
        data.status,
        data.error_message,
      );
      return NextResponse.json({ results: [] });
    }
  } catch (error) {
    console.error("Location search failed:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
