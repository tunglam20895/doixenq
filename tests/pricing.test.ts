import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateFare, validateDeparture } from "../lib/pricing";
import { sign, verify, equal } from "../lib/security";
test("cước km đầu, bậc 30 km và đường dài không bị tính trùng", () => {
  assert.equal(calculateFare("limo", 1).total, 17000);
  assert.equal(calculateFare("limo", 30).total, 365000);
  assert.equal(calculateFare("limo", 40).total, 465000);
  assert.equal(calculateFare("vf5", 40).total, 389000);
});
test("chuyến ngắn hơn 1 km vẫn tính cước mở cửa", () => {
  assert.equal(calculateFare("limo", 0.3).total, 17000);
});
test("khứ hồi tính đủ hai lượt, không nhân đôi quãng đường trước khi áp bậc", () => {
  assert.equal(calculateFare("limo", 40, true).total, 930000);
  assert.equal(calculateFare("limo", 40, true).legs, 2);
});
test("từ chối số km âm, vô hạn, quá xa và xe lạ", () => {
  for (const km of [0, -1, NaN, Infinity, 1600])
    assert.throws(() => calculateFare("limo", km));
  assert.throws(() => calculateFare("fake", 40));
});
test("giờ đón không được ở quá khứ hoặc quá 180 ngày", () => {
  assert.throws(() =>
    validateDeparture(new Date(Date.now() - 60000).toISOString()),
  );
  assert.throws(() =>
    validateDeparture(new Date(Date.now() + 181 * 86400000).toISOString()),
  );
  assert.doesNotThrow(() =>
    validateDeparture(new Date(Date.now() + 3600000).toISOString()),
  );
});
test("khứ hồi phải có giờ về sau thời gian đến dự kiến", () => {
  const start = new Date(Date.now() + 86400000).toISOString();
  assert.throws(() => validateDeparture(start, undefined, true, 90));
  assert.throws(() =>
    validateDeparture(
      start,
      new Date(Date.parse(start) + 30 * 60000).toISOString(),
      true,
      90,
    ),
  );
  assert.doesNotThrow(() =>
    validateDeparture(
      start,
      new Date(Date.parse(start) + 120 * 60000).toISOString(),
      true,
      90,
    ),
  );
});
test("báo giá ký không sửa được giá hoặc quãng đường", () => {
  process.env.AUTH_SECRET = "test-secret-for-signing-at-least-32-characters";
  const value = sign({ total: 465000, km: 40 });
  assert.deepEqual(verify(value), { total: 465000, km: 40 });
  const [body, sig] = value.split(".");
  const changed = Buffer.from(JSON.stringify({ total: 1, km: 40 })).toString(
    "base64url",
  );
  assert.throws(() => verify(changed + "." + sig));
  assert.throws(() => verify(body + ".wrong"));
  assert.equal(equal("a", "ab"), false);
});

test("giá dự kiến 40 km của cả 6 dòng xe theo bảng cước mới", () => {
  const expected = {
    limo: 465000,
    ertiga: 465000,
    vf5: 389000,
    vios: 389000,
    vf6: 425000,
    nerio: 408000,
  };
  for (const [vehicle, total] of Object.entries(expected)) {
    assert.equal(calculateFare(vehicle, 40).total, total, vehicle);
  }
});
