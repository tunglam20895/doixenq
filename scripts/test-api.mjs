import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
const base = process.env.TEST_URL || "http://localhost:3000";
async function post(path, body, extra = {}) {
  const r = await fetch(base + "/api/" + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "integration-" + randomUUID(),
      ...extra,
    },
    body: JSON.stringify(body),
  });
  return { status: r.status, data: await r.json() };
}
const config = await (await fetch(base + "/api/config")).json();
assert.equal(
  config.telegram,
  false,
  "Run integration tests only with Telegram disconnected to avoid sending test messages.",
);
const pickup = {
  id: "nhu-quynh",
  name: "Như Quỳnh, Hưng Yên",
  address: "Khu vực Như Quỳnh, Hưng Yên",
  lat: 20.9815,
  lng: 105.9849,
};
const destination = {
  id: "noi-bai",
  name: "Sân bay Nội Bài",
  address: "Nhà ga T1, sân bay Nội Bài, Hà Nội",
  lat: 21.2187,
  lng: 105.8042,
};
let checks = 0;
const check = (label, fn) => {
  fn();
  checks++;
  console.log("PASS " + label);
};
const q = await post("quote", {
  pickup,
  destination,
  vehicleId: "limo",
  roundTrip: false,
});
check("Tính tuyến đường và báo giá từ máy chủ", () => {
  assert.equal(q.status, 200);
  assert.ok(q.data.route.distanceKm > 0);
  assert.ok(q.data.fare.total > 0);
  assert.ok(q.data.route.geometry.length >= 2);
});
const request = {
  quoteToken: q.data.quoteToken,
  requestId: randomUUID(),
  customer: "Khách kiểm thử",
  phone: "0900000000",
  note: "AUTOMATED_TEST_ONLY",
  driverId: "auto",
  passengers: 4,
  departure: new Date(Date.now() + 86400000).toISOString(),
  consent: true,
  website: "",
};
const created = await post("bookings", request);
check("Lưu đơn thật và cấp mã + khóa tra cứu", () => {
  assert.equal(created.status, 201);
  assert.match(created.data.id, /^NQ-/);
  assert.equal(created.data.status, "confirmed");
  assert.ok(created.data.token);
});
const dup = await post("bookings", request);
check("Gửi lại do mạng chậm không tạo hai đơn", () => {
  assert.equal(dup.status, 200);
  assert.equal(dup.data.id, created.data.id);
});
const looked = await post("lookup", {
  id: created.data.id,
  phone: request.phone,
});
check("Tra cứu đúng số điện thoại, giữ giá máy chủ", () => {
  assert.equal(looked.status, 200);
  assert.equal(looked.data.bookings.find(b => b.id === created.data.id).total, q.data.fare.total);
  assert.equal(looked.data.bookings[0].token, undefined);
  assert.equal(looked.data.bookings[0].notification, undefined);
});
for (const phone of ["900000000", "+84 900 000 000", "0900-000-000"]) {
  const result = await post("lookup", { phone });
  check("Tra cứu không cần mã: " + phone, () => {
    assert.equal(result.status, 200);
    assert.ok(result.data.upcoming.some(b => b.id === created.data.id));
    assert.ok(result.data.bookings.every(b => !('token' in b) && !('requestId' in b) && !('attempts' in b)));
  });
}
for (const phone of ["00000000", "0900abc000000"]) {
  const result = await post("lookup", { phone });
  check("Từ chối số không hợp lệ: " + phone, () => assert.equal(result.status, 400));
}
const keyed = await post("lookup", {
  id: created.data.id,
  token: created.data.token,
});
check("Đường dẫn tra cứu riêng hoạt động", () =>
  assert.equal(keyed.status, 200),
);
const wrong = await post("lookup", {
  id: created.data.id,
  phone: "0911111111",
});
check("Không lộ đơn khi sai số điện thoại", () => {
  assert.equal(wrong.status, 200);
  assert.deepEqual(wrong.data.bookings, []);
  assert.equal(wrong.data.booking, undefined);
});
const mismatch = await post("bookings", {
  ...request,
  requestId: randomUUID(),
  driverId: "hung",
});
check("Không cho chọn tài xế không lái dòng xe đó", () =>
  assert.equal(mismatch.status, 400),
);
const tampered = await post("bookings", {
  ...request,
  requestId: randomUUID(),
  quoteToken: q.data.quoteToken + "bad",
});
check("Từ chối báo giá đã sửa", () => assert.equal(tampered.status, 400));
const invalid = await post("bookings", {
  ...request,
  requestId: randomUUID(),
  phone: "123",
});
check("Kiểm tra định dạng số điện thoại", () =>
  assert.equal(invalid.status, 400),
);
const past = await post("bookings", {
  ...request,
  requestId: randomUUID(),
  departure: new Date(Date.now() - 1000).toISOString(),
});
check("Từ chối giờ đón quá khứ", () => assert.equal(past.status, 400));
const cross = await post("bookings", request, {
  Origin: "https://other.example",
});
check("Chặn gửi yêu cầu từ origin khác", () => assert.equal(cross.status, 403));
const retry = await fetch(base + "/api/notifications/retry");
check("Không công khai tác vụ gửi lại Telegram", () =>
  assert.equal(retry.status, 401),
);
const noConsent = await post("bookings", {
  ...request,
  requestId: randomUUID(),
  consent: false,
});
check("Bắt buộc đồng ý chính sách", () => assert.equal(noConsent.status, 400));
const bot = await post("bookings", {
  ...request,
  requestId: randomUUID(),
  website: "spam",
});
check("Chặn bẫy spam", () => assert.equal(bot.status, 400));
for (const path of [
  "/",
  "/dat-xe",
  "/tra-cuu",
  "/bang-gia",
  "/chinh-sach",
  "/nguon-anh",
  "/images/vios.webp",
]) {
  const r = await fetch(base + path);
  check("Trang/tài nguyên " + path, () => assert.equal(r.status, 200));
}
console.log(
  `${checks} integration checks passed. Test order ${created.data.id} is marked AUTOMATED_TEST_ONLY in the local database.`,
);
