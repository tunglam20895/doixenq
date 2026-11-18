import { serviceAreaText } from "@/lib/service-areas";
import { Suspense } from "react";
import Booking from "@/components/Booking";
export const metadata = {
  title: "Đặt taxi Hưng Yên, Yên Mỹ, Mỹ Hào — xe 5–7 chỗ",
  description: `Đội xe Như Quỳnh nhận đón tại ${serviceAreaText}. Chọn điểm đến, giờ đi và xe 5–7 chỗ. Xem giá dự kiến, đặt một chiều hoặc khứ hồi.`,
  alternates: { canonical: "/dat-xe" },
};
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
