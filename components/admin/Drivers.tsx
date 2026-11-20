"use client";
import { useRef, useState } from "react";
import {
  Plus,
  Pencil,
  Phone,
  MapPin,
  Upload,
  ImageOff,
  CarFront,
} from "lucide-react";
import {
  api,
  useData,
  PageHeader,
  Loading,
  ErrorBox,
  Empty,
  SearchField,
  Dialog,
  SaveButton,
} from "./shared";
import { VEHICLES } from "@/lib/data";
import type { Driver } from "@/lib/admin/types";
export default function Drivers() {
  const { data, error, loading, reload } = useData<{ items: Driver[] }>(
    "drivers",
  );
  const [search, setSearch] = useState(""),
    [editing, setEditing] = useState<Driver | null | undefined>(undefined);
  const list = (data?.items || []).filter((d) =>
    (d.name + " " + d.phone + " " + d.plate)
      .toLocaleLowerCase("vi")
      .includes(search.toLocaleLowerCase("vi")),
  );
  return (
    <>
      <PageHeader
        label="TÀI XẾ"
        title="Người đồng hành của đội xe."
        description="Cập nhật hồ sơ và xe phụ trách để điều phối chuyến."
        action={
          <button
            className="admin-btn primary"
            onClick={() => setEditing(null)}
          >
            <Plus size={17} />
            Thêm tài xế
          </button>
        }
      />
      <div className="admin-toolbar standalone">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Tìm tài xế, số điện thoại, biển số"
        />
        <span>{list.length} tài xế</span>
      </div>
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : loading && !data ? (
        <Loading />
      ) : list.length ? (
        <div className="admin-driver-grid">
          {list.map((d) => (
            <article className="admin-panel admin-driver" key={d.id}>
              <div className="admin-driver-head">
                <div className="admin-driver-avatar">
                  {d.hasAvatar ? (
                    <img
                      src={`/api/admin/driver-photo?id=${encodeURIComponent(d.id)}&v=${encodeURIComponent(d.updated_at)}`}
                      alt={d.name}
                      width={62}
                      height={62}
                    />
                  ) : (
                    d.name.trim().split(/\s+/).at(-1)?.[0]
                  )}
                </div>
                <span
                  className={
                    "admin-status " + (d.active ? "completed" : "cancelled")
                  }
                >
                  {d.active ? "Hoạt động" : "Tạm nghỉ"}
                </span>
              </div>
              <h2>{d.name}</h2>
              <p>{d.intro || "Chưa có giới thiệu"}</p>
              <div className="admin-driver-detail">
                <span>
                  <Phone size={15} />
                  {d.phone || "Chưa có số điện thoại"}
                </span>
                <span>
                  <MapPin size={15} />
                  {d.area || "Chưa có khu vực"}
                </span>
                <span>
                  <CarFront size={15} />
                  {d.plate || "Chưa có biển số"}
                </span>
              </div>
              <div className="admin-driver-vehicles">
                {d.vehicle_ids.map((id) => (
                  <span key={id}>
                    {VEHICLES.find((v) => v.id === id)?.name || id}
                  </span>
                ))}
              </div>
              <div className="admin-driver-bottom">
                <span>Chỉ hiển thị nội bộ</span>
                <button
                  className="admin-btn subtle"
                  onClick={() => setEditing(d)}
                >
                  <Pencil size={15} />
                  Chỉnh sửa
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title="Chưa có tài xế phù hợp"
          description="Thêm hồ sơ tài xế để phân công chuyến."
        />
      )}
      {editing !== undefined ? (
        <DriverForm
          driver={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            reload();
          }}
        />
      ) : null}
    </>
  );
}
function DriverForm({
  driver,
  onClose,
  onSaved,
}: {
  driver: Driver | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(driver?.name || ""),
    [phone, setPhone] = useState(driver?.phone || ""),
    [area, setArea] = useState(driver?.area || ""),
    [intro, setIntro] = useState(driver?.intro || ""),
    [plate, setPlate] = useState(driver?.plate || ""),
    [note, setNote] = useState(driver?.note || ""),
    [active, setActive] = useState(driver?.active ?? true),
    [vehicles, setVehicles] = useState<string[]>(driver?.vehicle_ids || []),
    [avatar, setAvatar] = useState<string | null | undefined>(undefined),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const file = useRef<HTMLInputElement>(null);
  async function upload(f: File | undefined) {
    if (!f) return;
    setError("");
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(f.type) ||
      f.size > 8 * 1024 * 1024
    ) {
      setError("Chọn ảnh JPG, PNG hoặc WebP, tối đa 8 MB.");
      return;
    }
    try {
      const url = URL.createObjectURL(f);
      try {
        const im = new Image();
        im.src = url;
        await im.decode();
        const canvas = document.createElement("canvas"),
          scale = Math.min(
            1,
            512 / Math.max(im.naturalWidth, im.naturalHeight),
          );
        canvas.width = Math.max(1, Math.round(im.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(im.naturalHeight * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) throw Error();
        ctx.drawImage(im, 0, 0, canvas.width, canvas.height);
        const value = canvas.toDataURL("image/webp", 0.82);
        if (value.length > 340000) throw Error();
        setAvatar(value);
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch {
      setError("Chưa đọc được ảnh. Vui lòng chọn ảnh khác.");
    }
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicles.length) {
      setError("Vui lòng chọn ít nhất một dòng xe.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api("drivers", {
        id: driver?.id || crypto.randomUUID(),
        name,
        phone,
        area,
        intro,
        plate,
        note,
        active,
        published: false,
        vehicle_ids: vehicles,
        ...(avatar !== undefined ? { avatar_data: avatar } : {}),
      });
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const preview =
    avatar === undefined && driver?.hasAvatar
      ? `/api/admin/driver-photo?id=${driver.id}&v=${encodeURIComponent(driver.updated_at)}`
      : avatar;
  return (
    <Dialog
      wide
      title={driver ? "Cập nhật tài xế" : "Thêm tài xế"}
      subtitle="Số điện thoại và ghi chú riêng chỉ dành cho admin."
      onClose={onClose}
    >
      <form className="admin-form" onSubmit={submit}>
        <div className="admin-avatar-uploader">
          <span className="admin-driver-avatar large">
            {preview ? (
              <img
                src={preview}
                alt="Ảnh tài xế đang chọn"
                width={85}
                height={85}
              />
            ) : (
              <CarFront size={29} />
            )}
          </span>
          <div>
            <button
              className="admin-btn"
              type="button"
              onClick={() => file.current?.click()}
            >
              <Upload size={16} />
              Tải ảnh lên
            </button>
            {preview ? (
              <button
                type="button"
                className="admin-btn subtle"
                onClick={() => setAvatar(null)}
              >
                <ImageOff size={15} />
                Bỏ ảnh
              </button>
            ) : null}
            <small>JPG, PNG hoặc WebP · Tối đa 8 MB</small>
          </div>
          <input
            ref={file}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="admin-file-input"
            aria-label="Ảnh tài xế"
            onChange={(e) => void upload(e.target.files?.[0])}
          />
        </div>
        <div className="admin-form-grid">
          <label className="admin-field">
            Tên tài xế
            <input
              required
              minLength={2}
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="admin-field">
            Số điện thoại
            <input
              type="tel"
              maxLength={16}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <label className="admin-field">
            Khu vực hoạt động
            <input
              maxLength={200}
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </label>
          <label className="admin-field">
            Biển số xe
            <input
              maxLength={25}
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
            />
          </label>
          <label className="admin-field span-full">
            Giới thiệu cho khách
            <textarea
              rows={2}
              maxLength={300}
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
            />
          </label>
        </div>
        <fieldset className="admin-vehicle-checkboxes">
          <legend>Dòng xe có thể nhận chuyến</legend>
          {VEHICLES.map((v) => (
            <label key={v.id}>
              <input
                type="checkbox"
                checked={vehicles.includes(v.id)}
                onChange={(e) =>
                  setVehicles(
                    e.target.checked
                      ? [...vehicles, v.id]
                      : vehicles.filter((x) => x !== v.id),
                  )
                }
              />
              {v.name}
            </label>
          ))}
        </fieldset>
        <label className="admin-field">
          Ghi chú nội bộ
          <textarea
            rows={2}
            maxLength={2000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        <div className="admin-switches">
          <label>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            <span>
              <strong>Đang hoạt động</strong>
              <small>
                Tắt khi tài xế tạm nghỉ; lịch sử chuyến vẫn được giữ.
              </small>
            </span>
          </label>
        </div>
        {error ? (
          <p className="admin-alert error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="admin-form-actions">
          <button type="button" className="admin-btn" onClick={onClose}>
            Đóng
          </button>
          <SaveButton busy={busy} />
        </div>
      </form>
    </Dialog>
  );
}
