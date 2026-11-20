import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
process.loadEnvFile(".env.local");
const base = process.env.TEST_URL || "http://localhost:3000";
let cookie = "";
let checks = 0;
async function call(path, body, auth = true) {
  const r = await fetch(base + "/api/admin/" + path, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      ...(auth && cookie ? { Cookie: cookie } : {}),
      "Content-Type": "application/json",
      "x-forwarded-for": "admin-integration-" + randomUUID(),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await r.json();
  return { r, data, status: r.status };
}
function ok(label, fn) {
  fn();
  checks++;
  console.log("PASS " + label);
}
let r = await call("customers", undefined, false);
ok("Khách vãng lai không đọc được danh sách khách", () =>
  assert.equal(r.status, 401),
);
r = await call(
  "login",
  { username: "admin", password: "incorrect-password" },
  false,
);
ok("Sai mật khẩu không được cấp phiên", () => assert.equal(r.status, 401));
r = await call(
  "login",
  { username: "admin", password: process.env.ADMIN_TEST_PASSWORD },
  false,
);
ok("Đăng nhập admin bằng tên người dùng, không cần email", () =>
  assert.equal(r.status, 200),
);
cookie = r.r.headers
  .getSetCookie()
  .map((s) => s.split(";")[0])
  .join("; ");
ok("Cookie đăng nhập HttpOnly và SameSite Strict", () => {
  const c = r.r.headers.getSetCookie().join(" ");
  assert.match(c, /HttpOnly/i);
  assert.match(c, /SameSite=strict/i);
});
const driver = {
  id: "qa-" + randomUUID(),
  name: "Tài xế kiểm thử",
  phone: "0900000011",
  intro: "Hồ sơ kiểm thử tự động",
  area: "Như Quỳnh",
  vehicle_ids: ["limo"],
  plate: "QA-TEST",
  note: "AUTOMATED_TEST_ONLY",
  active: true,
  published: false,
};
r = await call("drivers", driver);
ok("Tạo hồ sơ tài xế trong Supabase", () => assert.equal(r.status, 200));
assert.equal((await fetch(base + "/api/drivers")).status, 404);
assert.equal((await fetch(base + "/api/drivers/" + driver.id + "/photo")).status, 404);
r = await call("customers", {
  name: "QA Khách Admin",
  phone: "0900000012",
  note: "AUTOMATED_TEST_ONLY",
});
ok("Thêm khách với số điện thoại duy nhất", () => assert.equal(r.status, 200));
const customer = r.data;
r = await call("customers", {
  name: "QA trùng số",
  phone: "+84900000012",
  note: "AUTOMATED_TEST_ONLY",
});
ok("Chuẩn hóa +84 và chặn khách trùng số điện thoại", () =>
  assert.equal(r.status, 409),
);
r = await call("bookings", {
  customer: customer.name,
  phone: customer.phone,
  pickup: "Như Quỳnh",
  destination: "Nội Bài",
  departure: new Date(Date.now() + 86400000).toISOString(),
  vehicleId: "limo",
  driverId: driver.id,
  total: 100000,
  passengers: 3,
  note: "AUTOMATED_TEST_ONLY",
});
ok("Nhập chuyến thủ công, phân tài xế, trạng thái đã đặt", () => {
  assert.equal(r.status, 201);
  assert.equal(r.data.status, "confirmed");
});
let trip = r.data;
async function stats() {
  const r = await call("customers?search=0900000012");
  assert.equal(r.status, 200);
  return r.data.items.find((c) => c.id === customer.id);
}
let c = await stats();
ok("Chuyến mới chưa cộng số chuyến đã đi và tiền", () => {
  assert.equal(c.completed, 0);
  assert.equal(c.total_spent, 0);
});
async function update(status, actualTotal, version = trip.version) {
  const r = await call("bookings/update", {
    id: trip.id,
    version,
    status,
    driverId: driver.id,
    actualTotal,
    reason: "AUTOMATED_TEST_ONLY",
  });
  if (r.status === 200) trip = r.data;
  return r;
}
r = await update("completed", null);
ok("Hoàn thành yêu cầu số tiền thực tế", () => assert.equal(r.status, 400));
r = await update("completed", 150000);
ok("Đánh dấu hoàn thành và lưu tiền thực tế", () =>
  assert.equal(r.status, 200),
);
c = await stats();
ok("Khách có một chuyến đã đi, tổng 150.000đ", () => {
  assert.equal(c.completed, 1);
  assert.equal(c.total_spent, 150000);
});
r = await update("completed", 150000);
assert.equal(r.status, 200);
c = await stats();
ok("Bấm hoàn thành nhiều lần không cộng trùng doanh thu", () => {
  assert.equal(c.completed, 1);
  assert.equal(c.total_spent, 150000);
});
r = await update("cancelled", 150000);
assert.equal(r.status, 200);
c = await stats();
ok("Chuyển sang hủy tự loại chuyến và tiền khỏi thống kê", () => {
  assert.equal(c.completed, 0);
  assert.equal(c.total_spent, 0);
  assert.equal(c.cancelled, 1);
});
const oldVersion = trip.version;
r = await update("completed", 230000);
assert.equal(r.status, 200);
c = await stats();
ok("Sửa lại hoàn thành cập nhật đúng 230.000đ", () => {
  assert.equal(c.completed, 1);
  assert.equal(c.total_spent, 230000);
});
r = await update("cancelled", 230000, oldVersion);
ok("Chặn ghi đè từ cửa sổ cũ bằng phiên bản chuyến", () =>
  assert.equal(r.status, 409),
);
r = await call("events?id=" + trip.id);
ok("Lưu lịch sử thay đổi chuyến", () => {
  assert.equal(r.status, 200);
  assert.ok(r.data.items.length >= 5);
});
r = await call("dashboard");
ok("Dashboard lấy dữ liệu thực từ Supabase", () => {
  assert.equal(r.status, 200);
  assert.ok(r.data.revenue >= 230000);
  assert.equal(r.data.chart.length, 7);
});
r = await call("bookings");
ok("Danh sách admin không lộ khóa tra cứu của khách", () => {
  const t = r.data.items.find((t) => t.id === trip.id);
  assert.ok(t);
  assert.equal(t.token, undefined);
  assert.equal(t.requestId, undefined);
});
const publicLookup = await fetch(base + "/api/lookup", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-forwarded-for": randomUUID(),
  },
  body: JSON.stringify({ phone: customer.phone }),
});
const { bookings } = await publicLookup.json();
ok("Khách tra cứu thấy trạng thái và số tiền thực tế đã cập nhật", () => {
  assert.equal(publicLookup.status, 200);
  const booking = bookings.find((b) => b.id === trip.id);
  assert.equal(booking.status, "completed");
  assert.equal(booking.actualTotal, 230000);
  for (const field of ["driverId", "driverName", "driverPhone", "driverAssigned"])
    assert.ok(!(field in booking));
});
r = await call("drivers", { ...driver, published: true, active: false });
assert.equal(r.status, 200);
const s = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false } },
);
const raw = await s.from("fleet_customers").select("*");
ok("RLS/quyền bảng chặn đọc trực tiếp bằng khóa public", () =>
  assert.ok(raw.error),
);
const secretless = await s.rpc("fleet_backend", {
  p_secret: "invalid",
  p_action: "dashboard",
  p_data: {},
});
ok("Gateway từ chối gọi thiếu bí mật máy chủ", () =>
  assert.ok(secretless.error),
);
r = await call("logout", {});
ok("Đăng xuất thu hồi phiên trong database", () => assert.equal(r.status, 200));
r = await call("customers");
ok("Cookie cũ không dùng lại được sau đăng xuất", () =>
  assert.equal(r.status, 401),
);
console.log(
  `${checks} admin integration checks passed. Test records are marked AUTOMATED_TEST_ONLY.`,
);
