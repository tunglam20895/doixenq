"use client";
import { useEffect, useRef, useState } from "react";
import type { MapProps } from "@/lib/map-types";
let loading: Promise<void> | undefined;
function loadMaps() {
  return (loading ??= new Promise<void>((resolve, reject) => {
    if (window.google?.maps) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY!)}&v=weekly&language=vi&region=VN`;
    script.async = true;
    script.onload = () =>
      window.google?.maps ? resolve() : reject(new Error("maps unavailable"));
    script.onerror = () => {
      script.remove();
      loading = undefined;
      reject(new Error("maps unavailable"));
    };
    document.head.appendChild(script);
  }));
}
export default function GoogleMap({
  pickup,
  destination,
  geometry,
  onPick,
  active = "pickup",
  sample = false,
  picker = false,
}: MapProps) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const line = useRef<google.maps.Polyline | null>(null);
  const callback = useRef(onPick);
  const current = useRef(active);
  const previousView = useRef("");
  const editable = !!onPick;
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    callback.current = onPick;
    current.current = active;
  }, [onPick, active]);
  useEffect(() => {
    let disposed = false;
    let listener: google.maps.MapsEventListener | undefined;
    loadMaps()
      .then(() => {
        if (disposed || !host.current) return;
        map.current = new google.maps.Map(host.current, {
          center: { lat: 20.9815, lng: 105.9849 },
          zoom: picker ? 15 : 11,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: picker ? "greedy" : "cooperative",
          restriction: {
            latLngBounds: { north: 24, south: 8, east: 110, west: 102 },
            strictBounds: false,
          },
        });
        listener = map.current.addListener(
          "click",
          (e: google.maps.MapMouseEvent) => {
            if (!e.latLng) return;
            const { lat, lng } = e.latLng.toJSON();
            callback.current?.(
              {
                id: "pin-" + Date.now(),
                name:
                  current.current === "pickup"
                    ? "Điểm đón đã ghim"
                    : "Điểm đến đã ghim",
                address: "Vui lòng ghi chú địa chỉ cụ thể.",
                lat,
                lng,
              },
              current.current,
            );
          },
        );
        setReady(true);
      })
      .catch(() => {
        if (!disposed) setError(true);
      });
    return () => {
      disposed = true;
      listener?.remove();
      markers.current.forEach((m) => m.setMap(null));
      line.current?.setMap(null);
      map.current = null;
    };
  }, []);
  useEffect(() => {
    if (!ready || !map.current) return;
    markers.current.forEach((m) => m.setMap(null));
    markers.current = [];
    line.current?.setMap(null);
    const bounds = new google.maps.LatLngBounds();
    for (const [p, which, label] of [
      [pickup, "pickup", "A"],
      [destination, "destination", "B"],
    ] as const) {
      if (!p) continue;
      bounds.extend(p);
      const marker = new google.maps.Marker({
        map: map.current,
        position: p,
        title: p.name,
        label: { text: label, color: "#fff", fontWeight: "600" },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 15,
          fillColor: which === "pickup" ? "#173e35" : "#66853c",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 3,
        },
        draggable: editable,
      });
      marker.addListener("dragend", (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const { lat, lng } = e.latLng.toJSON();
        if (lat < 8 || lat > 24 || lng < 102 || lng > 110) {
          marker.setPosition(p);
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
      markers.current.push(marker);
    }
    if (geometry?.length) {
      line.current = new google.maps.Polyline({
        map: map.current,
        path: geometry.map(([lat, lng]) => ({ lat, lng })),
        strokeColor: "#28594b",
        strokeWeight: 5,
        strokeOpacity: sample ? 0.4 : 0.9,
      });
    }
    const viewKey = [pickup?.id, destination?.id].join("|");
    const manualPin = [pickup, destination].some((p) =>
      p?.id.startsWith("pin-"),
    );
    if (
      viewKey !== previousView.current &&
      (!previousView.current || !manualPin)
    ) {
      if (pickup && destination) map.current.fitBounds(bounds, 45);
      else if (pickup || destination) {
        map.current.setCenter((pickup || destination)!);
        map.current.setZoom(picker ? 16 : 13);
      }
    }
    previousView.current = viewKey;
  }, [ready, pickup, destination, geometry, editable, sample, picker]);
  return (
    <div className="route-map-wrap">
      <div
        className="route-map"
        ref={host}
        role="region"
        aria-label="Bản đồ Google Maps hành trình"
      />
      {!ready ? (
        <div className="map-loading" role="status">
          {error
            ? "Chưa mở được Google Maps. Bạn vẫn có thể chọn địa chỉ."
            : "Đang mở Google Maps…"}
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
