import { type Booking, updateBooking } from "./db";
import { VEHICLES, DRIVERS, money, tripDate } from "./data";
import { backend } from "./supabase/backend";
import type { Driver, AdminBooking } from "./admin/types";
import { driverPriorityLines } from "./telegram-driver-priority";

export async function notify(b: Booking) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    b.notification = "not_configured";
    await updateBooking(b);
    return;
  }
  const v = VEHICLES.find((x) => x.id === b.vehicleId);
  const d = DRIVERS.find((x) => x.id === b.driverId);
  const suggestions = await driverPriorityLines(b, {
    drivers: () => backend<Driver[]>("drivers"),
    completed: (offset) =>
      backend<{ items: AdminBooking[]; total: number }>("bookings", {
        status: "completed",
        offset,
        limit: 100,
      }),
  });
  const text = [
    `CHUYẾN XE ĐÃ XÁC NHẬN — ${b.id}`,
    `Đội xe Như Quỳnh Hưng Yên`,
    `Khách: ${b.customer} · ${b.phone}`,
    `Đón: ${tripDate(b.departure)}`,
    `Từ: ${b.pickup.name} — ${b.pickup.address}`,
    `Đến: ${b.destination.name} — ${b.destination.address}`,
    `Xe mong muốn: ${v?.name}`,
    `Tài xế mong muốn: ${b.driverName || d?.name || "Đội xe sắp xếp"}`,
    ...suggestions,
    `Số khách: ${b.passengers}`,
    `Hành trình: ${b.distanceKm} km một chiều · ${b.roundTrip ? "Khứ hồi" : "Một chiều"}`,
    b.returnAt ? `Về: ${tripDate(b.returnAt)}` : "",
    `Giá dự kiến: ${money(b.total)} · chưa gồm cầu đường, bãi đỗ, chờ`,
    `Ghi chú: ${b.note || "Không có"}`,
    `Đã nhận lịch đặt xe. Phân công tài xế liên hệ xác nhận hành trình và thống nhất giá chính thức với khách trước chuyến.`,
  ]
    .filter(Boolean)
    .join("\n");
  b.attempts++;
  try {
    const r = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Mở điểm đón",
                  url: `https://www.google.com/maps/search/?api=1&query=${b.pickup.lat},${b.pickup.lng}`,
                },
              ],
            ],
          },
        }),
        signal: AbortSignal.timeout(7000),
      },
    );
    const result = await r.json();
    b.notification = result.ok ? "sent" : "pending";
  } catch {
    b.notification = "pending";
  }
  await updateBooking(b);
}
