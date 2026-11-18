"use client";
import { ESTIMATED_FARE_NOTE, FARE_EXCLUSIONS } from "@/lib/fare-copy";
import Link from "next/link";
import TripLookupQR from "./TripLookupQR";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  MapPin,
  Route,
  Users,
  Zap,
  ShieldCheck,
  Clock,
  CalendarDays,
  Copy,
  Loader2,
  ChevronDown,
  Info,
} from "lucide-react";
import { PLACES, VEHICLES, money, tripDate, type Place } from "@/lib/data";
import { calculateFare } from "@/lib/pricing";
import type { RouteResult } from "@/lib/routing";
import PlaceInput from "./PlaceInput";
const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false,
});
import type { PublicDriver } from "@/lib/admin/types";
const RouteMap = dynamic(() => import("./RouteMap"), {
  ssr: false,
  loading: () => <div className="map-placeholder">Đang tải bản đồ…</div>,
});
type Quote = {
  route: RouteResult;
  fare: ReturnType<typeof calculateFare>;
  quoteToken: string;
  expires: number;
};
function initialPickup(value: string | null) {
  try {
    const p = JSON.parse(value || "null");
    if (
      p &&
      typeof p.name === "string" &&
      typeof p.address === "string" &&
      typeof p.id === "string" &&
      typeof p.lat === "number" &&
      typeof p.lng === "number" &&
      p.lat >= 8 &&
      p.lat <= 24 &&
      p.lng >= 102 &&
      p.lng <= 110
    )
      return p as Place;
  } catch {}
  return null;
}
function tomorrow() {
  const d = new Date(Date.now() + 86400000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  return parts + "T08:00";
}
const toISO = (value: string) => new Date(value + ":00+07:00").toISOString();
export default function Booking() {
  const [drivers, setDrivers] = useState<PublicDriver[]>([]);
  const [driversError, setDriversError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/drivers", { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw Error();
        const d = await r.json();
        setDrivers(d.drivers);
        setDriverId((current) =>
          current === "auto" ||
          d.drivers.some((x: PublicDriver) => x.id === current)
            ? current
            : "auto",
        );
      })
      .catch((e) => {
        if (e.name !== "AbortError") setDriversError(true);
      });
    return () => controller.abort();
  }, []);
  const params = useSearchParams();
  const initialVehicle = VEHICLES.some((v) => v.id === params.get("vehicle"))
    ? params.get("vehicle")!
    : "limo";
  const [pickup, setPickup] = useState<Place | null>(
    initialPickup(params.get("pickup")) ||
      PLACES.find((p) => p.id === params.get("from")) ||
      PLACES[0],
  );
  const [destination, setDestination] = useState<Place | null>(
    initialPickup(params.get("destination")) ||
      PLACES.find((p) => p.id === params.get("to")) ||
      null,
  );
  const [vehicleId, setVehicleId] = useState(initialVehicle);
  const [driverId, setDriverId] = useState(params.get("driver") || "auto");
  const [departure, setDeparture] = useState("");
  const [returnAt, setReturnAt] = useState("");
  const [roundTrip, setRoundTrip] = useState(false);
  const [passengers, setPassengers] = useState(1);
  const [step, setStep] = useState(1);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [activePin, setActivePin] = useState<"pickup" | "destination">(
    "pickup",
  );
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [success, setSuccess] = useState<{ id: string; token: string } | null>(
    null,
  );
  const [copied, setCopied] = useState(false);
  const [honey, setHoney] = useState("");
  const requestId = useRef("");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    setDeparture(tomorrow());
    requestId.current = crypto.randomUUID();
  }, []);
  const vehicle = VEHICLES.find((v) => v.id === vehicleId)!;
  const driver = drivers.find((d) => d.id === driverId);
  const move = (next: number) => {
    setStep(next);
    setError("");
    window.scrollTo({ top: 0, behavior: "instant" });
    setTimeout(() => heading.current?.focus(), 30);
  };
  const changePlace = (p: Place | null, which: "pickup" | "destination") => {
    if (which === "pickup") setPickup(p);
    else setDestination(p);
    setQuote(null);
  };
  async function makeQuote() {
    if (!pickup || !destination)
      throw new Error(
        "Vui lòng chọn điểm đón và điểm đến từ danh sách hoặc ghim bản đồ.",
      );
    if (!departure) throw new Error("Vui lòng chọn giờ đón.");
    const start = Date.parse(toISO(departure));
    if (start < Date.now() + 10 * 60000)
      throw new Error("Giờ đón cần cách hiện tại ít nhất 10 phút.");
    if (roundTrip && (!returnAt || Date.parse(toISO(returnAt)) <= start))
      throw new Error("Vui lòng chọn giờ đón về sau giờ đi.");
    const res = await fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pickup, destination, vehicleId, roundTrip }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Chưa thể tính giá.");
    if (
      roundTrip &&
      Date.parse(toISO(returnAt)) < start + data.route.durationMinutes * 60000
    )
      throw new Error("Giờ đón về cần sau thời điểm dự kiến đến nơi.");
    setQuote(data);
    return data as Quote;
  }
  async function nextFromRoute(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await makeQuote();
      move(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa thể tính giá.");
    } finally {
      setBusy(false);
    }
  }
  async function nextFromVehicle() {
    setBusy(true);
    setError("");
    try {
      if (passengers > vehicle.passengers)
        throw new Error("Vui lòng chọn xe đủ chỗ cho số khách.");
      await makeQuote();
      move(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa thể tính giá.");
    } finally {
      setBusy(false);
    }
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!quote) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteToken: quote.quoteToken,
          requestId: requestId.current,
          customer,
          phone: phone.replace(/\s/g, ""),
          note,
          driverId,
          passengers,
          departure: toISO(departure),
          ...(roundTrip ? { returnAt: toISO(returnAt) } : {}),
          consent,
          website: honey,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chưa gửi được yêu cầu.");
      setSuccess(data);
      try {
        const recent = JSON.parse(localStorage.getItem("nq-recent-v1") || "[]");
        localStorage.setItem(
          "nq-recent-v1",
          JSON.stringify(
            [
              { id: data.id, token: data.token },
              ...recent.filter((b: { id: string }) => b.id !== data.id),
            ].slice(0, 5),
          ),
        );
      } catch {}
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa gửi được yêu cầu.");
    } finally {
      setBusy(false);
    }
  }
  if (success)
    return (
      <main id="main" className="booking-page">
        <div className="wrap">
          <div className="success-card">
            <span className="success-icon">
              <CheckCircle2 size={40} />
            </span>
            <span className="eyebrow">ĐẶT XE THÀNH CÔNG</span>
            <h1>Đã nhận lịch đặt xe của bạn.</h1>
            <p>
              Cảm ơn bạn đã đặt xe. Tài xế sẽ liên hệ xác nhận lịch đón và báo
              giá chính thức.
              <br />
              Theo dõi chuyến để xem cập nhật từ đội xe.
            </p>
            <div className="booking-code">
              <span>Mã đặt xe của bạn</span>
              <strong>{success.id}</strong>
              <button
                className="icon-button"
                aria-label="Sao chép mã đặt xe"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(success.id);
                    setCopied(true);
                  } catch {
                    setError("Bạn có thể nhấn giữ mã để sao chép.");
                  }
                }}
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
            <div className="success-summary">
              <div>
                <MapPin size={18} />
                <span>
                  {pickup?.name}
                  <ArrowRight size={14} />
                  {destination?.name}
                </span>
              </div>
              <div>
                <CalendarDays size={18} />
                <span>{tripDate(toISO(departure))}</span>
              </div>
              <div>
                <Users size={18} />
                <span>
                  {vehicle.name} · {passengers} khách
                </span>
              </div>
              <div className="success-price">
                <span>Giá dự kiến</span>
                <strong>{money(quote?.fare.total || 0)}</strong>
              </div>
            </div>
            <p className="input-hint">
              {ESTIMATED_FARE_NOTE} {FARE_EXCLUSIONS}
            </p>
            <TripLookupQR id={success.id} token={success.token} />
            <Link
              className="btn btn-primary"
              href={`/tra-cuu?ma=${success.id}&token=${success.token}`}
            >
              Theo dõi chuyến xe <ArrowRight size={18} />
            </Link>
            <Link href="/" className="text-link">
              Về trang chủ
            </Link>
            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </main>
    );
  return (
    <main id="main" className="booking-page">
      <div className="wrap">
        <Link href="/" className="back-link">
          <ArrowLeft size={16} />
          Về đội xe
        </Link>
        <div className="booking-heading">
          <div>
            <span className="eyebrow">ĐẶT XE NHƯ QUỲNH HƯNG YÊN</span>
            <h1 tabIndex={-1} ref={heading}>
              {step === 1
                ? "Chuyến tới, bạn đi đâu?"
                : step === 2
                  ? "Chọn người bạn đồng hành."
                  : "Hẹn giờ, mình đón."}
            </h1>
            <p>
              {step === 1
                ? "Chọn điểm đi, điểm đến và thời gian của bạn."
                : step === 2
                  ? "Chọn dòng xe và tài xế bạn muốn đi cùng."
                  : "Kiểm tra hành trình và để lại thông tin liên hệ."}
            </p>
          </div>
          <span className="booking-assurance">
            <ShieldCheck size={20} />
            Chưa cần thanh toán
          </span>
        </div>
        <ol className="booking-steps" aria-label="Các bước đặt xe">
          {["Hành trình", "Xe & tài xế", "Thông tin & xác nhận"].map((s, i) => (
            <li
              key={s}
              className={
                step === i + 1 ? "current" : step > i + 1 ? "done" : ""
              }
              aria-current={step === i + 1 ? "step" : undefined}
            >
              <span>{step > i + 1 ? <Check size={15} /> : i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
        <div className="booking-layout">
          <div className="booking-main">
            {error ? (
              <div role="alert" className="form-error">
                <Info size={18} />
                {error}
              </div>
            ) : null}
            {step === 1 ? (
              <form onSubmit={nextFromRoute} className="form-card">
                <div className="card-heading">
                  <Route size={21} />
                  <h2>Hành trình của bạn</h2>
                </div>
                <div className="trip-toggle">
                  <button
                    type="button"
                    aria-pressed={!roundTrip}
                    className={!roundTrip ? "active" : ""}
                    onClick={() => {
                      setRoundTrip(false);
                      setQuote(null);
                    }}
                  >
                    Một chiều
                  </button>
                  <button
                    type="button"
                    aria-pressed={roundTrip}
                    className={roundTrip ? "active" : ""}
                    onClick={() => {
                      setRoundTrip(true);
                      setQuote(null);
                    }}
                  >
                    Khứ hồi
                  </button>
                </div>
                <div className="journey-fields">
                  <span className="journey-line" />
                  <PlaceInput
                    label="Điểm đón"
                    value={pickup}
                    onChange={(p) => changePlace(p, "pickup")}
                    onMap={() => {
                      setActivePin("pickup");
                      setShowMap(true);
                    }}
                  />
                  <PlaceInput
                    label="Điểm đến"
                    value={destination}
                    onChange={(p) => changePlace(p, "destination")}
                    onMap={() => {
                      setActivePin("destination");
                      setShowMap(true);
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="map-toggle"
                  onClick={() => {
                    setActivePin(destination ? "pickup" : "destination");
                    setShowMap(true);
                  }}
                >
                  <MapPin size={16} />
                  {showMap ? "Thu gọn bản đồ" : "Chọn vị trí trên bản đồ"}
                  <ChevronDown size={16} />
                </button>
                {showMap ? (
                  <LocationPicker
                    which={activePin}
                    value={activePin === "pickup" ? pickup : destination}
                    onClose={() => setShowMap(false)}
                    onConfirm={(p) => {
                      changePlace(p, activePin);
                      setShowMap(false);
                    }}
                  />
                ) : null}
                <div className="field-grid">
                  <label className="field">
                    Ngày & giờ đón{" "}
                    <span className="field-helper">Giờ Việt Nam (GMT+7)</span>
                    <input
                      type="datetime-local"
                      value={departure}
                      onChange={(e) => {
                        setDeparture(e.target.value);
                        setQuote(null);
                      }}
                      required
                    />
                  </label>
                  <label className="field">
                    Số hành khách{" "}
                    <span className="field-helper">Không tính tài xế</span>
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
                  {roundTrip ? (
                    <label className="field full-width">
                      Ngày & giờ đón về
                      <input
                        type="datetime-local"
                        value={returnAt}
                        onChange={(e) => {
                          setReturnAt(e.target.value);
                          setQuote(null);
                        }}
                        required
                      />
                    </label>
                  ) : null}
                </div>
                <p className="info-note">
                  <Clock size={17} />
                  Đặt giờ đón trước ít nhất 10 phút. Đội xe sẽ kiểm tra lịch
                  thực tế và xác nhận lại.
                </p>
                <button
                  className="btn btn-primary full-width"
                  disabled={busy}
                  type="submit"
                >
                  {busy ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      Đang tìm tuyến đường…
                    </>
                  ) : (
                    <>
                      Xem giá & chọn xe <ArrowRight size={18} />
                    </>
                  )}
                </button>
                <p className="input-hint centered">
                  Địa chỉ gợi ý hiện gồm các điểm phổ biến. Bạn có thể ghim địa
                  chỉ khác trên bản đồ.
                </p>
              </form>
            ) : null}
            {step === 2 ? (
              <div className="form-card">
                <div className="card-heading">
                  <Users size={21} />
                  <h2>Chọn xe phù hợp</h2>
                </div>
                <div className="booking-vehicle-list">
                  {VEHICLES.map((v) => {
                    const disabled = v.passengers < passengers;
                    return (
                      <button
                        type="button"
                        key={v.id}
                        aria-pressed={vehicleId === v.id}
                        disabled={disabled}
                        className={
                          "booking-vehicle " +
                          (vehicleId === v.id ? "selected" : "")
                        }
                        onClick={() => {
                          setVehicleId(v.id);
                          if (
                            !drivers.some(
                              (d) =>
                                d.id === driverId &&
                                d.vehicleIds.includes(v.id),
                            )
                          )
                            setDriverId("auto");
                        }}
                      >
                        <span className="radio-dot" />
                        <img
                          src={v.image}
                          alt={v.name}
                          width="130"
                          height="80"
                        />
                        <span className="booking-vehicle-info">
                          <strong>{v.name}</strong>
                          <small>
                            {v.seats} chỗ · Tối đa {v.passengers} khách{" "}
                            {v.electric ? "· Xe điện" : ""}
                          </small>
                          {disabled ? (
                            <small className="capacity-error">
                              Không đủ chỗ cho {passengers} khách
                            </small>
                          ) : null}
                        </span>
                        <span className="booking-vehicle-price">
                          {quote
                            ? money(
                                calculateFare(
                                  v.id,
                                  quote.route.distanceKm,
                                  roundTrip,
                                ).total,
                              )
                            : "—"}
                          <small>giá dự kiến</small>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <h3 className="form-subheading">Bạn muốn đi cùng ai?</h3>
                {driversError ? (
                  <p className="input-hint">
                    Chưa tải được danh sách tài xế. Bạn có thể để đội xe sắp
                    xếp.
                  </p>
                ) : null}
                <div className="driver-choices">
                  <label
                    className={
                      "driver-choice " + (driverId === "auto" ? "selected" : "")
                    }
                  >
                    <input
                      type="radio"
                      name="driver"
                      value="auto"
                      checked={driverId === "auto"}
                      onChange={() => setDriverId("auto")}
                    />
                    <span className="choice-auto">
                      <ShieldCheck size={21} />
                    </span>
                    <span>
                      <strong>Đội xe sắp xếp giúp tôi</strong>
                      <small>Tài xế phù hợp với xe và lịch của bạn</small>
                    </span>
                  </label>
                  {drivers
                    .filter((d) => d.vehicleIds.includes(vehicleId))
                    .map((d) => (
                      <label
                        key={d.id}
                        className={
                          "driver-choice " +
                          (driverId === d.id ? "selected" : "")
                        }
                      >
                        <input
                          type="radio"
                          name="driver"
                          value={d.id}
                          checked={driverId === d.id}
                          onChange={() => setDriverId(d.id)}
                        />
                        <span
                          className="choice-avatar"
                          style={{ background: d.color }}
                        >
                          {d.initials}
                        </span>
                        <span>
                          <strong>{d.name}</strong>
                          <small>{d.intro}</small>
                        </span>
                      </label>
                    ))}
                </div>
                <p className="info-note">
                  <Info size={17} />
                  Lựa chọn xe và tài xế là mong muốn của bạn. Đội xe xác nhận
                  sau khi kiểm tra lịch.
                </p>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => move(1)}
                  >
                    <ArrowLeft size={16} />
                    Đổi hành trình
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={busy || passengers > vehicle.passengers}
                    onClick={nextFromVehicle}
                  >
                    {busy ? <Loader2 size={18} className="spin" /> : null}Tiếp
                    tục <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ) : null}
            {step === 3 ? (
              <form onSubmit={submit} className="form-card">
                <div className="card-heading">
                  <Users size={21} />
                  <h2>Thông tin liên hệ</h2>
                </div>
                <div className="field-grid">
                  <label className="field">
                    Họ và tên
                    <input
                      value={customer}
                      onChange={(e) => setCustomer(e.target.value)}
                      placeholder="Tên người đặt xe"
                      autoComplete="name"
                      minLength={2}
                      maxLength={80}
                      required
                    />
                  </label>
                  <label className="field">
                    Số điện thoại
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Số điện thoại để liên hệ"
                      autoComplete="tel"
                      type="tel"
                      inputMode="tel"
                      maxLength={15}
                      required
                    />
                  </label>
                  <label className="field full-width">
                    Ghi chú cho chuyến đi{" "}
                    <span className="field-helper">Không bắt buộc</span>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      maxLength={600}
                      placeholder="Lối vào điểm đón, số hiệu chuyến bay, hành lý, yêu cầu khác…"
                    />
                    <span className="input-hint">
                      Nếu bạn ghim bản đồ, hãy bổ sung tên đường hoặc địa danh
                      gần đó.
                    </span>
                  </label>
                </div>
                <label className="honey" aria-hidden="true">
                  Website
                  <input
                    value={honey}
                    onChange={(e) => setHoney(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>
                <div className="review-block">
                  <h3>Kiểm tra lịch hẹn</h3>
                  <div>
                    <span>Xe mong muốn</span>
                    <strong>{vehicle.name}</strong>
                  </div>
                  <div>
                    <span>Tài xế mong muốn</span>
                    <strong>{driver?.name || "Đội xe sắp xếp"}</strong>
                  </div>
                  <div>
                    <span>Ngày & giờ đón</span>
                    <strong>{tripDate(toISO(departure))}</strong>
                  </div>
                  {roundTrip ? (
                    <div>
                      <span>Ngày & giờ về</span>
                      <strong>{tripDate(toISO(returnAt))}</strong>
                    </div>
                  ) : null}
                  <div>
                    <span>Hành khách</span>
                    <strong>{passengers} người</strong>
                  </div>
                </div>
                <label className="consent">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    required
                  />
                  <span>
                    Tôi đồng ý với{" "}
                    <Link href="/chinh-sach" target="_blank">
                      chính sách đặt xe và bảo mật
                    </Link>
                    , và cho phép đội xe liên hệ để sắp xếp chuyến.
                  </span>
                </label>
                <p className="info-note">
                  <ShieldCheck size={18} />
                  {ESTIMATED_FARE_NOTE} Bạn chưa cần thanh toán ở bước này.
                </p>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={busy}
                    onClick={() => move(2)}
                  >
                    <ArrowLeft size={16} />
                    Chọn lại xe
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={busy || !consent}
                  >
                    {busy ? (
                      <>
                        <Loader2 className="spin" size={18} />
                        Đang gửi…
                      </>
                    ) : (
                      <>
                        Đặt xe ngay <ArrowUpRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : null}
          </div>
          <aside className="booking-sidebar">
            <div className="trip-summary">
              <span className="eyebrow">CHUYẾN ĐI CỦA BẠN</span>
              <div className="summary-route">
                <div>
                  <span className="route-dot origin" />
                  <div>
                    <small>Điểm đón</small>
                    <strong>{pickup?.name || "Chưa chọn điểm đón"}</strong>
                  </div>
                </div>
                <div>
                  <span className="route-dot destination" />
                  <div>
                    <small>Điểm đến</small>
                    <strong>{destination?.name || "Chưa chọn điểm đến"}</strong>
                  </div>
                </div>
              </div>
              {quote ? (
                <>
                  <div className="summary-metrics">
                    <span>
                      <Route size={17} />
                      {quote.route.distanceKm.toFixed(1)} km / chiều
                    </span>
                    <span>
                      <Clock size={17} />~{quote.route.durationMinutes} phút
                    </span>
                  </div>
                  <RouteMap
                    pickup={pickup}
                    destination={destination}
                    geometry={quote.route.geometry}
                    sample={quote.route.source === "sample"}
                  />
                  {quote.route.source === "sample" ? (
                    <p className="sample-route-note">
                      Bản đồ tuyến mẫu: đường nối chỉ minh họa, số km là dữ liệu
                      tham khảo.
                    </p>
                  ) : (
                    <p className="input-hint">
                      Thời gian tham khảo, chưa tính tình hình giao thông thực
                      tế.
                    </p>
                  )}
                </>
              ) : (
                <div className="summary-illustration">
                  <Route size={58} strokeWidth={1} />
                  <p>
                    Chọn hành trình để xem
                    <br />
                    quãng đường và giá dự kiến.
                  </p>
                </div>
              )}
              <div className="summary-price">
                <span>Giá dự kiến {roundTrip ? "khứ hồi" : "một chiều"}</span>
                <strong>
                  {quote
                    ? money(
                        calculateFare(
                          vehicleId,
                          quote.route.distanceKm,
                          roundTrip,
                        ).total,
                      )
                    : "—"}
                </strong>
              </div>
              <p className="input-hint">
                {ESTIMATED_FARE_NOTE} {FARE_EXCLUSIONS}
              </p>
              <div className="summary-guarantee">
                <ShieldCheck size={17} />
                Không yêu cầu thanh toán trực tuyến
              </div>
            </div>
            <p className="sidebar-note">
              <MapPin size={16} />
              Đội xe Như Quỳnh Hưng Yên
              <br />
              Phục vụ đặt xe 5–7 chỗ theo lịch.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
