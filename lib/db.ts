import { mkdirSync } from "node:fs";
import path from "node:path";
import postgres from "postgres";
import { backend, configured } from "./supabase/backend";
export type Booking = {
  id: string;
  token: string;
  requestId: string;
  customer: string;
  phone: string;
  note: string;
  vehicleId: string;
  driverId: string;
  passengers: number;
  departure: string;
  returnAt?: string;
  roundTrip: boolean;
  pickup: { name: string; address: string; lat: number; lng: number };
  destination: { name: string; address: string; lat: number; lng: number };
  distanceKm: number;
  durationMinutes: number;
  total: number;
  routeSource: string;
  status: "requested" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
  notification: "pending" | "sent" | "not_configured";
  attempts: number;
  driverName?: string | null;
  driverAssigned?: boolean;
  driverPhone?: string | null;
  actualTotal?: number | null;
  source?: string;
};
let sql: ReturnType<typeof postgres> | undefined;
let sqlite: import("node:sqlite").DatabaseSync | undefined;
let ready: Promise<void> | undefined;
async function query(
  statement: string,
  args: unknown[] = [],
): Promise<Record<string, unknown>[]> {
  if (process.env.DATABASE_URL) {
    sql ??= postgres(process.env.DATABASE_URL, {
      max: 3,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });
    let n = 0;
    return (await sql.unsafe(
      statement.replace(/\?/g, () => `$${++n}`),
      args as never[],
    )) as unknown as Record<string, unknown>[];
  }
  if (process.env.VERCEL) throw new Error("DATABASE_NOT_CONFIGURED");
  if (!sqlite) {
    const { DatabaseSync } = await import("node:sqlite");
    mkdirSync(path.join(process.cwd(), ".data"), { recursive: true });
    sqlite = new DatabaseSync(path.join(process.cwd(), ".data", "taxi.sqlite"));
    sqlite.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;");
  }
  const stmt = sqlite.prepare(statement);
  if (/^\s*(SELECT|INSERT.*RETURNING)/is.test(statement))
    return stmt.all(
      ...(args as import("node:sqlite").SQLInputValue[]),
    ) as Record<string, unknown>[];
  stmt.run(...(args as import("node:sqlite").SQLInputValue[]));
  return [];
}
export function init() {
  if (configured()) return Promise.resolve();
  return (ready ??= (async () => {
    await query(
      "CREATE TABLE IF NOT EXISTS bookings (id TEXT PRIMARY KEY, token TEXT NOT NULL, request_id TEXT NOT NULL UNIQUE, payload TEXT NOT NULL)",
    );
    await query(
      "CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires BIGINT NOT NULL)",
    );
  })().catch((error) => {
    ready = undefined;
    throw error;
  }));
}
export async function saveBooking(b: Booking) {
  if (configured())
    return backend<Booking>(
      "save_booking",
      b as unknown as Record<string, unknown>,
    );
  await init();
  await query(
    "INSERT INTO bookings (id,token,request_id,payload) VALUES (?,?,?,?) ON CONFLICT(request_id) DO NOTHING",
    [b.id, b.token, b.requestId, JSON.stringify(b)],
  );
  return (await byRequest(b.requestId))!;
}
export async function byRequest(requestId: string) {
  if (configured()) return backend<Booking | null>("by_request", { requestId });
  await init();
  const rows = await query("SELECT payload FROM bookings WHERE request_id=?", [
    requestId,
  ]);
  return rows.length
    ? (JSON.parse(rows[0].payload as string) as Booking)
    : null;
}
export async function findBooking(id: string) {
  if (configured()) return backend<Booking | null>("find_booking", { id });
  await init();
  const rows = await query("SELECT payload FROM bookings WHERE id=?", [id]);
  return rows.length
    ? (JSON.parse(rows[0].payload as string) as Booking)
    : null;
}
export async function updateBooking(b: Booking) {
  if (configured()) {
    await backend("notification_update", {
      id: b.id,
      notification: b.notification,
      attempts: b.attempts,
    });
    return;
  }
  await init();
  await query("UPDATE bookings SET payload=? WHERE id=?", [
    JSON.stringify(b),
    b.id,
  ]);
}
export async function allowRequest(
  key: string,
  limit: number,
  windowMs: number,
) {
  if (configured())
    return backend<boolean>("rate_limit", {
      key,
      limit,
      window: windowMs,
      now: Date.now(),
    });
  await init();
  const now = Date.now();
  const rows = await query(
    "INSERT INTO rate_limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.expires < ? THEN 1 ELSE rate_limits.count+1 END, expires=CASE WHEN rate_limits.expires < ? THEN ? ELSE rate_limits.expires END RETURNING count",
    [key, now + windowMs, now, now, now + windowMs],
  );
  return Number(rows[0].count) <= limit;
}
export async function pendingNotifications() {
  if (configured()) return backend<Booking[]>("pending_notifications");
  await init();
  const rows = await query("SELECT payload FROM bookings");
  return rows
    .map((r) => JSON.parse(r.payload as string) as Booking)
    .filter((b) => b.notification === "pending" && b.attempts < 8)
    .slice(0, 20);
}

export async function findBookingsByPhone(suffix: string) {
  if (!/^\d{9}$/.test(suffix)) throw new Error("INVALID_PHONE");
  if (configured()) return backend<Booking[]>("lookup_phone", { suffix });
  await init();
  const expression = process.env.DATABASE_URL
    ? "RIGHT(regexp_replace(payload::jsonb->>'phone', '[^0-9]', '', 'g'), 9)"
    : "substr(replace(replace(replace(replace(replace(replace(json_extract(payload, '$.phone'), ' ', ''), '+', ''), '-', ''), '.', ''), '(', ''), ')', ''), -9)";
  const rows = await query(
    `SELECT payload FROM bookings WHERE ${expression}=?`,
    [suffix],
  );
  return rows.map((row) => JSON.parse(row.payload as string) as Booking);
}
