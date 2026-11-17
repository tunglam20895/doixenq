import { PLACES, type Place } from "./data";
export type RouteResult = {
  distanceKm: number;
  durationMinutes: number;
  geometry: [number, number][];
  source: "google" | "osrm" | "sample";
};
export async function getRoute(from: Place, to: Place): Promise<RouteResult> {
  if (Math.abs(from.lat - to.lat) + Math.abs(from.lng - to.lng) < 0.001)
    throw new Error("Điểm đón và điểm đến cần khác nhau.");
  if (
    process.env.GOOGLE_MAPS_API_KEY &&
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY
  ) {
    const res = await fetch(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask":
            "routes.distanceMeters,routes.duration,routes.polyline.geoJsonLinestring",
        },
        body: JSON.stringify({
          origin: {
            location: { latLng: { latitude: from.lat, longitude: from.lng } },
          },
          destination: {
            location: { latLng: { latitude: to.lat, longitude: to.lng } },
          },
          travelMode: "DRIVE",
          polylineEncoding: "GEO_JSON_LINESTRING",
        }),
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!res.ok) throw new Error("Dịch vụ bản đồ đang bận. Vui lòng thử lại.");
    const data = await res.json();
    const r = data.routes?.[0];
    if (!r) throw new Error("Không tìm được tuyến đường ô tô.");
    return {
      distanceKm: r.distanceMeters / 1000,
      durationMinutes: Math.ceil(parseFloat(r.duration) / 60),
      geometry: r.polyline.geoJsonLinestring.coordinates.map(
        ([lng, lat]: number[]) => [lat, lng],
      ),
      source: "google",
    };
  }
  try {
    const url = `${process.env.ROUTING_URL || "https://router.project-osrm.org"}/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=simplified&geometries=geojson`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    const r = data.routes?.[0];
    if (!r) throw new Error("no route");
    return {
      distanceKm: r.distance / 1000,
      durationMinutes: Math.ceil(r.duration / 60),
      geometry: r.geometry.coordinates.map(([lng, lat]: number[]) => [
        lat,
        lng,
      ]),
      source: "osrm",
    };
  } catch {
    const sample: Record<string, number> = {
      "nhu-quynh:noi-bai": 48,
      "nhu-quynh:hoan-kiem": 24,
      "nhu-quynh:ecopark": 13,
      "nhu-quynh:hung-yen": 48,
      "nhu-quynh:hai-phong": 86,
      "nhu-quynh:hai-duong": 39,
      "nhu-quynh:ninh-binh": 110,
      "nhu-quynh:times-city": 23,
    };
    const exact = (p: Place) =>
      PLACES.find((x) => x.id === p.id && x.lat === p.lat && x.lng === p.lng);
    const km =
      exact(from) &&
      exact(to) &&
      (sample[`${from.id}:${to.id}`] || sample[`${to.id}:${from.id}`]);
    if (!km)
      throw new Error(
        "Chưa tìm được đường đi. Vui lòng thử lại hoặc chọn tuyến phổ biến.",
      );
    return {
      distanceKm: km,
      durationMinutes: Math.round(km * 1.8),
      geometry: [
        [from.lat, from.lng],
        [to.lat, to.lng],
      ],
      source: "sample",
    };
  }
}
