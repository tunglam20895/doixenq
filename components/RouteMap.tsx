"use client";
import dynamic from "next/dynamic";
import type { MapProps } from "@/lib/map-types";
const GoogleMap = dynamic(() => import("./GoogleMap"), {
  ssr: false,
  loading: () => <div className="map-placeholder">Đang tải bản đồ…</div>,
});
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <div className="map-placeholder">Đang tải bản đồ…</div>,
});
export default function RouteMap(props: MapProps) {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY ? (
    <GoogleMap {...props} />
  ) : (
    <LeafletMap {...props} />
  );
}
