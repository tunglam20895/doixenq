import { test } from "node:test";
import assert from "node:assert/strict";
import { phoneSuffix, groupBookings } from "../lib/booking-lookup";
test("tra cứu khớp chính xác 9 số cuối và từ chối chuỗi thiếu số hoặc có chữ", () => {
  for (const value of ["0912345678", "+84 912 345 678", "912345678", "(0912) 345-678"])
    assert.equal(phoneSuffix(value), "912345678");
  for (const value of ["12345678", "", "abc912345678", "1234567890123456"])
    assert.equal(phoneSuffix(value), null);
});
test("chia chuyến theo trạng thái admin, sắp tới gần nhất trước và lịch sử mới nhất trước", () => {
  const groups = groupBookings([
    { status: "confirmed", departure: "2026-11-19T01:00:00Z" },
    { status: "completed", departure: "2026-11-16T01:00:00Z" },
    { status: "cancelled", departure: "2026-11-20T01:00:00Z" },
    { status: "requested", departure: "2026-11-18T01:00:00Z" },
  ]);
  assert.deepEqual(groups.upcoming.map(b => b.status), ["requested", "confirmed"]);
  assert.deepEqual(groups.past.map(b => b.status), ["cancelled", "completed"]);
});
