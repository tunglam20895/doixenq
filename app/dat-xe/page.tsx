import { Suspense } from "react";
import Booking from "@/components/Booking";
export const metadata = {
  title: "Đặt taxi Như Quỳnh, Văn Lâm, Phố Nối — xe 5–7 chỗ",
  description:
    "Đội xe Như Quỳnh đón tại Như Quỳnh, Văn Lâm, Phố Nối và lân cận: chọn điểm đón, điểm đến, giờ đi và xe 5–7 chỗ. Xem giá dự kiến, đặt một chiều hoặc khứ hồi.",
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
