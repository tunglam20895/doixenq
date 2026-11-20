import { test, expect } from "@playwright/test";
test("khách lọc xe, đặt và tra cứu; không còn phần 3D", async ({
  page,
  request,
}) => {
  const config = await (await request.get("/api/config")).json();
  expect(config.telegram).toBe(false);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(".vehicle-card")).toHaveCount(6);
  await page.getByRole("button", { name: "Xe 7 chỗ", exact: true }).click();
  await expect(page.locator(".vehicle-card")).toHaveCount(2);
  await expect(
    page.locator('.vehicle-card img[alt="Suzuki Ertiga"]'),
  ).toHaveAttribute("src", "/images/ertiga-black.webp");
  await page.getByRole("button", { name: "Xe điện", exact: true }).click();
  await expect(page.locator(".vehicle-card")).toHaveCount(4);
  await expect(
    page.locator(
      ".showcase-platform, .showcase-orbit, .scene-trigger, .showroom-dialog",
    ),
  ).toHaveCount(0);
  await page.goto("/dat-xe?from=nhu-quynh&to=noi-bai");
  await expect(page.getByLabel(/Ngày & giờ đón/)).toHaveValue(/T08:00$/);
  await page
    .getByRole("button", { name: "Xem giá & chọn xe", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Bạn muốn đi xe nào?" }),
  ).toBeVisible();
  await page
    .locator(".booking-vehicle")
    .filter({ hasText: "VinFast VF 6" })
    .click();
  await expect(page.locator('input[name="driver"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await expect(page.locator(".review-block")).toContainText("VinFast VF 6");
  await expect(
    page.getByRole("heading", { name: "Hẹn giờ, mình đón." }),
  ).toBeVisible();
  await page
    .getByLabel("Họ và tên", { exact: true })
    .fill("Khách thử giao diện");
  await page.getByLabel("Số điện thoại", { exact: true }).fill("0900000000");
  await page.locator("textarea").fill("AUTOMATED_TEST_ONLY — browser");
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Đặt xe ngay", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Đã nhận lịch đặt xe của bạn." }),
  ).toBeVisible();
  await expect(page.locator(".success-card")).toContainText("chưa phải giá cuối cùng");
  await expect(page.locator(".success-card")).toContainText("báo giá chính thức");
  const code = await page.locator(".booking-code>strong").textContent();
  expect(code).toMatch(/^NQ-/);
  const qr = page.getByRole("img", { name: `QR tra cứu chuyến ${code}` });
  await expect(qr).toHaveAttribute("src", /^data:image\/png;base64,/);
  await expect(page.getByRole("link", { name: "Tải QR về máy" })).toHaveAttribute("download", `tra-cuu-${code}.png`);
  const followHref = await page.getByRole("link", { name: "Theo dõi chuyến xe", exact: true }).getAttribute("href");
  const QRCode = await import("qrcode");
  const matrix = QRCode.create(new URL(followHref!, "https://www.doixenq.com").href, { errorCorrectionLevel: "M" }).modules;
  const matches = await qr.evaluate(async (element, expected) => {
    const image = element as HTMLImageElement;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d")!;
    context.drawImage(image, 0, 0);
    const scale = canvas.width / (expected.size + 8);
    for (let y = 0; y < expected.size; y++) for (let x = 0; x < expected.size; x++) {
      const pixel = context.getImageData(Math.floor((x + 4.5) * scale), Math.floor((y + 4.5) * scale), 1, 1).data;
      if ((pixel[0] < 128) !== Boolean(expected.data[y * expected.size + x])) return false;
    }
    return true;
  }, { size: matrix.size, data: Array.from(matrix.data) });
  expect(matches).toBe(true);
  await page
    .getByRole("link", { name: "Theo dõi chuyến xe", exact: true })
    .click();
  await expect(page.locator(".booking-result")).toBeVisible();
  await expect(page.locator(".result-title h2")).toHaveText(code!);
  await expect(page.locator(".status-badge")).toContainText(
    "Đã xác nhận",
  );
  expect(errors).toEqual([]);
});
test("giao diện điện thoại 320/390 không tràn ngang, ảnh đầy đủ, menu dùng được", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await page.waitForTimeout(800);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    for (const card of await page.locator(".vehicle-card").all()) {
      await card.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          card.locator("img").evaluate(
            (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
          ),
        )
        .toBe(true);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Mở menu", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Đóng menu", exact: true }),
  ).toBeVisible();
  await page
    .locator(".desktop-nav")
    .getByRole("link", { name: "Bảng giá", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Tham khảo chi phí, an tâm đặt xe." }),
  ).toBeVisible();
  await page.goto("/dat-xe?from=nhu-quynh&to=noi-bai");
  await expect(page.getByLabel(/Ngày & giờ đón/)).toHaveValue(/T08:00$/);
  expect(
    await page
      .locator(".mobile-book")
      .evaluate(
        (el) =>
          getComputedStyle(el).color !== getComputedStyle(el).backgroundColor,
      ),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.route("**/api/places/reverse?*", (route) =>
    route.fulfill({ json: {} }),
  );
  await page
    .getByRole("button", { name: "Chọn trên bản đồ", exact: true })
    .last()
    .click();
  const picker = page.getByRole("dialog", { name: "Chọn điểm đến" });
  await picker.locator(".leaflet-container").click({ position: { x: 170, y: 100 } });
  await picker.getByRole("button", { name: "Xác nhận điểm đến" }).click();
  await expect(
    page.getByRole("combobox", { name: "Điểm đến", exact: true }),
  ).toHaveValue("Điểm đến đã ghim");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});
