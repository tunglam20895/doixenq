import type { Driver } from "./admin/types";
import type { Booking } from "./db";
import { money } from "./data";

type RevenueBooking = Pick<
  Booking,
  "id" | "driverId" | "status" | "total" | "actualTotal"
>;
type Candidate = Pick<
  Driver,
  "id" | "name" | "phone" | "active" | "vehicle_ids" | "created_at"
>;
type Sources = {
  drivers: () => Promise<Candidate[]>;
  completed: (
    offset: number,
  ) => Promise<{ items: RevenueBooking[]; total: number }>;
};

// Only used in the private dispatch notification; never assigns a driver.
export async function driverPriorityLines(
  booking: Pick<Booking, "driverId" | "vehicleId">,
  sources: Sources,
): Promise<string[]> {
  if (booking.driverId !== "auto") return [];
  try {
    const drivers = (await sources.drivers()).filter(
      (d) => d.active && d.vehicle_ids.includes(booking.vehicleId),
    );
    if (!drivers.length)
      return [
        "Gợi ý điều phối: chưa có tài xế đang hoạt động phù hợp dòng xe.",
      ];
    const revenue = new Map(drivers.map((d) => [d.id, 0]));
    const seen = new Set<string>();
    let offset = 0;
    while (true) {
      const page = await sources.completed(offset);
      if (!page.items.length && offset < page.total)
        throw new Error("INCOMPLETE_REVENUE");
      for (const trip of page.items) {
        if (seen.has(trip.id)) continue;
        seen.add(trip.id);
        if (trip.status !== "completed" || !revenue.has(trip.driverId))
          continue;
        const amount = trip.actualTotal ?? trip.total;
        if (!Number.isFinite(amount) || amount < 0)
          throw new Error("INVALID_REVENUE");
        revenue.set(trip.driverId, revenue.get(trip.driverId)! + amount);
      }
      offset += page.items.length;
      if (offset >= page.total) break;
    }
    drivers.sort(
      (a, b) =>
        revenue.get(a.id)! - revenue.get(b.id)! ||
        a.created_at.localeCompare(b.created_at) ||
        a.id.localeCompare(b.id),
    );
    return [
      "GỢI Ý PHÂN CÔNG — doanh thu hoàn thành toàn bộ thời gian, thấp → cao:",
      ...drivers
        .slice(0, 3)
        .map(
          (driver, index) =>
            `${index + 1}. ${driver.name} · ${driver.phone} · ${money(revenue.get(driver.id)!)}`,
        ),
      "Chỉ là thứ tự gợi ý; vui lòng kiểm tra lịch tài xế trước khi phân công.",
    ];
  } catch {
    // A revenue lookup failure must not prevent the booking alert being sent.
    return [
      "Gợi ý điều phối: chưa tải được doanh thu tài xế, vui lòng kiểm tra trên admin.",
    ];
  }
}
