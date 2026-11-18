import { siteUrl } from "@/lib/site";
import { serviceAreaText } from "@/lib/service-areas";
import type { Metadata } from "next";
import Script from "next/script";
import { SiteFrame } from "@/components/Shell";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Đội xe Như Quỳnh | Taxi Hưng Yên, Yên Mỹ, Mỹ Hào",
    template: "%s | Đội xe Như Quỳnh",
  },
  description: `Đội xe Như Quỳnh nhận đón tại ${serviceAreaText}. Xe 5–7 chỗ đi Nội Bài, Hà Nội và liên tỉnh. Gọi 0977823111.`,
  openGraph: {
    siteName: "Đội xe Như Quỳnh",
    title: "Đội xe Như Quỳnh",
    description: `Đón tại ${serviceAreaText}. Xe 5–7 chỗ đi sân bay, Hà Nội và liên tỉnh.`,
    locale: "vi_VN",
    type: "website",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/brand/favicon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/brand/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
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
