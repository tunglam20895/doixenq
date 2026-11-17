"use client";
import { useEffect, useId, useRef, useState } from "react";
import { MapPin, LocateFixed, X } from "lucide-react";
import {
  searchSession,
  localPlaces,
  type PlaceSuggestion,
} from "@/lib/place-search";
import { PLACES, type Place } from "@/lib/data";
export default function PlaceInput({
  label,
  value,
  onChange,
  onMap,
  compact = false,
}: {
  label: string;
  value: Place | null;
  onChange: (p: Place | null) => void;
  onMap?: () => void;
  compact?: boolean;
}) {
  const id = useId();
  const [query, setQuery] = useState(value?.name || "");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PlaceSuggestion[]>(PLACES);
  const [message, setMessage] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const session = useRef("");
  const selection = useRef<AbortController | null>(null);
  const search = useRef<AbortController | null>(null);
  const [composing, setComposing] = useState(false);
  const [source, setSource] = useState("local");
  const [loading, setLoading] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (value) setQuery(value.name);
  }, [value]);
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  useEffect(() => {
    if (!open) return;
    const local = localPlaces(query);
    setItems(local);
    setSource("local");
    setMessage("");
    setActiveIndex(0);
    if (composing || query.trim().length < 2) {
      setLoading(false);
      return;
    }
    session.current ||= searchSession();
    const ac = new AbortController();
    search.current = ac;
    setLoading(true);
    const find = async () => {
      try {
        const r = await fetch(
          `/api/places?q=${encodeURIComponent(query)}&session=${session.current}`,
          { signal: ac.signal },
        );
        const data = await r.json();
        if (ac.signal.aborted) return;
        if (r.ok) {
          setItems(data.places);
          setSource(data.source);
          setMessage(data.message || "");
        } else {
          setMessage(
            data.error ||
              "Chưa tìm được địa điểm. Bạn có thể chọn trên bản đồ.",
          );
        }
      } catch {
        if (!ac.signal.aborted)
          setMessage(
            "Chưa kết nối được tìm kiếm. Bạn có thể chọn trên bản đồ.",
          );
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    };
    const timer = setTimeout(() => void find(), 300);
    return () => {
      clearTimeout(timer);
      ac.abort();
    };
  }, [query, open, composing]);
  useEffect(
    () => () => {
      selection.current?.abort();
      search.current?.abort();
    },
    [],
  );
  const selectPlace = async (p: PlaceSuggestion) => {
    selection.current?.abort();
    if (typeof p.lat === "number" && typeof p.lng === "number") {
      onChange(p as Place);
      setOpen(false);
      setMessage("");
      return;
    }
    const ac = new AbortController();
    selection.current = ac;
    setMessage("Đang lấy địa điểm…");
    setItems([]);
    try {
      const r = await fetch(
        `/api/places/details?id=${encodeURIComponent(p.id)}&session=${session.current}`,
        { signal: ac.signal },
      );
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      if (ac.signal.aborted) return;
      onChange(data.place);
      setQuery(data.place.name);
      setOpen(false);
      setMessage("");
      session.current = "";
    } catch {
      if (!ac.signal.aborted)
        setMessage(
          "Chưa lấy được địa điểm. Bạn thử lại hoặc ghim trên bản đồ nhé.",
        );
    }
  };
  const locate = () => {
    setMessage("Đang lấy vị trí…");
    if (!navigator.geolocation) {
      setMessage("Thiết bị không hỗ trợ định vị.");
      return;
    }
    selection.current?.abort();
    const ac = new AbortController();
    selection.current = ac;
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        if (ac.signal.aborted) return;
        const { latitude: lat, longitude: lng } = p.coords;
        if (lat < 8 || lat > 24 || lng < 102 || lng > 110) {
          setMessage("Vui lòng chọn địa điểm trong Việt Nam.");
          return;
        }
        setMessage("Đang tìm địa chỉ tại vị trí của bạn…");
        try {
          const r = await fetch(`/api/places/reverse?lat=${lat}&lng=${lng}`, {
            signal: ac.signal,
          });
          const data = await r.json();
          if (ac.signal.aborted) return;
          if (!r.ok || !data.place) throw Error();
          onChange({ ...data.place, lat, lng });
          setOpen(false);
          setMessage("");
        } catch {
          if (ac.signal.aborted) return;
          onChange({
            id: "gps",
            name: "Vị trí hiện tại của bạn",
            address:
              "Chưa tìm được địa chỉ. Vui lòng bổ sung số nhà hoặc lối vào.",
            lat,
            lng,
          });
          setOpen(false);
          setMessage(
            "Đã lấy vị trí. Chưa tìm được tên địa điểm; hãy bổ sung địa chỉ trong ghi chú.",
          );
        }
      },
      () => {
        if (!ac.signal.aborted)
          setMessage(
            "Chưa lấy được vị trí. Bạn có thể nhập địa chỉ hoặc ghim trên bản đồ.",
          );
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  };
  return (
    <div className={`place-input ${compact ? "compact" : ""}`} ref={root}>
      <label htmlFor={id}>{label}</label>
      <div className="input-with-icon">
        <MapPin size={18} />
        <input
          id={id}
          value={query}
          placeholder={
            label === "Điểm đón" ? "Bạn muốn đón ở đâu?" : "Bạn muốn đi đâu?"
          }
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={id + "-list"}
          aria-activedescendant={
            open && items[activeIndex]
              ? id + "-option-" + activeIndex
              : undefined
          }
          onFocus={() => setOpen(true)}
          onInput={(e) => {
            selection.current?.abort();
            search.current?.abort();
            const text = e.currentTarget.value;
            setItems(localPlaces(text));
            setSource("local");
            setMessage("");
            setQuery(text);
            setActiveIndex(0);
            onChange(null);
            setOpen(true);
          }}
          onCompositionStart={() => {
            search.current?.abort();
            setComposing(true);
          }}
          onCompositionEnd={(e) => {
            setQuery(e.currentTarget.value);
            setComposing(false);
          }}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === "Escape") setOpen(false);
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActiveIndex((i) =>
                Math.max(0, Math.min(i + 1, Math.min(items.length, 8) - 1)),
              );
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(0, i - 1));
            }
            if (e.key === "Enter" && open) {
              e.preventDefault();
              if (items[activeIndex]) {
                void selectPlace(items[activeIndex]);
              }
            }
          }}
        />
        {value ? (
          <button
            type="button"
            className="clear-place"
            aria-label={"Xóa " + label.toLowerCase()}
            onClick={() => {
              selection.current?.abort();
              search.current?.abort();
              onChange(null);
              setQuery("");
              setOpen(true);
            }}
          >
            <X size={14} />
          </button>
        ) : null}
      </div>
      {onMap ? (
        <button
          type="button"
          className="place-map-action"
          onClick={() => {
            setOpen(false);
            onMap();
          }}
        >
          <MapPin size={15} />
          Chọn trên bản đồ
        </button>
      ) : null}
      {open ? (
        <div className="place-dropdown" id={id + "-list"}>
          <div className="place-tools">
            <button type="button" onClick={locate}>
              <LocateFixed size={16} />
              Vị trí của tôi
            </button>
            {onMap ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onMap();
                }}
              >
                <MapPin size={16} />
                Ghim bản đồ
              </button>
            ) : null}
          </div>
          <div
            className="place-list"
            role="listbox"
            aria-label={"Gợi ý " + label.toLowerCase()}
          >
            {items.slice(0, 8).map((p, index) => (
              <button
                id={id + "-option-" + index}
                key={p.id}
                className={activeIndex === index ? "keyboard-active" : ""}
                type="button"
                role="option"
                aria-selected={value?.id === p.id}
                onClick={() => {
                  void selectPlace(p);
                }}
              >
                <span className="place-icon">
                  <MapPin size={16} />
                </span>
                <span>
                  <strong>{p.name}</strong>
                  <small>{p.address}</small>
                </span>
              </button>
            ))}
            {loading ? (
              <p className="input-hint" role="status">
                Đang tìm địa điểm…
              </p>
            ) : null}
            {!loading && !items.length ? (
              <p className="input-hint">
                Chưa có địa chỉ phù hợp. Bạn có thể ghim vị trí trên bản đồ.
              </p>
            ) : null}
          </div>
          {source === "osm" && items.length > 0 ? (
            <span className="places-attribution">© OpenStreetMap · Photon</span>
          ) : null}
          {source === "vietmap" && items.length > 0 ? (
            <span className="places-attribution">© VIETMAP</span>
          ) : null}
          {source === "google" && items.length > 0 ? (
            <span className="places-attribution">Google Maps</span>
          ) : null}
        </div>
      ) : null}
      {message ? (
        <small role="status" className="input-hint">
          {message}
        </small>
      ) : null}
    </div>
  );
}
