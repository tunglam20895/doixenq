import "server-only";
import { type Place } from "./data";
export type PlaceSuggestion = Pick<Place, "id" | "name" | "address"> &
  Partial<Pick<Place, "lat" | "lng">>;
export function googlePlacesEnabled() {
  return !!(
    process.env.GOOGLE_MAPS_API_KEY &&
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY
  );
}
export async function autocomplete(
  input: string,
  sessionToken: string,
): Promise<PlaceSuggestion[]> {
  const r = await fetch(
    "https://places.googleapis.com/v1/places:autocomplete",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY!,
      },
      body: JSON.stringify({
        input,
        sessionToken,
        languageCode: "vi",
        includedRegionCodes: ["vn"],
        locationBias: {
          circle: {
            center: { latitude: 20.9815, longitude: 105.9849 },
            radius: 50000,
          },
        },
      }),
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    },
  );
  if (!r.ok) throw new Error("PLACES_UNAVAILABLE");
  const data = await r.json();
  return (data.suggestions || []).flatMap(
    (s: {
      placePrediction?: {
        placeId: string;
        text: { text: string };
        structuredFormat?: {
          mainText?: { text: string };
          secondaryText?: { text: string };
        };
      };
    }) => {
      const p = s.placePrediction;
      return p
        ? [
            {
              id: p.placeId,
              name: p.structuredFormat?.mainText?.text || p.text.text,
              address: p.structuredFormat?.secondaryText?.text || p.text.text,
            },
          ]
        : [];
    },
  );
}
export async function placeDetails(
  id: string,
  sessionToken: string,
): Promise<Place> {
  const url = new URL(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`,
  );
  url.searchParams.set("languageCode", "vi");
  url.searchParams.set("sessionToken", sessionToken);
  const r = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY!,
      "X-Goog-FieldMask": "id,displayName,formattedAddress,location",
    },
    signal: AbortSignal.timeout(6000),
    cache: "no-store",
  });
  if (!r.ok) throw new Error("PLACES_UNAVAILABLE");
  const p = await r.json();
  if (
    !p.location ||
    p.location.latitude < 8 ||
    p.location.latitude > 24 ||
    p.location.longitude < 102 ||
    p.location.longitude > 110
  )
    throw new Error("PLACE_OUTSIDE_VIETNAM");
  return {
    id: p.id,
    name: p.displayName?.text || p.formattedAddress,
    address: p.formattedAddress,
    lat: p.location.latitude,
    lng: p.location.longitude,
  };
}
