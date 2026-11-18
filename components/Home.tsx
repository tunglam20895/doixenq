"use client";
import { serviceAreaText } from "@/lib/service-areas";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Users,
  Luggage,
  Zap,
  ShieldCheck,
  MapPin,
  Check,
  Plane,
  Route,
  Clock,
  ChevronRight,
} from "lucide-react";
import {
  VEHICLES,
  PLACES,
  POPULAR_ROUTES,
  money,
  type Place,
} from "@/lib/data";
import PlaceInput from "./PlaceInput";
import type { PublicDriver } from "@/lib/admin/types";
const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false,
});
export default function Home({ drivers }: { drivers: PublicDriver[] }) {
  const [mapTarget, setMapTarget] = useState<"pickup" | "destination" | null>(
    null,
  );
  const [filter, setFilter] = useState("all");
  const [pickup, setPickup] = useState<Place | null>(PLACES[0]);
  const [destination, setDestination] = useState<Place | null>(null);
  const vehicles = VEHICLES.filter(
    (v) =>
      filter === "all" ||
      (filter === "7" && v.seats === 7) ||
      (filter === "5" && v.seats === 5) ||
      (filter === "electric" && v.electric),
  );
  const bookingHref = `/dat-xe?from=${encodeURIComponent(pickup?.id || "nhu-quynh")}${pickup && !PLACES.some((p) => p.id === pickup.id) ? "&pickup=" + encodeURIComponent(JSON.stringify(pickup)) : ""}${destination ? "&to=" + encodeURIComponent(destination.id) + (!PLACES.some((p) => p.id === destination.id) ? "&destination=" + encodeURIComponent(JSON.stringify(destination)) : "") : ""}`;
  return (
    <main id="main">
      {mapTarget ? (
        <LocationPicker
          which={mapTarget}
          value={mapTarget === "pickup" ? pickup : destination}
          onClose={() => setMapTarget(null)}
          onConfirm={(p) => {
            if (mapTarget === "pickup") setPickup(p);
            else setDestination(p);
            setMapTarget(null);
          }}
        />
      ) : null}
      <section className="hero" data-enter aria-labelledby="hero-title">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="little-line" />
              XE 5–7 CHỖ · HƯNG YÊN
            </span>
            <h1 id="hero-title">
              Đội xe Như Quỳnh,
              <br />
              đi cùng <span>bạn.</span>
            </h1>
            <p className="hero-lead">
              Đón khách tại {serviceAreaText} và khu vực lân cận. Xe 5–7 chỗ đi
              Nội Bài, Hà Nội và liên tỉnh.
              <br className="desktop-only" /> Chọn chiếc xe bạn thích. Hẹn giờ,
              mình đón.
            </p>
            <div className="hero-links">
              <a className="btn btn-primary" href="#dat-chuyen">
                Xem giá & đặt xe <ArrowUpRight size={19} />
              </a>
              <a className="text-link" href="#doi-xe">
                Khám phá đội xe <ArrowRight size={17} />
              </a>
            </div>
            <div className="hero-promises">
              <span>
                <Check size={16} />
                Biết giá trước chuyến
              </span>
              <span>
                <Check size={16} />
                Chọn xe & tài xế
              </span>
            </div>
            <div className="hero-coordinate">
              <MapPin size={14} />
              <span>Nhận đón tại nhiều khu vực ở Hưng Yên</span>
            </div>
          </div>
          <div className="hero-showcase" data-enter-media>
            <div className="showcase-top">
              <span>CHUYẾN ĐI XANH</span>
              <span className="mini-pill">
                <Zap size={12} />
                100% ĐIỆN
              </span>
            </div>
            <div className="showcase-word" aria-hidden="true">
              GREEN
            </div>
            <img
              className="hero-car"
              src="/images/limo.webp"
              alt="VinFast Limo Green màu trắng, dòng xe điện 7 chỗ"
              width="665"
              height="348"
              fetchPriority="high"
              data-source="manufacturer"
              data-subject="VinFast Limo Green"
            />
            <div className="showcase-bottom">
              <div>
                <small>KHÔNG GIAN CHO CẢ GIA ĐÌNH</small>
                <strong>
                  Limo Green<span>7 chỗ · Tối đa 6 hành khách</span>
                </strong>
              </div>
            </div>
            <span className="showcase-index">01 / 06 DÒNG XE</span>
          </div>
        </div>
        <div className="wrap quick-book-wrap" id="dat-chuyen">
          <div className="quick-book">
            <div className="quick-book-title">
              <span className="small-icon">
                <Route size={20} />
              </span>
              <div>
                <strong>Chuyến tới, bạn đi đâu?</strong>
                <small>Xem hành trình và giá dự kiến</small>
              </div>
            </div>
            <PlaceInput
              label="Điểm đón"
              value={pickup}
              onChange={setPickup}
              onMap={() => setMapTarget("pickup")}
              compact
            />
            <span className="quick-divider" />
            <PlaceInput
              label="Điểm đến"
              value={destination}
              onChange={setDestination}
              onMap={() => setMapTarget("destination")}
              compact
            />
            <Link className="btn btn-primary" href={bookingHref}>
              Tìm chuyến xe <ArrowRight size={19} />
            </Link>
          </div>
          <p className="demo-disclosure">
            Bản trải nghiệm với bảng giá mẫu. Yêu cầu đặt xe cần được đội xe xác
            nhận.
          </p>
        </div>
      </section>
      <section className="section fleet-section" id="doi-xe">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ĐỘI XE CỦA BẠN</span>
              <h2>Đúng xe, đúng chuyến đi.</h2>
            </div>
            <p>
              Đi một mình hay đi cùng cả nhà,
              <br />
              luôn có lựa chọn phù hợp.
            </p>
          </div>
          <div className="fleet-toolbar">
            <div className="filter-tabs" aria-label="Lọc dòng xe">
              {[
                ["all", "Tất cả dòng xe"],
                ["7", "Xe 7 chỗ"],
                ["5", "Xe 5 chỗ"],
                ["electric", "Xe điện"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  className={filter === key ? "active" : ""}
                  aria-pressed={filter === key}
                  onClick={() => setFilter(key)}
                >
                  {key === "electric" ? <Zap size={15} /> : null}
                  {label}
                </button>
              ))}
            </div>
            <span className="result-count">{vehicles.length} dòng xe</span>
          </div>
          <div className="fleet-grid">
            {vehicles.map((v) => (
              <article className="vehicle-card card" key={v.id}>
                <div
                  className={"vehicle-image " + (v.electric ? "electric" : "")}
                >
                  <span className="vehicle-category">{v.seats} CHỖ</span>
                  {v.electric ? (
                    <span className="electric-label">
                      <Zap size={12} />
                      Xe điện
                    </span>
                  ) : null}
                  <Link
                    href={`/dat-xe?vehicle=${v.id}`}
                    className="m-zoom"
                    aria-label={"Chọn xe " + v.name}
                  >
                    <img
                      src={v.image}
                      alt={v.name}
                      width="665"
                      height="348"
                      loading="lazy"
                      data-source="manufacturer"
                      data-subject={v.name}
                    />
                  </Link>
                </div>
                <div className="vehicle-info">
                  <p className="vehicle-subtitle">{v.category}</p>
                  <h3>{v.name}</h3>
                  <div className="vehicle-specs">
                    <span>
                      <Users size={16} />
                      {v.passengers} khách
                    </span>
                    <span>
                      <Luggage size={16} />
                      {v.luggage} vali gợi ý
                    </span>
                    <span>Điều hòa</span>
                  </div>
                  <div className="vehicle-bottom">
                    <div>
                      <small>Từ km thứ 31</small>
                      <strong>
                        {money(v.longKm)}
                        <span>/km</span>
                      </strong>
                    </div>
                    <Link
                      href={`/dat-xe?vehicle=${v.id}`}
                      className="round-arrow"
                      aria-label={"Đặt " + v.name}
                    >
                      <ArrowUpRight size={23} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <p className="section-note">
            Số chỗ bao gồm tài xế. Sức chứa hành lý tùy kích thước và số người
            thực tế.{" "}
            <Link href="/bang-gia">
              Xem cách tính cước <ArrowUpRight size={13} />
            </Link>
          </p>
        </div>
      </section>
      <section className="section routes-section" id="hanh-trinh">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <span className="eyebrow">NHỮNG CUNG ĐƯỜNG QUEN</span>
              <h2>
                Bạn hẹn điểm đến.
                <br />
                Mình lo chuyến đi.
              </h2>
            </div>
            <Link href="/dat-xe" className="text-link">
              Chọn hành trình riêng <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="route-grid">
            {POPULAR_ROUTES.map((r, i) => (
              <Link
                href={`/dat-xe?from=${r.from}&to=${r.to}`}
                key={r.to}
                className={`route-card route-${r.kind} card`}
              >
                <div className="route-art" aria-hidden="true">
                  {i === 0 ? (
                    <Plane size={110} strokeWidth={0.8} />
                  ) : i === 1 ? (
                    <svg viewBox="0 0 300 160">
                      <path
                        d="M35 133h230M80 130V97h140v33M109 95V70h82v25M101 70l49-26 49 26M135 44V23h30v21M122 130v-21h16v21m24 0v-21h16v21M70 98l80-10 80 10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <circle
                        cx="150"
                        cy="62"
                        r="7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 300 160">
                      <path
                        d="M10 125q30-18 60 0t60 0t60 0t60 0t60 0M10 142q30-18 60 0t60 0t60 0t60 0M55 105h190l-22 20H78zM110 102V55h83v47M103 55l50-30 48 30M125 65v25m20-25v25m20-25v25m20-25v25"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                  <span className="route-number">0{i + 1}</span>
                </div>
                <div className="route-card-body">
                  <span className="route-origin">TỪ NHƯ QUỲNH</span>
                  <h3>{r.label}</h3>
                  <div>
                    <span>{r.detail}</span>
                    <span className="round-arrow">
                      <ArrowUpRight size={21} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <p className="section-note">
            Điểm đến khác? Chọn địa chỉ hoặc ghim trên bản đồ ở trang đặt xe.{" "}
            <Link href="/dich-vu">
              Xem khu vực phục vụ và dịch vụ taxi Hưng Yên
            </Link>
            .
          </p>
        </div>
      </section>
      <section className="section drivers-section" id="tai-xe">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <span className="eyebrow">NGƯỜI CẦM LÁI</span>
              <h2>
                Biết người đón mình,
                <br />
                trước khi lên xe.
              </h2>
            </div>
            <p>
              Bạn có thể chọn tài xế mong muốn.
              <br />
              Đội xe sẽ kiểm tra lịch và xác nhận lại.
            </p>
          </div>
          {!drivers.length ? (
            <p className="driver-empty-note">
              Đội xe đang cập nhật hồ sơ tài xế. Bạn vẫn có thể đặt chuyến; đội
              xe sẽ sắp xếp tài xế phù hợp và xác nhận với bạn.
            </p>
          ) : null}
          <div className="drivers-grid">
            {drivers.map((d, i) => (
              <article className="driver-card" key={d.id}>
                <div className="driver-header">
                  <span
                    className="driver-avatar"
                    style={{ background: d.color }}
                  >
                    {d.avatarUrl ? (
                      <img
                        src={d.avatarUrl}
                        alt={d.name}
                        width={67}
                        height={67}
                        loading="lazy"
                      />
                    ) : (
                      d.initials
                    )}
                  </span>
                  <span className="driver-badge">
                    <ShieldCheck size={15} />
                    Hồ sơ tài xế
                  </span>
                </div>
                <h3>{d.name}</h3>
                <p>{d.intro}</p>
                <span className="driver-area">
                  <MapPin size={14} />
                  {d.area}
                </span>
                <div className="driver-models">
                  {d.vehicleIds.map((id) => (
                    <span key={id}>
                      {VEHICLES.find((v) => v.id === id)?.name.replace(
                        "VinFast ",
                        "",
                      )}
                    </span>
                  ))}
                </div>
                <Link
                  className="text-link"
                  href={`/dat-xe?driver=${d.id}&vehicle=${d.vehicleIds[0]}`}
                >
                  Chọn tài xế <ArrowUpRight size={17} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section
        className="section process-section"
        data-moment="pinned-chapters"
      >
        <div className="wrap mo-pc__grid">
          <div className="mo-pc__text">
            <span className="eyebrow">ĐẶT XE THEO CÁCH CỦA BẠN</span>
            <h2>
              Một lịch hẹn.
              <br />
              Một chuyến xe.
            </h2>
            <ol className="mo-pc__steps">
              {[
                {
                  title: "Bạn chọn hành trình",
                  text: "Chọn điểm đón, điểm đến và thời gian. Bản đồ tính quãng đường để bạn xem giá dự kiến.",
                  image: "vf5",
                },
                {
                  title: "Bạn chọn xe và người lái",
                  text: "Xem dòng xe, số chỗ và tài xế mong muốn. Gửi thông tin để đội xe kiểm tra lịch.",
                  image: "ertiga-black",
                },
                {
                  title: "Đội xe xác nhận cùng bạn",
                  text: "Đội xe liên hệ chốt giờ, xe và giá trước chuyến đi. Tra cứu chuyến bằng số điện thoại bất cứ lúc nào.",
                  image: "limo",
                },
              ].map((s, i) => (
                <li className="mo-pc__step" key={s.image}>
                  <span className="step-counter">0{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <figure className="mo-pc__visual">
                    <img
                      src={"/images/" + s.image + ".webp"}
                      alt={
                        VEHICLES.find(
                          (v) => v.id === s.image.replace("-black", ""),
                        )?.name
                      }
                      loading="lazy"
                      width="665"
                      height="348"
                    />
                  </figure>
                </li>
              ))}
            </ol>
          </div>
          <div className="mo-pc__visuals frame" aria-hidden="true" />
        </div>
      </section>
      <section className="section faq-section">
        <div className="wrap faq-grid">
          <div>
            <span className="eyebrow">TRƯỚC KHI ĐẶT XE</span>
            <h2>
              Bạn hỏi,
              <br />
              mình trả lời.
            </h2>
            <Link href="/chinh-sach" className="text-link">
              Xem chính sách đặt xe <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="faq-list">
            {[
              [
                "Giá trên website đã là giá cuối cùng chưa?",
                "Đây là giá dự kiến theo hành trình và bảng giá mẫu. Phí cầu đường, bãi đỗ, chờ và thay đổi hành trình chưa bao gồm. Đội xe sẽ liên hệ xác nhận giá trước chuyến.",
              ],
              [
                "Tôi có được chọn đúng xe và tài xế không?",
                "Bạn có thể gửi lựa chọn mong muốn. Đội xe kiểm tra lịch thực tế rồi xác nhận; gửi yêu cầu chưa đồng nghĩa xe đã được giữ chỗ.",
              ],
              [
                "Tôi cần cài ứng dụng hay tạo tài khoản không?",
                "Bạn đặt trực tiếp trên website bằng họ tên và số điện thoại. Sau khi đặt, tra cứu bằng số điện thoại hoặc đường dẫn tra cứu riêng.",
              ],
              [
                "Tôi có thể đặt xe khứ hồi không?",
                "Có. Chọn “Khứ hồi” và giờ đón về ở trang đặt xe. Giá dự kiến tính cả hai lượt; thời gian chờ và chi phí phát sinh sẽ được trao đổi riêng.",
              ],
            ].map(([q, a]) => (
              <div className="faq-item" key={q}>
                <h3>{q}</h3>
                <p>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
