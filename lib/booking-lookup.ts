import type { Booking } from "./db";
export function phoneSuffix(value: string) {
  const digits = value.replace(/[\s().+-]/g, "");
  if (!/^\d{9,15}$/.test(digits)) return null;
  return digits.slice(-9);
}
export type PublicBooking = Omit<
  Booking,
  "token" | "requestId" | "notification" | "attempts"
>;
export function publicBooking(b: Booking): PublicBooking {
  const { token, requestId, notification, attempts, ...safe } = b;
  void token;
  void requestId;
  void notification;
  void attempts;
  return safe;
}
export function groupBookings<T extends Pick<Booking, "status" | "departure">>(
  bookings: T[],
) {
  return {
    upcoming: bookings
      .filter((b) => b.status === "requested" || b.status === "confirmed")
      .sort((a, b) => Date.parse(a.departure) - Date.parse(b.departure)),
    past: bookings
      .filter((b) => b.status === "completed" || b.status === "cancelled")
      .sort((a, b) => Date.parse(b.departure) - Date.parse(a.departure)),
  };
}
