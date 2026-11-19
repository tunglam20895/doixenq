import type { Metadata } from "next";
import Link from "next/link";
import { VEHICLES, money } from "@/lib/data";
import { calculateFare } from "@/lib/pricing";
import { CONTACT } from "@/lib/contact";
import { ESTIMATED_FARE_NOTE, FARE_EXCLUSIONS } from "@/lib/fare-copy";
import { siteUrl } from "@/lib/site";
import { taxiAreas, type TaxiArea } from "@/lib/taxi-areas";

export function taxiAreaMetadata(area: TaxiArea): Metadata {
  return {
    title:
      area.slug === "taxi-pho-noi"
        ? area.title
        : `Taxi ${area.name} 5–7 chỗ — đặt xe & giá dự kiến`,
    description: area.description,
    alternates: { canonical: `/${area.slug}` },
    openGraph: {
      title: area.title,
      description: area.description,
      url: `/${area.slug}`,
      siteName: "Đội xe Như Quỳnh",
      locale: "vi_VN",
      type: "website",
    },
  };
}

export default function TaxiAreaPage({ area }: { area: TaxiArea }) {
  return (
    <main id="main" className="content-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: `Taxi ${area.name} — Đội xe Như Quỳnh`,
            serviceType: "Đặt xe taxi 5–7 chỗ",
            url: new URL(`/${area.slug}`, siteUrl).href,
            areaServed: { "@type": "Place", name: area.name },
            provider: {
              "@type": "Organization",
              name: "Đội xe Như Quỳnh",
              url: siteUrl.href,
              telephone: "+84977823111",
            },
          }).replace(/</g, "\\u003c"),
        }}
      />
      <div className="wrap policy-content">
        <nav aria-label="Đường dẫn trang">
          <Link href="/">Trang chủ</Link>
          {" / "}
          <Link href="/dich-vu">Khu vực phục vụ</Link>
          {" / "}Taxi {area.name}
        </nav>
        <span className="eyebrow">ĐỘI XE NHƯ QUỲNH · XE 5–7 CHỖ</span>
        <h1>{area.title}</h1>
        <p className="page-lead">{area.intro}</p>
        <p>
          <a href={CONTACT.telephone}>
            Gọi đặt taxi {area.name}: {CONTACT.phone}
          </a>
          {" · "}
          <a href={CONTACT.zalo}>Trao đổi qua Zalo</a>
        </p>
        <Link href="/dat-xe" className="btn btn-primary">
          Chọn địa chỉ đón & xem giá dự kiến
        </Link>
        <nav aria-label="Thông tin đặt xe">
          <ul>
            <li>
              <a href="#chon-xe">Chọn dòng xe và sức chứa</a>
            </li>
            <li>
              <a href="#gia-du-kien">Xem giá dự kiến theo km</a>
            </li>
            <li>
              <a href="#hoi-dap">Câu hỏi trước khi đặt</a>
            </li>
          </ul>
        </nav>
        {area.sections.map((section) => (
          <article key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </article>
        ))}
        <article id="chon-xe">
          <h2>Chọn xe khi đặt taxi {area.name}</h2>
          <p>
            So sánh số khách và hành lý trước khi chọn xe. Số chỗ bao gồm tài
            xế; sức chứa hành lý là thông tin tham khảo của dòng xe, cần trao
            đổi thêm nếu mang vali lớn hoặc đồ cồng kềnh.
          </p>
          <div className="price-table-wrap">
            <table className="price-table">
              <caption>Xe 5–7 chỗ nhận yêu cầu đặt tại {area.name}</caption>
              <thead>
                <tr>
                  <th scope="col">Dòng xe</th>
                  <th scope="col">Khách tối đa</th>
                  <th scope="col">Hành lý tham khảo</th>
                  <th scope="col">Đặt xe</th>
                </tr>
              </thead>
              <tbody>
                {VEHICLES.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <th scope="row">
                      {vehicle.name}
                      <span>
                        {vehicle.seats} chỗ ·{" "}
                        {vehicle.electric ? "Xe điện" : "Xe xăng"}
                      </span>
                    </th>
                    <td>{vehicle.passengers} khách</td>
                    <td>{vehicle.luggage} kiện</td>
                    <td>
                      <Link href={`/dat-xe?vehicle=${vehicle.id}`}>
                        Chọn {vehicle.name}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
        <article id="gia-du-kien">
          <h2>Giá taxi {area.name} được tính thế nào?</h2>
          <p>
            {ESTIMATED_FARE_NOTE} {FARE_EXCLUSIONS}
          </p>
          <p>
            Bảng dưới minh họa cước một chiều theo số km, không phải khoảng cách
            hay giá trọn gói của một tuyến cụ thể tại {area.name}. Hành trình
            thực tế cần chọn đúng địa chỉ đi và đến.
          </p>
          <div className="price-table-wrap">
            <table className="price-table">
              <caption>Giá dự kiến một chiều theo quãng đường — VNĐ</caption>
              <thead>
                <tr>
                  <th scope="col">Dòng xe</th>
                  {[10, 30, 50].map((km) => (
                    <th scope="col" key={km}>
                      {km} km
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {VEHICLES.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <th scope="row">{vehicle.name}</th>
                    {[10, 30, 50].map((km) => (
                      <td key={km}>
                        {money(calculateFare(vehicle.id, km).total)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link href="/bang-gia">
            Xem bảng cước tham khảo và cách tính theo km
          </Link>
        </article>
        <article id="hoi-dap">
          <h2>{area.question}</h2>
          <p>{area.answer}</p>
        </article>
        <article>
          <h2>Tiếp tục đặt chuyến xe của bạn</h2>
          <p>
            Đặt trực tiếp trên website bằng họ tên và số điện thoại. Chọn địa
            chỉ đón cụ thể, điểm đến, ngày giờ và dòng xe mong muốn; sau khi gửi
            lịch, tài xế liên hệ xác nhận. Nếu đã đặt, bạn có thể dùng đường dẫn
            tra cứu riêng để xem cập nhật.
          </p>
          <p>
            <Link href="/dat-xe">Đặt xe online</Link>
            {" · "}
            <Link href="/xe-san-bay-noi-bai">Hướng dẫn đặt xe đi Nội Bài</Link>
            {" · "}
            <Link href="/chinh-sach">Chính sách đặt xe</Link>
          </p>
        </article>
        <nav aria-label="Các khu vực phục vụ khác">
          <h2>Khám phá các khu vực phục vụ khác</h2>
          <ul>
            {taxiAreas
              .filter((other) => other.slug !== area.slug)
              .map((other) => (
                <li key={other.slug}>
                  <Link href={`/${other.slug}`}>Taxi {other.name}</Link>
                </li>
              ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
