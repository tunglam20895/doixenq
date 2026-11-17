import "server-only";
import type { Place } from "./data";
import { photonPlaces } from "./place-search";
const endpoint = () => process.env.PHOTON_URL || "https://photon.komoot.io";
async function photon(path: string, params: Record<string, string>) {
  const url = new URL(path, endpoint());
  for (const [key, value] of Object.entries(params))
    url.searchParams.set(key, value);
  const r = await fetch(url, {
    headers: { "Accept-Language": "vi", "User-Agent": "NhuQuynhBooking/1.0" },
    signal: AbortSignal.timeout(5000),
    cache: "no-store",
  });
  if (!r.ok) throw new Error("ADDRESS_SEARCH_UNAVAILABLE");
  return photonPlaces(await r.json());
}
export function openAutocomplete(input: string) {
  return photon("/api/", {
    q: input,
    limit: "8",
    countrycode: "VN",
    lat: "20.9815",
    lon: "105.9849",
    bbox: "102,8,110,24",
  });
}
export async function reversePlace(
  lat: number,
  lng: number,
): Promise<Place | null> {
  const places = await photon("/reverse", {
    lat: String(lat),
    lon: String(lng),
    limit: "1",
    radius: "0.2",
  });
  return places[0] ? { ...places[0], lat, lng } : null;
}
