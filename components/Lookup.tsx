"use client";
import { ESTIMATED_FARE_NOTE, FARE_EXCLUSIONS } from "@/lib/fare-copy";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Search,
  ArrowRight,
  Clock,
  CalendarDays,
  CheckCircle2,
  ShieldCheck,
  Users,
  Loader2,
} from "lucide-react";
import { VEHICLES, money, tripDate } from "@/lib/data";
import { groupBookings, type PublicBooking } from "@/lib/booking-lookup";
type Credentials = { phone: string } | { id: string; token: string };
const status = {
  requested: "Chờ đội xe xác nhận",
  confirmed: "Đã xác nhận",
  cancelled: "Đã hủy",
  completed: "Đã hoàn thành",
};
export default function Lookup() {
  const params = useSearchParams();
  const [phone, setPhone] = useState("");
  const [bookings, setBookings] = useState<PublicBooking[] | null>(null);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [refreshError, setRefreshError] = useState("");
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const active = useRef<AbortController | null>(null);
  async function lookup(input: Credentials) {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setBusy(true);
    setError("");
    setRefreshError("");
    setBookings(null);
    setCredentials(null);
    try {
      const response = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok)
        throw Error(data.error || "Chưa thể tra cứu chuyến xe.");
      const items: PublicBooking[] =
        data.bookings || (data.booking ? [data.booking] : []);
      setBookings(items);
      setCredentials(input);
      setTab(groupBookings(items).upcoming.length ? "upcoming" : "past");
    } catch (e) {
      if (!controller.signal.aborted)
        setError(
          e instanceof Error ? e.message : "Chưa thể tra cứu chuyến xe.",
        );
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  useEffect(() => {
    const id = params.get("ma"),
      token = params.get("token");
    if (id && token) {
      void lookup({ id, token });
      window.history.replaceState({}, "", "/tra-cuu");
    }
    return () => active.current?.abort();
  }, []);
  useEffect(() => {
    if (!credentials) return;
    const controller = new AbortController();
    let refreshing = false;
    const timer = setInterval(async () => {
      if (document.visibilityState !== "visible" || refreshing) return;
      refreshing = true;
      try {
        const response = await fetch("/api/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
          signal: controller.signal,
        });
        if (!response.ok) throw Error();
        const data = await response.json();
        if (!controller.signal.aborted) {
          setBookings(data.bookings || [data.booking]);
          setRefreshError("");
        }
      } catch {
        if (!controller.signal.aborted)
          setRefreshError("Chưa cập nhật được trạng thái. Đang thử lại…");
      } finally {
        refreshing = false;
      }
    }, 60000);
    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, [credentials]);
  const groups = groupBookings(bookings || []);
  return (
    <main id="main" className="lookup-page">
      <div className="wrap">
        <div className="lookup-heading">
          <span className="eyebrow">LỊCH HẸN CỦA BẠN</span>
          <h1>Chuyến xe đến đâu rồi?</h1>
          <p>Nhập số điện thoại đã đặt xe, chỉ cần khớp 9 số cuối.</p>
        </div>
        <div className="lookup-layout">
          <div className="form-card lookup-form">
            <span className="lookup-symbol">
              <Search size={28} />
            </span>
            <h2>Tra cứu chuyến xe</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void lookup({ phone });
              }}
            >
              <label className="field">
                Số điện thoại
                <input
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Số điện thoại hoặc 9 số cuối"
                  required
                  autoComplete="tel"
                  maxLength={40}
                />
              </label>
              <button className="btn btn-primary full-width" disabled={busy}>
                {busy ? (
                  <Loader2 size={18} className="spin" />
                ) : (
                  <Search size={18} />
                )}{" "}
                Tra cứu chuyến xe
              </button>
            </form>
            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : null}
            <p className="info-note">
              <ShieldCheck size={17} />
              Có thể nhập số bắt đầu bằng 0, +84 hoặc 9 số cuối. Không cần mã
              đặt xe.
            </p>
          </div>
          <div className="lookup-result" aria-live="polite" aria-busy={busy}>
            {bookings !== null ? (
              <>
                <div
                  className="trip-toggle lookup-tabs"
                  aria-label="Loại chuyến xe"
                >
                  <button
                    type="button"
                    className={tab === "upcoming" ? "active" : ""}
                    aria-pressed={tab === "upcoming"}
                    onClick={() => setTab("upcoming")}
                  >
                    Chuyến sắp tới ({groups.upcoming.length})
                  </button>
                  <button
                    type="button"
                    className={tab === "past" ? "active" : ""}
                    aria-pressed={tab === "past"}
                    onClick={() => setTab("past")}
                  >
                    Chuyến đã đi ({groups.past.length})
                  </button>
                </div>
                <p className="input-hint" role="status">
                  {refreshError ||
                    "Trạng thái tự cập nhật mỗi phút khi trang đang mở."}
                </p>
                {tab === "past" ? (
                  <p className="input-hint">
                    Lịch sử gồm chuyến hoàn thành và chuyến đã hủy.
                  </p>
                ) : null}
                {groups[tab].length ? (
                  groups[tab].map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))
                ) : (
                  <div className="lookup-empty">
                    <h2>
                      {bookings.length
                        ? tab === "upcoming"
                          ? "Chưa có chuyến sắp tới."
                          : "Chưa có chuyến đã đi."
                        : "Không tìm thấy chuyến xe."}
                    </h2>
                    <p>Kiểm tra số điện thoại hoặc đặt chuyến mới.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="lookup-empty">
                <h2>
                  {busy
                    ? "Đang tìm chuyến xe…"
                    : "Xem lịch xe bằng số điện thoại."}
                </h2>
                <p>Chuyến sắp tới và lịch sử chuyến đi sẽ hiển thị tại đây.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
function BookingCard({ booking }: { booking: PublicBooking }) {
  return (
    <div className="form-card booking-result">
      <div className={"status-badge status-" + booking.status}>
        {booking.status === "requested" ? (
          <Clock size={16} />
        ) : (
          <CheckCircle2 size={16} />
        )}{" "}
        {status[booking.status]}
      </div>
      <TripProgress booking={booking} />
      <div className="result-title">
        <h2>{booking.id}</h2>
      </div>
      <div className="result-journey">
        <div>
          <span className="route-dot origin" />
          <span>
            <small>Điểm đón</small>
            <strong>{booking.pickup.name}</strong>
            <p>{booking.pickup.address}</p>
          </span>
        </div>
        <div>
          <span className="route-dot destination" />
          <span>
            <small>Điểm đến</small>
            <strong>{booking.destination.name}</strong>
            <p>{booking.destination.address}</p>
          </span>
        </div>
      </div>
      <div className="result-details">
        <div>
          <CalendarDays size={18} />
          <span>
            Giờ đón<strong>{tripDate(booking.departure)}</strong>
          </span>
        </div>
        {booking.returnAt ? (
          <div>
            <CalendarDays size={18} />
            <span>
              Giờ về<strong>{tripDate(booking.returnAt)}</strong>
            </span>
          </div>
        ) : null}
        <div>
          <Users size={18} />
          <span>
            Xe & số khách
            <strong>
              {VEHICLES.find((v) => v.id === booking.vehicleId)?.name} ·{" "}
              {booking.passengers} khách
            </strong>
          </span>
        </div>
      </div>
      {booking.note ? (
        <div className="booking-note">
          <small>Ghi chú của bạn</small>
          <p>{booking.note}</p>
        </div>
      ) : null}
      <div className="summary-price">
        <span>Giá dự kiến {booking.roundTrip ? "khứ hồi" : "một chiều"}</span>
        <strong>{money(booking.actualTotal ?? booking.total)}</strong>
      </div>
      <p className="input-hint">
        {ESTIMATED_FARE_NOTE} {FARE_EXCLUSIONS}
      </p>
      {booking.status === "requested" ? (
        <div className="info-note">
          <Clock size={18} />
          Yêu cầu đã được lưu. Đội xe sẽ liên hệ kiểm tra lịch, chốt xe và giá.
          Vui lòng giữ điện thoại.
        </div>
      ) : null}
      <Link href="/dat-xe" className="text-link">
        Đặt thêm chuyến xe <ArrowRight size={17} />
      </Link>
    </div>
  );
}

function TripProgress({ booking }: { booking: PublicBooking }) {
  if (booking.status === "cancelled")
    return (
      <p className="trip-cancelled">Chuyến đã hủy. Hành trình này đã dừng.</p>
    );
  const current =
    booking.status === "completed" ? 2 : booking.status === "confirmed" ? 1 : 0;
  return (
    <ol className="trip-progress" aria-label="Tiến trình chuyến xe">
      {["Đã nhận yêu cầu", "Đã xác nhận", "Hoàn thành"].map((label, index) => (
        <li
          key={label}
          className={index <= current ? "reached" : ""}
          aria-current={index === current ? "step" : undefined}
        >
          <span className="trip-progress-dot">
            {index < current ? <CheckCircle2 size={16} /> : index + 1}
          </span>
          <span>{label}</span>
        </li>
      ))}
    </ol>
  );
}
