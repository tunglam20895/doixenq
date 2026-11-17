import "server-only";
import type { Place } from "./data";
import type { PlaceSuggestion } from "./place-search";
export const vietmapEnabled = () => !!process.env.VIETMAP_API_KEY;
type Result = {
  ref_id?: string;
  name?: string;
  display?: string;
  address?: string;
  lat?: number;
  lng?: number;
};
async function request(path: string, params: Record<string, string>) {
  const url = new URL(`https://maps.vietmap.vn/api/${path}/v4`);
  url.searchParams.set("apikey", process.env.VIETMAP_API_KEY!);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const response = await fetch(url, {
    signal: AbortSignal.timeout(6000),
    cache: "no-store",
  });
  if (!response.ok) throw Error("VIETMAP_UNAVAILABLE");
  return response.json();
}
function toPlace(p: Result, id: string): Place {
  if (
    !p ||
    typeof p.lat !== "number" ||
    typeof p.lng !== "number" ||
    !Number.isFinite(p.lat) ||
    !Number.isFinite(p.lng) ||
    p.lat < 8 ||
    p.lat > 24 ||
    p.lng < 102 ||
    p.lng > 110 ||
    !(p.display || p.name)
  )
    throw Error("INVALID_PLACE");
  return {
    id,
    name: (p.name || p.display!).slice(0, 200),
    address: (p.display || p.address || p.name!).slice(0, 300),
    lat: p.lat,
    lng: p.lng,
  };
}
export async function vietmapAutocomplete(
  text: string,
): Promise<PlaceSuggestion[]> {
  const data = await request("autocomplete", {
    text,
    focus: "20.9815,105.9849",
    display_type: "6",
  });
  if (!Array.isArray(data)) throw Error("VIETMAP_UNAVAILABLE");
  return data
    .filter((p: Result) => p.ref_id && (p.display || p.name))
    .slice(0, 8)
    .map((p: Result) => ({
      id: `vietmap:${p.ref_id}`,
      name: (p.name || p.display!).slice(0, 200),
      address: (p.display || p.address || p.name!).slice(0, 300),
    }));
}
export async function vietmapDetails(id: string) {
  return toPlace(await request("place", { refid: id.slice(8) }), id);
}
export async function vietmapReverse(lat: number, lng: number) {
  const data = await request("reverse", {
    lat: String(lat),
    lng: String(lng),
    display_type: "6",
  });
  if (!Array.isArray(data) || !data[0]) return null;
  return { ...toPlace(data[0], `pin-${Date.now()}`), lat, lng };
}
