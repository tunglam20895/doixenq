"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Pencil, ArrowRight, Clock, CalendarDays } from "lucide-react";
import {
  api,
  useData,
  useDebounce,
  PageHeader,
  Loading,
  ErrorBox,
  Empty,
  SearchField,
  Pagination,
  Dialog,
  SaveButton,
  Status,
} from "./shared";
import type { AdminBooking, Driver, BookingEvent } from "@/lib/admin/types";
import { STATUS_LABELS } from "@/lib/admin/types";
import { VEHICLES, money, tripDate } from "@/lib/data";
import BookingQR from "./BookingQR";
export default function Bookings() {
  const params = useSearchParams();
  const [search, setSearch] = useState(""),
    [status, setStatus] = useState("all"),
    [offset, setOffset] = useState(0),
    [editing, setEditing] = useState<AdminBooking | null>(null),
    [adding, setAdding] = useState(params.get("new") === "1");
  const q = useDebounce(search);
  const { data, error, loading, reload } = useData<{
    items: AdminBooking[];
    total: number;
  }>(
    `bookings?search=${encodeURIComponent(q)}&status=${status}&offset=${offset}`,
  );
  return (
    <>
      <PageHeader
        label="CHUYẾN ĐI"
        title="Quản lý từng lịch hẹn."
        description="Cập nhật chuyến đã đặt, hoàn thành hoặc hủy; ghi nhận số tiền thực tế."
        action={
          <button className="admin-btn primary" onClick={() => setAdding(true)}>
            <Plus size={17} />
            Thêm chuyến đi
          </button>
        }
      />
      <BookingQR />
      <section className="admin-panel">
        <div className="admin-toolbar">
          <SearchField
            value={search}
            onChange={(v) => {
              setSearch(v);
              setOffset(0);
            }}
            placeholder="Tìm mã chuyến, tên khách, số điện thoại"
          />
          <div className="admin-filters" aria-label="Lọc trạng thái chuyến">
            {[
              ["all", "Tất cả"],
              ["booked", "Đã đặt"],
              ["completed", "Hoàn thành"],
              ["cancelled", "Đã hủy"],
            ].map(([id, label]) => (
              <button
                aria-pressed={status === id}
                className={status === id ? "active" : ""}
                key={id}
                onClick={() => {
                  setStatus(id);
                  setOffset(0);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {error ? (
          <ErrorBox message={error} onRetry={reload} />
        ) : loading && !data ? (
          <Loading />
        ) : data?.items.length ? (
          <>
            <div className="admin-table-scroll">
              <table className="admin-table booking-table">
                <thead>
                  <tr>
                    <th>Chuyến / giờ đón</th>
                    <th>Khách hàng</th>
                    <th>Hành trình</th>
                    <th>Xe / tài xế</th>
                    <th>Số tiền</th>
                    <th>Trạng thái</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <strong>{b.id}</strong>
                        <span>{tripDate(b.departure)}</span>
                      </td>
                      <td>
                        <strong>{b.customer}</strong>
                        <a href={"tel:" + b.phone}>{b.phone}</a>
                      </td>
                      <td>
                        <strong title={b.pickup.name}>{b.pickup.name}</strong>
                        <span title={b.destination.name}>
                          → {b.destination.name}
                        </span>
                      </td>
                      <td>
                        <strong>
                          {VEHICLES.find((v) => v.id === b.vehicleId)?.name}
                        </strong>
                        <span>{b.driverName || "Chưa phân công"}</span>
                      </td>
                      <td>
                        <strong>{money(b.actualTotal ?? b.total)}</strong>
                        <span>
                          {b.actualTotal === null ? "Dự kiến" : "Thực tế"}
                        </span>
                      </td>
                      <td>
                        <Status status={b.status} />
                        {b.status === "requested" ? (
                          <span className="admin-new-request">
                            Yêu cầu từ khách
                          </span>
                        ) : null}
                      </td>
                      <td>
                        <button
                          className="admin-icon-btn"
                          aria-label={"Cập nhật chuyến " + b.id}
                          onClick={() => setEditing(b)}
                        >
                          <Pencil size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              offset={offset}
              total={data.total}
              onChange={setOffset}
            />
          </>
        ) : (
          <Empty
            title="Chưa có chuyến phù hợp"
            description="Đơn khách đặt sẽ hiển thị tại đây. Có thể thêm chuyến nhận qua điện thoại hoặc tin nhắn."
          />
        )}
      </section>
      <p className="admin-footnote">
        Chuyến hủy không tính vào doanh thu. Nếu sửa lại trạng thái hoặc số
        tiền, thống kê khách hàng sẽ cập nhật theo.
      </p>
      {editing ? (
        <BookingForm
          booking={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      ) : null}
      {adding ? (
        <NewBooking
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            reload();
          }}
        />
      ) : null}
    </>
  );
}
function BookingForm({
  booking: b,
  onClose,
  onSaved,
}: {
  booking: AdminBooking;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState(
      b.status === "requested" ? "confirmed" : b.status,
    ),
    [driverId, setDriver] = useState(b.driverId),
    [amount, setAmount] = useState(String(b.actualTotal ?? b.total)),
    [reason, setReason] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const { data } = useData<{ items: Driver[] }>("drivers");
  const events = useData<{ items: BookingEvent[] }>(
    "events?id=" + encodeURIComponent(b.id),
  );
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("bookings/update", {
        id: b.id,
        version: b.version,
        status,
        driverId,
        actualTotal: amount === "" ? null : Number(amount),
        reason,
      });
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      title={"Chuyến " + b.id}
      subtitle={b.customer + " · " + b.phone}
      wide
      onClose={onClose}
    >
      <div className="admin-trip-detail">
        <span>
          <CalendarDays size={16} />
          {tripDate(b.departure)}
        </span>
        <div>
          <strong>{b.pickup.name}</strong>
          <ArrowRight size={18} />
          <strong>{b.destination.name}</strong>
        </div>
        <small>
          {VEHICLES.find((v) => v.id === b.vehicleId)?.name} · {b.passengers}{" "}
          khách · {b.roundTrip ? "Khứ hồi" : "Một chiều"}
        </small>
        {b.note ? <p>{b.note}</p> : null}
      </div>
      <form className="admin-form" onSubmit={submit}>
        <div className="admin-form-grid">
          <label className="admin-field">
            Trạng thái chuyến
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="confirmed">Đã xác nhận / Tiếp tục</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </label>
          <label className="admin-field">
            Phân công tài xế
            <select
              value={driverId}
              onChange={(e) => setDriver(e.target.value)}
            >
              <option value="auto">Chưa phân công</option>
              {(data?.items || [])
                .filter((d) => d.active || d.id === b.driverId)
                .map((d) => (
                  <option value={d.id} key={d.id}>
                    {d.name}
                    {!d.vehicle_ids.includes(b.vehicleId)
                      ? " · Khác dòng xe"
                      : ""}
                    {!d.active ? " (Tạm nghỉ)" : ""}
                  </option>
                ))}
            </select>
            {driverId !== "auto" &&
            data?.items.some(
              (d) => d.id === driverId && !d.vehicle_ids.includes(b.vehicleId),
            ) ? (
              <small>
                Tài xế chưa đăng ký dòng xe của chuyến này. Hãy kiểm tra xe thực
                tế trước khi giao chuyến.
              </small>
            ) : null}
            {!data?.items.some((d) => d.active) ? (
              <small>
                Chưa có tài xế hoạt động. Kiểm tra trạng thái tại mục Tài xế.
              </small>
            ) : null}
          </label>
          <label className="admin-field span-full">
            Số tiền thực tế (VNĐ)
            <input
              type="number"
              min={0}
              max={1000000000}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required={status === "completed"}
            />
            <small>
              Giá dự kiến: {money(b.total)}. Chỉ chuyến hoàn thành mới cộng vào
              tổng tiền của khách.
            </small>
          </label>
          <label className="admin-field span-full">
            Ghi chú cập nhật / lý do hủy
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              maxLength={600}
            />
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
          <SaveButton busy={busy} label="Cập nhật chuyến" />
        </div>
      </form>
      <div className="admin-trip-history">
        <h3>
          <Clock size={16} />
          Lịch sử xử lý
        </h3>
        {events.loading ? (
          <small>Đang tải lịch sử…</small>
        ) : (
          events.data?.items.map((e) => (
            <div key={e.id}>
              <span />
              <p>
                <strong>
                  {e.event === "created"
                    ? "Tạo chuyến"
                    : `${STATUS_LABELS[e.detail.from || ""] || ""} → ${STATUS_LABELS[e.detail.to || ""] || "Cập nhật"}`}
                </strong>
                <small>
                  {tripDate(e.created_at)} ·{" "}
                  {e.actor === "web"
                    ? "Khách đặt trên website"
                    : e.actor === "admin"
                      ? "Admin"
                      : e.actor}
                </small>
                {e.detail.reason ? <em>{e.detail.reason}</em> : null}
              </p>
            </div>
          ))
        )}
      </div>
    </Dialog>
  );
}
function initialDate() {
  const d = new Date(Date.now() + 3600000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const get = (k: string) => parts.find((p) => p.type === k)!.value;
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
function NewBooking({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [customer, setCustomer] = useState(""),
    [phone, setPhone] = useState(""),
    [pickup, setPickup] = useState(""),
    [destination, setDestination] = useState(""),
    [departure, setDeparture] = useState(initialDate),
    [vehicleId, setVehicle] = useState("limo"),
    [driverId, setDriver] = useState("auto"),
    [total, setTotal] = useState(""),
    [passengers, setPassengers] = useState(1),
    [note, setNote] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const { data } = useData<{ items: Driver[] }>("drivers");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("bookings", {
        customer,
        phone,
        pickup,
        destination,
        departure: new Date(departure + ":00+07:00").toISOString(),
        vehicleId,
        driverId,
        total: Number(total),
        passengers,
        note,
      });
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      title="Thêm chuyến đi"
      subtitle="Ghi nhận chuyến nhận qua điện thoại hoặc tin nhắn."
      wide
      onClose={onClose}
    >
      <form className="admin-form" onSubmit={submit}>
        <div className="admin-form-grid">
          <label className="admin-field">
            Tên khách hàng
            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              minLength={2}
              maxLength={120}
              required
            />
          </label>
          <label className="admin-field">
            Số điện thoại
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              maxLength={16}
            />
          </label>
          <label className="admin-field span-full">
            Điểm đón
            <input
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              minLength={2}
              maxLength={300}
              required
            />
          </label>
          <label className="admin-field span-full">
            Điểm đến
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              minLength={2}
              maxLength={300}
              required
            />
          </label>
          <label className="admin-field">
            Ngày & giờ đón (giờ Việt Nam)
            <input
              type="datetime-local"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              required
            />
          </label>
          <label className="admin-field">
            Số hành khách
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} hành khách
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            Dòng xe
            <select
              value={vehicleId}
              onChange={(e) => {
                setVehicle(e.target.value);
                setDriver("auto");
              }}
            >
              {VEHICLES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            Tài xế
            <select
              value={driverId}
              onChange={(e) => setDriver(e.target.value)}
            >
              <option value="auto">Chưa phân công</option>
              {(data?.items || [])
                .filter((d) => d.active)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="admin-field span-full">
            Giá dự kiến / đã thỏa thuận (VNĐ)
            <input
              type="number"
              min={0}
              max={1000000000}
              step={1}
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              required
            />
          </label>
          <label className="admin-field span-full">
            Ghi chú chuyến đi
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={600}
              rows={2}
            />
          </label>
        </div>
        <p className="admin-footnote">
          Chuyến mới có trạng thái “Đã đặt”. Khi hoàn thành, cập nhật số tiền
          thực tế để tính doanh thu.
        </p>
        {error ? (
          <p className="admin-alert error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="admin-form-actions">
          <button type="button" className="admin-btn" onClick={onClose}>
            Đóng
          </button>
          <SaveButton busy={busy} label="Thêm chuyến đi" />
        </div>
      </form>
    </Dialog>
  );
}
