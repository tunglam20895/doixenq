import { siteUrl } from "@/lib/site";
import { serviceAreas } from "@/lib/service-areas";
import Home from "@/components/Home";
import { publicDrivers } from "@/lib/drivers";
export const metadata = { alternates: { canonical: "/" } };
export const dynamic = "force-dynamic";
export default async function Page() {
  let drivers: import("@/lib/admin/types").PublicDriver[];
  try {
    drivers = await publicDrivers();
  } catch {
    drivers = [];
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TaxiService",
            name: "Đội xe Như Quỳnh",
            "@id": new URL("/#doi-xe", siteUrl).href,
            telephone: "+84977823111",
            url: siteUrl.href,
            serviceType: [
              "Taxi Như Quỳnh",
              "Xe sân bay Nội Bài",
              "Xe đi Hà Nội",
              "Xe liên tỉnh 5–7 chỗ",
            ],
            image: new URL("/brand/nhu-quynh-logo.png", siteUrl).href,
            areaServed: [...serviceAreas, "Hà Nội", "Sân bay Nội Bài"],
            provider: {
              "@type": "Organization",
              name: "Đội xe Như Quỳnh",
              telephone: "+84977823111",
              url: siteUrl.href,
              logo: new URL("/brand/nhu-quynh-logo.png", siteUrl).href,
            },
          }).replace(/</g, "\u003c"),
        }}
      />
      <Home drivers={drivers} />
    </>
  );
}
