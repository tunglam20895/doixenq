import { Suspense } from "react";
import Booking from "@/components/Booking";
export const metadata = { title: "Đặt chuyến xe" };
export default function Page() {
  return (
    <Suspense
      fallback={
        <main id="main" className="loading-page">
          Đang mở trang đặt xe…
        </main>
      }
    >
      <Booking />
    </Suspense>
  );
}
