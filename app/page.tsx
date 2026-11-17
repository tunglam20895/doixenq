import { siteUrl } from "@/lib/site";
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
            name: "Đội xe Như Quỳnh Hưng Yên",
            telephone: "+84977823111",
            url: siteUrl.href,
            areaServed: [
              "Như Quỳnh",
              "Văn Lâm",
              "Hưng Yên",
              "Hà Nội",
              "Sân bay Nội Bài",
            ],
            provider: {
              "@type": "Organization",
              name: "Đội xe Như Quỳnh Hưng Yên",
              telephone: "+84977823111",
            },
          }).replace(/</g, "\u003c"),
        }}
      />
      <Home drivers={drivers} />
    </>
  );
}
