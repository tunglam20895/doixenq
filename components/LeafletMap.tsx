"use client";
import { useEffect, useRef, useState } from "react";
import type L from "leaflet";
import type { Place } from "@/lib/data";
import type { MapProps } from "@/lib/map-types";
import "leaflet/dist/leaflet.css";
export default function LeafletMap({
  pickup,
  destination,
  geometry,
  onPick,
  active = "pickup",
  sample = false,
  picker = false,
}: MapProps) {
  const root = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const lib = useRef<typeof L | null>(null);
  const callback = useRef(onPick);
  const activeRef = useRef(active);
  const previousView = useRef("");
  const editable = !!onPick;
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    callback.current = onPick;
    activeRef.current = active;
  }, [onPick, active]);
  useEffect(() => {
    let stopped = false;
    import("leaflet")
      .then((module) => {
        if (stopped || !root.current) return;
        const leaflet = module.default;
        lib.current = leaflet;
        map.current = leaflet
          .map(root.current, {
            scrollWheelZoom: picker,
            zoomControl: true,
            zoomAnimation: false,
            fadeAnimation: false,
            markerZoomAnimation: false,
          })
          .setView([20.9815, 105.9849], picker ? 15 : 10);
        leaflet
          .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
          })
          .addTo(map.current);
        layer.current = leaflet.layerGroup().addTo(map.current);
        map.current.on("click", (e) => {
          const { lat, lng } = e.latlng;
          if (lat < 8 || lat > 24 || lng < 102 || lng > 110) return;
          callback.current?.(
            {
              id: "pin-" + Date.now(),
              name:
                activeRef.current === "pickup"
                  ? "Điểm đón đã ghim"
                  : "Điểm đến đã ghim",
              address:
                "Vị trí đã chọn trên bản đồ. Vui lòng bổ sung tên đường hoặc địa danh trong ghi chú.",
              lat,
              lng,
            },
            activeRef.current,
          );
        });
        setLoaded(true);
      })
      .catch(() => setError(true));
    return () => {
      stopped = true;
      map.current?.stop();
      map.current?.remove();
      map.current = null;
    };
  }, []);
  useEffect(() => {
    const m = map.current,
      l = lib.current,
      g = layer.current;
    if (!loaded || !m || !l || !g) return;
    g.clearLayers();
    const points: L.LatLngTuple[] = [];
    for (const [p, which, label] of [
      [pickup, "pickup", "A"],
      [destination, "destination", "B"],
    ] as const) {
      if (!p) continue;
      points.push([p.lat, p.lng]);
      const icon = l.divIcon({
        className: "map-custom-marker",
        html: `<span class="map-pin ${which}">${label}</span>`,
        iconSize: [36, 44],
        iconAnchor: [18, 40],
      });
      const marker = l
        .marker([p.lat, p.lng], { icon, draggable: editable, title: p.name })
        .addTo(g);
      marker.bindTooltip(p.name, { direction: "top", offset: [0, -35] });
      marker.on("dragend", () => {
        const { lat, lng } = marker.getLatLng();
        if (lat < 8 || lat > 24 || lng < 102 || lng > 110) {
          marker.setLatLng([p.lat, p.lng]);
          return;
        }
        callback.current?.(
          {
            id: "pin-" + Date.now(),
            name: which === "pickup" ? "Điểm đón đã ghim" : "Điểm đến đã ghim",
            address: "Vui lòng ghi chú địa chỉ cụ thể.",
            lat,
            lng,
          },
          which,
        );
      });
    }
    if (geometry?.length) {
      l.polyline(geometry, {
        color: "#28594b",
        weight: 5,
        opacity: 0.85,
        dashArray: sample ? "8 8" : undefined,
      }).addTo(g);
    }
    const viewKey = [pickup?.id, destination?.id].join("|");
    const manualPin = [pickup, destination].some((p) =>
      p?.id.startsWith("pin-"),
    );
    if (
      viewKey !== previousView.current &&
      (!previousView.current || !manualPin)
    ) {
      if (points.length === 2)
        m.fitBounds(l.latLngBounds(points), {
          padding: [44, 44],
          maxZoom: 15,
          animate: false,
        });
      else if (points.length)
        m.setView(points[0], picker ? 16 : 13, { animate: false });
    }
    previousView.current = viewKey;
    const t = setTimeout(() => m.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [loaded, pickup, destination, geometry, editable, sample, picker]);
  return (
    <div className="route-map-wrap">
      <div
        className="route-map"
        ref={root}
        role="region"
        aria-label="Bản đồ hành trình"
      />
      {!loaded ? (
        <div className="map-loading" role="status">
          {error
            ? "Không tải được bản đồ. Bạn vẫn có thể chọn địa chỉ trong danh sách."
            : "Đang mở bản đồ…"}
        </div>
      ) : null}
      {onPick && !picker ? (
        <div className="map-instruction">
          Chạm bản đồ để ghim {active === "pickup" ? "điểm đón" : "điểm đến"} ·
          Có thể kéo ghim để chỉnh
        </div>
      ) : null}
    </div>
  );
}
