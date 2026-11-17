import { NextResponse } from "next/server";
import { randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { backend, configured } from "@/lib/supabase/backend";
import { currentAdmin, startSession, endSession } from "@/lib/admin/auth";
import { checkPassword, hashPassword } from "@/lib/admin/password";
import { allowRequest, saveBooking, type Booking } from "@/lib/db";
import { clientKey } from "@/lib/security";
import { VEHICLES } from "@/lib/data";
import { allDrivers } from "@/lib/drivers";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const json = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
const phone = z
  .string()
  .transform((s) => s.replace(/[\s.-]/g, "").replace(/^\+84/, "0"))
  .pipe(
    z.string().regex(/^0[35789]\d{8}$/, "Số điện thoại Việt Nam chưa hợp lệ."),
  );
const vehicleIds = VEHICLES.map((v) => v.id);
const customerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(120),
  phone,
  note: z.string().trim().max(2000).default(""),
});
const driverSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]{2,60}$/),
  name: z.string().trim().min(2).max(100),
  phone: phone.or(z.literal("")),
  intro: z.string().trim().max(300).default(""),
  area: z.string().trim().max(200).default(""),
  vehicle_ids: z
    .array(z.string().refine((v) => vehicleIds.includes(v)))
    .min(1)
    .max(6),
  plate: z.string().trim().max(25).default(""),
  note: z.string().trim().max(2000).default(""),
  active: z.boolean(),
  published: z.boolean(),
  avatar_data: z.string().max(360000).nullable().optional(),
});
const updateSchema = z.object({
  id: z.string().max(40),
  version: z.number().int().min(1),
  status: z.enum(["requested", "confirmed", "completed", "cancelled"]),
  actualTotal: z.number().int().min(0).max(1000000000).nullable(),
  driverId: z.string().max(60),
  reason: z.string().trim().max(600).default(""),
});
const manualSchema = z.object({
  customer: z.string().trim().min(2).max(120),
  phone,
  pickup: z.string().trim().min(2).max(300),
  destination: z.string().trim().min(2).max(300),
  departure: z.string().datetime(),
  vehicleId: z.string().refine((v) => vehicleIds.includes(v)),
  driverId: z.string().default("auto"),
  total: z.number().int().min(0).max(1000000000),
  note: z.string().trim().max(600).default(""),
  passengers: z.number().int().min(1).max(6),
});
async function handle(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const path = (await params).path.join("/");
    if (!configured()) return json({ error: "SUPABASE_NOT_CONFIGURED" }, 503);
    if (req.method === "POST") {
      const origin = req.headers.get("origin");
      if (
        origin &&
        origin !== new URL(req.url).origin &&
        origin !== process.env.APP_URL &&
        origin !== process.env.ADMIN_URL
      )
        return json({ error: "Nguồn yêu cầu không hợp lệ." }, 403);
      if (Number(req.headers.get("content-length") || 0) > 420000)
        return json({ error: "Dữ liệu quá lớn." }, 413);
    }
    if (path === "login" && req.method === "POST") {
      if (!(await allowRequest("admin-login:" + clientKey(req), 8, 600000)))
        return json(
          { error: "Đã thử đăng nhập quá nhiều lần. Vui lòng đợi 10 phút." },
          429,
        );
      const input = z
        .object({
          username: z.string().min(1).max(40),
          password: z.string().min(1).max(128),
        })
        .parse(await req.json());
      const account = await backend<{
        username: string;
        password_hash: string;
      } | null>("auth_account", { username: input.username });
      if (
        !checkPassword(
          input.password,
          account?.password_hash ||
            "scrypt$00000000000000000000000000000000$" + "00".repeat(64),
        ) ||
        !account
      )
        return json({ error: "Tên đăng nhập hoặc mật khẩu chưa đúng." }, 401);
      await startSession(account.username);
      return json({ ok: true });
    }
    const admin = await currentAdmin();
    if (!admin) return json({ error: "Vui lòng đăng nhập admin." }, 401);
    if (path === "logout" && req.method === "POST") {
      await endSession();
      return json({ ok: true });
    }
    if (path === "me" && req.method === "GET")
      return json({ username: admin.username, mustChange: admin.mustChange });
    if (path === "password" && req.method === "POST") {
      if (
        !(await allowRequest(
          "admin-password:" + admin.username + clientKey(req),
          8,
          600000,
        ))
      )
        return json({ error: "Vui lòng thử lại sau ít phút." }, 429);
      const input = z
        .object({
          current: z.string().min(1).max(128),
          password: z
            .string()
            .min(10, "Mật khẩu mới cần ít nhất 10 ký tự.")
            .max(128),
        })
        .parse(await req.json());
      const account = await backend<{ password_hash: string }>("auth_account", {
        username: admin.username,
      });
      if (!checkPassword(input.current, account.password_hash))
        return json({ error: "Mật khẩu hiện tại chưa đúng." }, 400);
      if (input.current === input.password)
        return json(
          { error: "Vui lòng chọn mật khẩu mới khác mật khẩu hiện tại." },
          400,
        );
      await backend("auth_password", {
        username: admin.username,
        hash: hashPassword(input.password),
        session: admin.sessionId,
      });
      return json({ ok: true });
    }
    const query = new URL(req.url).searchParams;
    const filter = {
      search: query.get("search") || "",
      offset: Math.max(0, Number(query.get("offset")) || 0),
      limit: 30,
      status: query.get("status") || "all",
      customerId: query.get("customerId") || "",
    };
    if (path === "driver-photo" && req.method === "GET") {
      const image = await backend<{ data: string | null } | null>(
        "driver_photo",
        { id: query.get("id") || "" },
      );
      const m = image?.data?.match(
        /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/,
      );
      if (!m) return new Response(null, { status: 404 });
      return new Response(Buffer.from(m[2], "base64"), {
        headers: {
          "Content-Type": m[1],
          "Cache-Control": "private,no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    if (path === "dashboard" && req.method === "GET")
      return json(await backend("dashboard"));
    if (path === "bookings" && req.method === "GET")
      return json(await backend("bookings", filter));
    if (path === "customers" && req.method === "GET")
      return json(await backend("customers", filter));
    if (path === "drivers" && req.method === "GET")
      return json({ items: await allDrivers() });
    if (path === "events" && req.method === "GET")
      return json({
        items: await backend("booking_events", { id: query.get("id") || "" }),
      });
    if (path === "customers" && req.method === "POST")
      return json(
        await backend("customer_save", customerSchema.parse(await req.json())),
      );
    if (path === "drivers" && req.method === "POST") {
      const input = driverSchema.parse(await req.json());
      if (input.avatar_data) {
        const m = input.avatar_data.match(
          /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/,
        );
        if (!m) return json({ error: "Ảnh phải là JPG, PNG hoặc WebP." }, 400);
        const bytes = Buffer.from(m[2], "base64");
        const valid =
          m[1] === "jpeg"
            ? bytes[0] === 255 && bytes[1] === 216
            : m[1] === "png"
              ? bytes
                  .subarray(0, 8)
                  .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
              : bytes.toString("ascii", 0, 4) === "RIFF" &&
                bytes.toString("ascii", 8, 12) === "WEBP";
        if (!valid || bytes.length > 256000)
          return json({ error: "Ảnh không hợp lệ hoặc quá lớn." }, 400);
      }
      return json(await backend("driver_save", input));
    }
    if (path === "bookings/update" && req.method === "POST") {
      const input = updateSchema.parse(await req.json());
      const booking = await backend<Booking | null>("find_booking", {
        id: input.id,
      });
      if (!booking) return json({ error: "Không tìm thấy chuyến." }, 404);
      if (input.status === "completed" && input.actualTotal === null)
        return json(
          {
            error:
              "Vui lòng nhập số tiền thực tế trước khi đánh dấu hoàn thành.",
          },
          400,
        );
      if (
        input.driverId !== "auto" &&
        !(await allDrivers()).some(
          (d) =>
            d.id === input.driverId && (d.active || d.id === booking.driverId),
        )
      )
        return json({ error: "Tài xế không tồn tại hoặc đang tạm nghỉ." }, 400);
      return json(
        await backend("booking_update", { ...input, actor: admin.username }),
      );
    }
    if (path === "bookings" && req.method === "POST") {
      const input = manualSchema.parse(await req.json());
      const vehicle = VEHICLES.find((v) => v.id === input.vehicleId)!;
      if (input.passengers > vehicle.passengers)
        return json({ error: "Xe không đủ chỗ cho số hành khách." }, 400);
      if (
        input.driverId !== "auto" &&
        !(await allDrivers()).some((d) => d.id === input.driverId && d.active)
      )
        return json({ error: "Tài xế không tồn tại hoặc đang tạm nghỉ." }, 400);
      const makePlace = (name: string) => ({
        name,
        address: name,
        lat: null,
        lng: null,
      });
      const b = {
        id: "NQ-" + randomBytes(5).toString("hex").toUpperCase(),
        token: randomBytes(24).toString("base64url"),
        requestId: randomUUID(),
        ...input,
        pickup: makePlace(input.pickup),
        destination: makePlace(input.destination),
        roundTrip: false,
        distanceKm: 0,
        durationMinutes: 0,
        routeSource: "manual",
        status: "confirmed",
        source: "admin",
        createdAt: new Date().toISOString(),
        notification: "not_configured",
        attempts: 0,
      };
      const saved = await backend<Record<string, unknown>>("save_booking", b);
      const { token, requestId, ...safe } = saved;
      void token;
      void requestId;
      return json(safe, 201);
    }
    return json({ error: "Không tìm thấy chức năng." }, 404);
  } catch (e) {
    if (e instanceof z.ZodError)
      return json(
        { error: e.issues[0]?.message || "Thông tin chưa hợp lệ." },
        400,
      );
    const code = e instanceof Error ? e.message : "";
    if (code === "VERSION_CONFLICT")
      return json(
        {
          error:
            "Chuyến đã được cập nhật ở cửa sổ khác. Vui lòng tải lại rồi thử lại.",
        },
        409,
      );
    if (code === "DUPLICATE_PHONE")
      return json(
        { error: "Số điện thoại này đã có trong danh sách khách hàng." },
        409,
      );
    return json({ error: "Chưa thể kết nối dữ liệu. Vui lòng thử lại." }, 503);
  }
}
export const GET = handle;
export const POST = handle;
