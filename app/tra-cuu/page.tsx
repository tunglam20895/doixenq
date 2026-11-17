import { Suspense } from "react";
import Lookup from "@/components/Lookup";
export const metadata = {
  title: "Tra cứu chuyến xe",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <Suspense
      fallback={
        <main id="main" className="loading-page">
          Đang mở tra cứu…
        </main>
      }
    >
      <Lookup />
    </Suspense>
  );
}
