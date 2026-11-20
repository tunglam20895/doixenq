import {
  vietmapEnabled,
  vietmapAutocomplete,
  vietmapDetails,
  vietmapReverse,
} from "@/lib/vietmap";
import {
  phoneSuffix,
  publicBooking,
  groupBookings,
} from "@/lib/booking-lookup";
import { NextResponse, after } from "next/server";
import { randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { PLACES, VEHICLES, DRIVERS } from "@/lib/data";
import { calculateFare, validateDeparture } from "@/lib/pricing";
import { getRoute, type RouteResult } from "@/lib/routing";
import { sign, verify, equal, clientKey } from "@/lib/security";
import {
  saveBooking,
  findBooking,
  findBookingsByPhone,
  byRequest,
  allowRequest,
  pendingNotifications,
  type Booking,
} from "@/lib/db";
import { configured } from "@/lib/supabase/backend";
import { openAutocomplete, reversePlace } from "@/lib/open-places";
import { localPlaces } from "@/lib/place-search";
import { autocomplete, googlePlacesEnabled, placeDetails } from "@/lib/places";
import { notify } from "@/lib/telegram";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const place = z.object({
  id: z.string().max(1000),
  name: z.string().min(2).max(200),
  address: z.string().max(300),
  lat: z.number().min(8).max(24),
  lng: z.number().min(102).max(110),
});
const quoteSchema = z.object({
  pickup: place,
  destination: place,
  vehicleId: z.enum(["limo", "ertiga", "vf5", "vios", "vf6", "nerio"]),
  roundTrip: z.boolean(),
});
type Quote = {
  pickup: z.infer<typeof place>;
  destination: z.infer<typeof place>;
  vehicleId: string;
  roundTrip: boolean;
  route: RouteResult;
  expires: number;
};
const bookingSchema = z.object({
  quoteToken: z.string().max(40000),
  requestId: z.string().uuid(),
  customer: z.string().trim().min(2, "Vui lòng nhập họ tên.").max(80),
  phone: z
    .string()
    .regex(
      /^(0[35789][0-9]{8}|\+84[35789][0-9]{8})$/,
      "Số điện thoại Việt Nam chưa hợp lệ.",
    ),
  note: z.string().trim().max(600).default(""),
  passengers: z.number().int().min(1).max(6),
  departure: z.string().datetime(),
  returnAt: z.string().datetime().optional(),
  consent: z.literal(true),
  website: z.string().max(0).optional(),
});
const json = (value: unknown, status = 200) =>
  NextResponse.json(value, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
async function handle(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const route = (await params).path.join("/");
    if (req.method === "GET" && route === "config")
      return json({
        maps: !!(
          process.env.GOOGLE_MAPS_API_KEY &&
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY
        ),
        telegram: !!(
          process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID
        ),
        storage:
          configured() || !!process.env.DATABASE_URL || !process.env.VERCEL,
        sampleData: process.env.DEMO_DATA !== "false",
      });
    if (route === "notifications/retry" && req.method === "GET") {
      if (
        !process.env.CRON_SECRET ||
        !equal(
          req.headers.get("authorization") || "",
          `Bearer ${process.env.CRON_SECRET}`,
        )
      )
        return json({ error: "Không có quyền truy cập." }, 401);
      const pending = await pendingNotifications();
      for (const b of pending) await notify(b);
      return json({ processed: pending.length });
    }
    if (req.method === "POST") {
      const origin = req.headers.get("origin");
      if (
        origin &&
        origin !== new URL(req.url).origin &&
        origin !== process.env.APP_URL
      )
        return json({ error: "Nguồn yêu cầu không hợp lệ." }, 403);
      if (Number(req.headers.get("content-length") || 0) > 50000)
        return json({ error: "Yêu cầu quá lớn." }, 413);
    }
    if (
      !(await allowRequest(
        `${route}:${clientKey(req)}`,
        route === "bookings"
          ? 8
          : route === "lookup"
            ? 20
            : route === "places"
              ? 120
              : 60,
        route === "places" ? 60000 : 600000,
      ))
    )
      return json(
        { error: "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút." },
        429,
      );
    if (route === "places" && req.method === "GET") {
      const params = new URL(req.url).searchParams;
      const search = (params.get("q") || "").trim().slice(0, 150);
      const session = params.get("session") || "";
      const local = localPlaces(search);
      if (search.length < 2) return json({ places: local, source: "local" });
      try {
        if (vietmapEnabled())
          return json({
            places: await vietmapAutocomplete(search),
            source: "vietmap",
          });
        if (googlePlacesEnabled()) {
          if (!z.string().uuid().safeParse(session).success)
            return json({ error: "Phiên tìm kiếm không hợp lệ." }, 400);
          return json({
            places: await autocomplete(search, session),
            source: "google",
          });
        }
        const remote = await openAutocomplete(search);
        const places = [
          ...local,
          ...remote.filter((p) => !local.some((l) => l.name === p.name)),
        ].slice(0, 8);
        return json({ places, source: "osm" });
      } catch {
        return json({
          places: local,
          source: "local",
          message:
            "Tìm kiếm trực tuyến đang gián đoạn. Bạn có thể chọn địa điểm quen thuộc hoặc ghim bản đồ.",
        });
      }
    }
    if (route === "places/reverse" && req.method === "GET") {
      const params = new URL(req.url).searchParams;
      const { lat, lng } = z
        .object({
          lat: z.coerce.number().min(8).max(24),
          lng: z.coerce.number().min(102).max(110),
        })
        .parse({
          lat: params.get("lat") ?? undefined,
          lng: params.get("lng") ?? undefined,
        });
      try {
        if (vietmapEnabled())
          return json({ place: await vietmapReverse(lat, lng) });
        if (googlePlacesEnabled()) {
          const url = new URL(
            "https://maps.googleapis.com/maps/api/geocode/json",
          );
          url.searchParams.set("latlng", `${lat},${lng}`);
          url.searchParams.set("language", "vi");
          url.searchParams.set("key", process.env.GOOGLE_MAPS_API_KEY!);
          const r = await fetch(url, {
            signal: AbortSignal.timeout(5000),
            cache: "no-store",
          });
          const data = await r.json();
          const result = data.results?.[0];
          if (!r.ok || !result) throw new Error("ADDRESS_UNAVAILABLE");
          return json({
            place: {
              id: `pin-${Date.now()}`,
              name: result.formatted_address.slice(0, 200),
              address: result.formatted_address.slice(0, 300),
              lat,
              lng,
            },
          });
        }
        return json({ place: await reversePlace(lat, lng) });
      } catch {
        return json({ place: null });
      }
    }
    if (route === "places/details" && req.method === "GET") {
      const params = new URL(req.url).searchParams;
      const id = params.get("id") || "";
      if (id.startsWith("vietmap:")) {
        if (!vietmapEnabled())
          return json(
            { error: "Dịch vụ tìm địa chỉ chưa được cấu hình." },
            503,
          );
        if (id.length > 1000 || id.length < 10)
          return json({ error: "Địa điểm không hợp lệ." }, 400);
        try {
          return json({ place: await vietmapDetails(id) });
        } catch {
          return json(
            { error: "Chưa lấy được địa điểm. Vui lòng thử lại." },
            502,
          );
        }
      }
      if (!googlePlacesEnabled())
        return json({ error: "Tìm kiếm chưa được cấu hình." }, 503);
      const input = z
        .object({
          id: z
            .string()
            .min(1)
            .max(160)
            .regex(/^[a-zA-Z0-9_-]+$/),
          session: z.string().uuid(),
        })
        .parse({ id: params.get("id"), session: params.get("session") });
      try {
        return json({ place: await placeDetails(input.id, input.session) });
      } catch {
        return json(
          {
            error:
              "Chưa lấy được địa điểm. Vui lòng chọn lại hoặc ghim trên bản đồ.",
          },
          502,
        );
      }
    }
    if (route === "quote" && req.method === "POST") {
      const input = quoteSchema.parse(await req.json());
      const result = await getRoute(input.pickup, input.destination);
      const fare = calculateFare(
        input.vehicleId,
        result.distanceKm,
        input.roundTrip,
      );
      const q: Quote = {
        ...input,
        route: result,
        expires: Date.now() + 20 * 60000,
      };
      return json({
        route: result,
        fare,
        quoteToken: sign(q),
        expires: q.expires,
      });
    }
    if (route === "bookings" && req.method === "POST") {
      const input = bookingSchema.parse(await req.json());
      const q = verify<Quote>(input.quoteToken);
      if (q.expires < Date.now())
        return json(
          { error: "Báo giá đã hết hạn. Vui lòng tính lại giá." },
          400,
        );
      const existing = await byRequest(input.requestId);
      if (existing) {
        if (!equal(existing.phone, input.phone.replace(/^\+84/, "0")))
          return json({ error: "Yêu cầu không hợp lệ." }, 409);
        return json({
          id: existing.id,
          token: existing.token,
          status: existing.status,
        });
      }
      validateDeparture(
        input.departure,
        input.returnAt,
        q.roundTrip,
        q.route.durationMinutes,
      );
      const vehicle = VEHICLES.find((x) => x.id === q.vehicleId)!;
      if (input.passengers > vehicle.passengers)
        return json(
          {
            error: `Xe này nhận tối đa ${vehicle.passengers} hành khách, không tính tài xế.`,
          },
          400,
        );
      const b: Booking = {
        id: "NQ-" + randomBytes(4).toString("hex").toUpperCase(),
        token: randomBytes(24).toString("base64url"),
        requestId: input.requestId,
        customer: input.customer,
        phone: input.phone.replace(/^\+84/, "0"),
        note: input.note,
        vehicleId: q.vehicleId,
        driverId: "auto",
        passengers: input.passengers,
        departure: input.departure,
        ...(q.roundTrip ? { returnAt: input.returnAt } : {}),
        roundTrip: q.roundTrip,
        pickup: q.pickup,
        destination: q.destination,
        distanceKm: Math.round(q.route.distanceKm * 10) / 10,
        durationMinutes: q.route.durationMinutes,
        total: calculateFare(q.vehicleId, q.route.distanceKm, q.roundTrip)
          .total,
        routeSource: q.route.source,
        status: "confirmed",
        createdAt: new Date().toISOString(),
        notification: "pending",
        attempts: 0,
      };
      const saved = await saveBooking(b);
      after(() => notify(saved));
      return json(
        { id: saved.id, token: saved.token, status: saved.status },
        201,
      );
    }
    if (route === "lookup" && req.method === "POST") {
      const body = await req.json();
      if (body.phone && !body.token) {
        const phone = z.string().max(40).parse(body.phone);
        const suffix = phoneSuffix(phone);
        if (!suffix)
          return json(
            { error: "Vui lòng nhập số điện thoại có ít nhất 9 chữ số." },
            400,
          );
        const bookings = (await findBookingsByPhone(suffix)).map(publicBooking);
        return json({ bookings, ...groupBookings(bookings) });
      }
      const input = z
        .object({
          id: z.string().min(5).max(40),
          phone: z.string().min(8).max(20).optional(),
          token: z.string().max(100).optional(),
        })
        .parse(body);
      const b = await findBooking(input.id.trim().toUpperCase());
      const normalized = (s: string) => s.replace(/^\+84/, "0");
      if (
        !b ||
        !(
          (input.token && equal(b.token, input.token)) ||
          (input.phone && equal(normalized(b.phone), normalized(input.phone)))
        )
      )
        return json(
          {
            error:
              "Không tìm thấy chuyến xe. Vui lòng kiểm tra mã đặt xe và số điện thoại.",
          },
          404,
        );
      return json({ booking: publicBooking(b) });
    }
    return json({ error: "Không tìm thấy chức năng." }, 404);
  } catch (error) {
    if (error instanceof z.ZodError)
      return json(
        { error: error.issues[0]?.message || "Vui lòng kiểm tra thông tin." },
        400,
      );
    const message = error instanceof Error ? error.message : "";
    if (/NOT_CONFIGURED|SUPABASE_UNAVAILABLE/.test(message))
      return json(
        {
          error:
            "Website chưa được kết nối đầy đủ dịch vụ lưu đơn. Vui lòng thử lại sau.",
        },
        503,
      );
    if (/database|SQL|connect|password|relation/i.test(message))
      return json(
        { error: "Chưa thể kết nối hệ thống. Vui lòng thử lại sau." },
        503,
      );
    return json(
      { error: message || "Chưa thể xử lý yêu cầu. Vui lòng thử lại." },
      400,
    );
  }
}
export const GET = handle;
export const POST = handle;
