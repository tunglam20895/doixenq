import { siteUrl } from "@/lib/site";
import type { Metadata } from "next";
import Script from "next/script";
import { SiteFrame } from "@/components/Shell";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Taxi Như Quỳnh Hưng Yên | Đặt xe 5–7 chỗ, xe sân bay",
    template: "%s | Đội xe Như Quỳnh",
  },
  description:
    "Taxi Như Quỳnh, Văn Lâm, Hưng Yên. Đặt xe 5–7 chỗ đi Nội Bài, Hà Nội và liên tỉnh, xem giá dự kiến. Gọi hoặc Zalo 0977823111.",
  openGraph: {
    title: "Đội xe Như Quỳnh Hưng Yên",
    description:
      "Từ Như Quỳnh, đi cùng bạn. Xe 5–7 chỗ, đặt lịch ngay trên điện thoại.",
    locale: "vi_VN",
    type: "website",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      data-type="service"
      data-motion="on"
      data-radius="soft"
    >
      <head>
        <meta name="page-type" content="service" />
        <meta name="site-kind" content="other" />
        <meta name="theme-color" content="#173e35" />
        <link rel="stylesheet" href="/fonts/fonts.css" />
        <link rel="stylesheet" href="/taste/motion/motion.css" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('m-enter');setTimeout(()=>document.documentElement.classList.add('m-enter-done'),700)",
          }}
        />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Đến nội dung chính
        </a>
        <SiteFrame>{children}</SiteFrame>
        <Script
          src="/taste/motion/motion.js"
          type="module"
          strategy="afterInteractive"
        />
        <Script
          src="/taste/moments/moments.js"
          type="module"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
