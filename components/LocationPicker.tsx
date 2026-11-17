"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, MapPin, Check } from "lucide-react";
import type { Place } from "@/lib/data";
import PlaceInput from "./PlaceInput";
import RouteMap from "./RouteMap";
export default function LocationPicker({
  which,
  value,
  onConfirm,
  onClose,
}: {
  which: "pickup" | "destination";
  value: Place | null;
  onConfirm: (place: Place) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const [address, setAddress] = useState("");
  const [resolved, setResolved] = useState<Place | null>(null);
  const [customName, setCustomName] = useState("");
  const [resolving, setResolving] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const label = which === "pickup" ? "điểm đón" : "điểm đến";
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.showModal();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  useEffect(() => {
    setResolved(null);
    setCustomName("");
    if (!draft) {
      setAddress("");
      return;
    }
    if (!draft.id.startsWith("pin-")) {
      setAddress(draft.address);
      return;
    }
    const ac = new AbortController();
    setAddress("");
    setResolving(true);
    const timer = setTimeout(async () => {
      try {
        const r = await fetch(
          `/api/places/reverse?lat=${draft.lat}&lng=${draft.lng}`,
          { signal: ac.signal },
        );
        const data = await r.json();
        if (!ac.signal.aborted && data.place) {
          setAddress(data.place.address || "");
          setResolved({ ...data.place, lat: draft.lat, lng: draft.lng });
        }
      } catch {
        /* The exact pin remains selectable if address lookup is unavailable. */
      } finally {
        if (!ac.signal.aborted) setResolving(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      ac.abort();
      setResolving(false);
    };
  }, [draft]);
  return createPortal(
    <dialog
      ref={dialog}
      className="location-dialog"
      aria-labelledby="location-title"
      onCancel={onClose}
    >
      <div className="location-picker">
        <header className="location-heading">
          <div>
            <span className="eyebrow">CHỌN VỊ TRÍ</span>
            <h2 id="location-title">Chọn {label}</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Đóng chọn vị trí"
          >
            <X />
          </button>
        </header>
        <div className="location-search">
          <PlaceInput
            label="Tìm địa chỉ trên bản đồ"
            value={draft}
            onChange={setDraft}
          />
        </div>
        <p className="location-help">
          Tìm địa chỉ hoặc chạm bản đồ để đặt ghim. Phóng to bằng nút + để chọn
          đúng lối vào.
        </p>
        <div className="location-map">
          <RouteMap
            pickup={which === "pickup" ? draft : null}
            destination={which === "destination" ? draft : null}
            active={which}
            onPick={setDraft}
            picker
          />
        </div>
        <div className="location-confirm">
          <div className="location-selected">
            <MapPin size={20} />
            <div>
              <strong>
                {draft
                  ? resolved && draft.id.startsWith("pin-")
                    ? resolved.name
                    : draft.name
                  : "Chạm bản đồ để chọn vị trí"}
              </strong>
              <small role="status">
                {resolving
                  ? "Đang tìm địa chỉ gần ghim…"
                  : draft
                    ? `${draft.lat.toFixed(6)}, ${draft.lng.toFixed(6)}${address ? " · " + address : " · Bạn có thể ghi chú thêm lối vào ở bước cuối."}`
                    : "Vị trí chỉ được lưu khi bạn bấm xác nhận."}
              </small>
            </div>
          </div>
          {draft?.id.startsWith("pin-") && !resolving ? (
            <label className="field">
              Tên địa điểm / lối vào (bổ sung nếu cần)
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                maxLength={200}
                placeholder={
                  resolved?.name || "Ví dụ: Cổng chính trường học, số nhà…"
                }
              />
            </label>
          ) : null}
          <button
            type="button"
            className="btn btn-primary"
            disabled={!draft || resolving}
            onClick={() => {
              if (draft)
                onConfirm({
                  ...draft,
                  name: customName.trim() || resolved?.name || draft.name,
                  address: address || draft.address,
                });
            }}
          >
            <Check size={18} />
            Xác nhận {label}
          </button>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
