import type { MetadataRoute } from "next";
import { taxiAreaLinks } from "@/lib/service-areas";
import { siteUrl } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "/",
    "/dat-xe",
    "/bang-gia",
    "/dich-vu",
    "/xe-san-bay-noi-bai",
    "/chinh-sach",
    ...taxiAreaLinks.map((area) => area.href),
  ].map((path) => ({
    url: new URL(path, siteUrl).href,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
