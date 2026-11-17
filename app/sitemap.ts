import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/dat-xe", "/bang-gia", "/chinh-sach"].map((path) => ({
    url: new URL(path, siteUrl).href,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
