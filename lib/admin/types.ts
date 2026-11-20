import type { Booking } from "@/lib/db";
export type Driver = {
  id: string;
  name: string;
  phone: string;
  intro: string;
  area: string;
  vehicle_ids: string[];
  plate: string;
  note: string;
  active: boolean;
  published: boolean;
  hasAvatar: boolean;
  created_at: string;
  updated_at: string;
};
export type Customer = {
  id: string;
  name: string;
  phone: string;
  note: string;
  bookings: number;
  completed: number;
  cancelled: number;
  total_spent: number;
  last_trip: string | null;
  created_at: string;
};
export type AdminBooking = Omit<
  Booking,
  "token" | "requestId" | "notification" | "attempts"
> & {
  customerId: string;
  actualTotal: number | null;
  version: number;
  driverName: string | null;
  completedAt: string | null;
};
export type Dashboard = {
  customers: number;
  drivers: number;
  booked: number;
  completed: number;
  cancelled: number;
  revenue: number;
  today: number;
  recent: AdminBooking[];
  chart: { date: string; revenue: number }[];
};
export type BookingEvent = {
  id: number;
  booking_id: string;
  actor: string;
  event: string;
  detail: { from?: string; to?: string; actualTotal?: number; reason?: string };
  created_at: string;
};
export const STATUS_LABELS: Record<string, string> = {
  requested: "Đã đặt",
  confirmed: "Đã đặt",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};