test("tra cứu bằng 9 số cuối, chia chuyến sắp tới và lịch sử", async ({ page }) => {
  const base = {
    customer: "Khách kiểm thử", phone: "0912345678", vehicleId: "limo", driverId: "auto", passengers: 2,
    departure: "2026-11-18T01:00:00Z", roundTrip: false, distanceKm: 20, durationMinutes: 30, total: 200000,
    pickup: { name: "Như Quỳnh", address: "Hưng Yên", lat: 20.98, lng: 105.98 },
    destination: { name: "Nội Bài", address: "Hà Nội", lat: 21.21, lng: 105.8 },
  };
  await page.route("**/api/lookup", async route => {
    expect(route.request().postDataJSON()).toEqual({ phone: "912345678" });
    await route.fulfill({ json: { bookings: [
      { ...base, id: "NQ-UPCOMING", status: "confirmed" },
      { ...base, id: "NQ-COMPLETED", status: "completed" },
      { ...base, id: "NQ-CANCELLED", status: "cancelled" },
    ] } });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tra-cuu");
  await expect(page.getByLabel("Mã đặt xe", { exact: true })).toHaveCount(0);
  await page.getByLabel("Số điện thoại", { exact: true }).fill("912345678");
  await page.getByRole("button", { name: "Tra cứu chuyến xe", exact: true }).click();
  await expect(page.locator(".booking-result")).toHaveCount(1);
  await expect(page.locator(".result-title h2")).toHaveText("NQ-UPCOMING");
  await page.getByRole("button", { name: "Chuyến đã đi (2)" }).click();
  await expect(page.locator(".booking-result")).toHaveCount(2);
  await expect(page.getByText("Đã hoàn thành", { exact: true })).toBeVisible();
  await expect(page.getByText("Đã hủy", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
test("tra cứu chỉ hiển thị trạng thái chuyến và xe", async ({ page }) => {
  await page.route("**/api/lookup", route => route.fulfill({ json: { bookings: [{
    id: "NQ-ASSIGNED", status: "confirmed", driverAssigned: true,
    driverName: "Nguyễn Văn An", driverPhone: "0912345678",
    vehicleId: "limo", passengers: 2, departure: "2026-11-18T01:00:00Z", total: 200000,
    pickup: { name: "Như Quỳnh", address: "Hưng Yên" }, destination: { name: "Nội Bài", address: "Hà Nội" },
  }] } }));
  await page.clock.install();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tra-cuu");
  await page.getByLabel("Số điện thoại", { exact: true }).fill("912345678");
  await page.getByRole("button", { name: "Tra cứu chuyến xe", exact: true }).click();
  await expect(page.locator('.trip-progress [aria-current="step"]')).toContainText("Đã xác nhận");
  await expect(page.getByRole("region", { name: "Thông tin tài xế" })).toHaveCount(0);
  await expect(page.getByText("Nguyễn Văn An")).toHaveCount(0);
  await expect(page.getByText("Đã giao tài xế")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "0912345678" })).toHaveCount(0);
});
