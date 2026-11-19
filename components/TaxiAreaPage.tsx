import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT } from "@/lib/contact";
import { ESTIMATED_FARE_NOTE, FARE_EXCLUSIONS } from "@/lib/fare-copy";
import { siteUrl } from "@/lib/site";
import { taxiAreas, type TaxiArea } from "@/lib/taxi-areas";

export function taxiAreaMetadata(area: TaxiArea): Metadata {
  return {
    title: area.title,
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
        {area.sections.map((section) => (
          <article key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </article>
        ))}
        <article>
          <h2>Giá taxi {area.name} được tính thế nào?</h2>
          <p>
            {ESTIMATED_FARE_NOTE} {FARE_EXCLUSIONS}
          </p>
          <Link href="/bang-gia">
            Xem bảng cước tham khảo và cách tính theo km
          </Link>
        </article>
        <article>
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
