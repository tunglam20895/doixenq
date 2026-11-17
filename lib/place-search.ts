import { PLACES } from "./data";
import type { Place } from "./data";
export type PlaceSuggestion = Pick<Place, "id" | "name" | "address"> &
  Partial<Pick<Place, "lat" | "lng">>;
export function localPlaces(input: string) {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");
  const words = normalize(input).trim().split(/\s+/);
  return PLACES.filter((p) =>
    words.every((word) => normalize(p.name + " " + p.address).includes(word)),
  );
}

export type PhotonFeature = {
  properties?: Record<string, unknown>;
  geometry?: { coordinates?: number[] };
};
export function photonPlaces(data: { features?: PhotonFeature[] }): Place[] {
  const seen = new Set<string>();
  return (data.features || []).flatMap((feature) => {
    const p = feature.properties || {};
    const [lng, lat] = feature.geometry?.coordinates || [];
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < 8 ||
      lat > 24 ||
      lng < 102 ||
      lng > 110 ||
      (p.countrycode && String(p.countrycode).toUpperCase() !== "VN")
    )
      return [];
    const street = [p.housenumber, p.street].filter(Boolean).join(" ");
    const name = String(
      p.name || street || p.district || p.city || "Địa điểm trên bản đồ",
    );
    const address = [
      ...new Set(
        [street, p.district, p.city, p.county, p.state, p.country].filter(
          Boolean,
        ),
      ),
    ].join(", ");
    const key = `${name}-${lat.toFixed(4)}-${lng.toFixed(4)}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [
      {
        id: `osm-${p.osm_type}-${p.osm_id}`,
        name: name.slice(0, 200),
        address: (address || name).slice(0, 300),
        lat,
        lng,
      },
    ];
  });
}

// randomUUID is only exposed in secure contexts; LAN HTTP still supports getRandomValues.
export function searchSession() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const h = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
