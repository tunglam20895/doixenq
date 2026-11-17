import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
if (process.env.ALLOW_TEST_BOOKING !== "1")
  throw new Error(
    "This test creates one real booking and sends a real Telegram notification. Set ALLOW_TEST_BOOKING=1 to run.",
  );
const browser = await chromium.connectOverCDP(
  process.env.LIGHTPANDA_CDP || "http://127.0.0.1:9224",
);
const evidence = {
  browser: "Lightpanda",
  startedAt: new Date().toISOString(),
  testOnly: true,
};
try {
  const context = browser.contexts()[0] || (await browser.newContext());
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const base = process.env.TEST_URL || "http://localhost:3000";
  await page.goto(base + "/");
  await page.locator('.header-actions a[href="/dat-xe"]').click();
  await page.getByLabel("Điểm đến", { exact: true }).fill("noi bai");
  await page
    .getByRole("option")
    .filter({ hasText: "Sân bay Nội Bài" })
    .first()
    .click();
  await expect(page.getByLabel("Điểm đến", { exact: true })).toHaveValue(
    "Sân bay Nội Bài",
  );
  const nextDay = new Date(Date.now() + 86400000);
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(nextDay);
  await page
    .locator('input[type="datetime-local"]')
    .first()
    .fill(date + "T09:00");
  await page.locator("select").first().selectOption("2");
  const quoteResponse = page.waitForResponse(
    (r) =>
      new URL(r.url()).pathname === "/api/quote" &&
      r.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Xem giá & chọn xe", exact: true })
    .click();
  const q1 = await quoteResponse;
  assert.equal(q1.status(), 200);
  const quote1 = await q1.json();
  await expect(page.getByRole("heading", { name: /Chọn xe/ })).toBeVisible();
  // Choose the Limo Green vehicle using its actual button.
  await page
    .locator(".booking-vehicle")
    .filter({ hasText: "VinFast Limo Green" })
    .click();
  const q2Promise = page.waitForResponse(
    (r) =>
      new URL(r.url()).pathname === "/api/quote" &&
      r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  const q2 = await q2Promise;
  assert.equal(q2.status(), 200);
  const quote = await q2.json();
  const km = quote.route.distanceKm;
  const expectedFare =
    Math.round(
      (18000 +
        Math.max(0, Math.min(km, 30) - 1) * 13000 +
        Math.max(0, km - 30) * 11000) /
        1000,
    ) * 1000;
  assert.equal(quote.fare.total, expectedFare);
  const displayedPrice = await page
    .locator(".summary-price strong")
    .textContent();
  assert.equal(Number(displayedPrice.replace(/\D/g, "")), expectedFare);
  evidence.quote = {
    distanceKm: km,
    durationMinutes: quote.route.durationMinutes,
    source: quote.route.source,
    total: quote.fare.total,
    expectedFare,
    displayedPrice,
    initialTotal: quote1.fare.total,
  };
  await page
    .getByLabel("Họ và tên", { exact: true })
    .fill("KIỂM THỬ LIGHTPANDA");
  await page.getByLabel("Số điện thoại", { exact: true }).fill("0977823111");
  await page
    .locator("textarea")
    .fill(
      "KIỂM THỬ — KHÔNG ĐIỀU XE, KHÔNG GỌI KHÁCH. Chủ website yêu cầu kiểm tra toàn bộ luồng đặt xe, tính giá, lưu đơn và Telegram bằng Lightpanda. AUTOMATED_TEST_ONLY.",
    );
  await page.locator('input[type="checkbox"]').check();
  const createdPromise = page.waitForResponse(
    (r) =>
      new URL(r.url()).pathname === "/api/bookings" &&
      r.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Gửi yêu cầu đặt xe", exact: true })
    .click();
  const createdResponse = await createdPromise;
  const created = await createdResponse.json();
  assert.equal(createdResponse.status(), 201, JSON.stringify(created));
  evidence.bookingId = created.id;
  await expect(page.locator(".booking-code strong")).toHaveText(created.id);
  const successPrice = await page
    .locator(".success-price strong")
    .textContent();
  assert.equal(Number(successPrice.replace(/\D/g, "")), expectedFare);
  evidence.successPage = true;
  const lookupPromise = page.waitForResponse(
    (r) =>
      new URL(r.url()).pathname === "/api/lookup" &&
      r.request().method() === "POST",
  );
  await page
    .getByRole("link", { name: "Theo dõi chuyến xe", exact: true })
    .click();
  const lookupResponse = await lookupPromise;
  assert.equal(lookupResponse.status(), 200);
  const lookup = await lookupResponse.json();
  assert.equal(lookup.booking.id, created.id);
  assert.equal(lookup.booking.total, expectedFare);
  assert.equal(lookup.booking.passengers, 2);
  assert.match(lookup.booking.note, /KHÔNG ĐIỀU XE/);
  await expect(page.locator("main")).toContainText(created.id);
  evidence.lookup = {
    passed: true,
    id: lookup.booking.id,
    total: lookup.booking.total,
    status: lookup.booking.status,
    departure: lookup.booking.departure,
    pickup: lookup.booking.pickup.name,
    destination: lookup.booking.destination.name,
    passengers: lookup.booking.passengers,
    vehicleId: lookup.booking.vehicleId,
  };
  assert.deepEqual(errors, []);
  evidence.pageErrors = errors;
  await mkdir("shots", { recursive: true });
  await writeFile(
    "shots/booking-lightpanda-result.json",
    JSON.stringify(evidence, null, 2),
  );
  console.log(JSON.stringify(evidence));
} catch (error) {
  evidence.error = error.message;
  await mkdir("shots", { recursive: true });
  await writeFile(
    "shots/booking-lightpanda-result.json",
    JSON.stringify(evidence, null, 2),
  );
  throw error;
} finally {
  await browser.close();
}
