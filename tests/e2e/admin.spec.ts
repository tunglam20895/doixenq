import { test, expect } from "@playwright/test";
test("admin quản lý tài xế, ảnh, chuyến hoàn thành và khách hàng trên Supabase", async ({
  page,
  request,
}) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/dang-nhap/);
  await page.getByLabel("Tên đăng nhập", { exact: true }).fill("admin");
  await page
    .getByLabel("Mật khẩu", { exact: true })
    .fill(process.env.ADMIN_TEST_PASSWORD!);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Hôm nay, mình đi đâu?" }),
  ).toBeVisible();
  await expect(
    page.locator(".site-header,.site-footer,.mobile-bottom"),
  ).toHaveCount(0);
  await page
    .locator(".admin-sidebar")
    .getByRole("link", { name: "Tài xế", exact: true })
    .click();
  await page.getByRole("button", { name: "Thêm tài xế", exact: true }).click();
  const name = "QA UI Tài xế " + Date.now();
  await page.getByLabel("Tên tài xế", { exact: true }).fill(name);
  await page.getByLabel("Số điện thoại", { exact: true }).fill("0900000044");
  await page.getByLabel("Khu vực hoạt động", { exact: true }).fill("Như Quỳnh");
  await page
    .getByLabel("Giới thiệu cho khách", { exact: true })
    .fill("Thông tin kiểm thử giao diện");
  await page
    .getByLabel("Ghi chú nội bộ", { exact: true })
    .fill("AUTOMATED_TEST_ONLY");
  await page
    .getByRole("checkbox", { name: "VinFast Limo Green", exact: true })
    .check();
  const photo = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 32;
    c.height = 32;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#24583f";
    ctx.fillRect(0, 0, 32, 32);
    return c.toDataURL("image/png").split(",")[1];
  });
  await page
    .getByLabel("Ảnh tài xế", { exact: true })
    .setInputFiles({
      name: "qa-avatar.png",
      mimeType: "image/png",
      buffer: Buffer.from(photo, "base64"),
    });
  await expect(page.getByAltText("Ảnh tài xế đang chọn")).toBeVisible();
  await page
    .getByRole("button", { name: "Lưu thông tin", exact: true })
    .click();
  await expect(page.locator(".admin-dialog")).toHaveCount(0);
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  const { items } = await (await page.request.get("/api/admin/drivers")).json();
  const driver = items.find((d: { name: string }) => d.name === name);
  expect(driver).toBeTruthy();
  expect((await request.get("/api/drivers")).status()).toBe(404);
  expect((await request.get(`/api/drivers/${driver.id}/photo`)).status()).toBe(404);
  const image = await page.request.get(`/api/admin/driver-photo?id=${driver.id}`);
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toBe("image/webp");
  await page
    .locator(".admin-sidebar")
    .getByRole("link", { name: "Chuyến đi", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Thêm chuyến đi", exact: true })
    .click();
  await page
    .getByLabel("Tên khách hàng", { exact: true })
    .fill("QA UI Khách Hàng");
  await page.getByLabel("Số điện thoại", { exact: true }).fill("0900000045");
  await page.getByLabel("Điểm đón", { exact: true }).fill("Như Quỳnh");
  await page.getByLabel("Điểm đến", { exact: true }).fill("Sân bay Nội Bài");
  await page
    .getByRole("combobox", { name: "Tài xế", exact: true })
    .selectOption(driver.id);
  await page
    .getByLabel("Giá dự kiến / đã thỏa thuận (VNĐ)", { exact: true })
    .fill("180000");
  await page
    .getByLabel("Ghi chú chuyến đi", { exact: true })
    .fill("AUTOMATED_TEST_ONLY");
  await page
    .locator("dialog")
    .getByRole("button", { name: "Thêm chuyến đi", exact: true })
    .click();
  await expect(page.locator(".admin-dialog")).toHaveCount(0);
  const row = page
    .locator(".booking-table tbody tr")
    .filter({ hasText: "0900000045" });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: /Cập nhật chuyến/ }).click();
  await page
    .getByRole("combobox", { name: "Trạng thái chuyến", exact: true })
    .selectOption("completed");
  await page
    .getByRole("spinbutton", { name: /Số tiền thực tế/ })
    .fill("200000");
  await page
    .getByLabel("Ghi chú cập nhật / lý do hủy", { exact: true })
    .fill("AUTOMATED_TEST_ONLY");
  await page
    .getByRole("button", { name: "Cập nhật chuyến", exact: true })
    .click();
  await expect(page.locator(".admin-dialog")).toHaveCount(0);
  await expect(row.locator(".admin-status")).toHaveText("Hoàn thành");
  await page
    .locator(".admin-sidebar")
    .getByRole("link", { name: "Khách hàng", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Tìm tên hoặc số điện thoại", exact: true })
    .fill("0900000045");
  const customerRow = page
    .locator(".admin-table tbody tr")
    .filter({ hasText: "0900000045" });
  await expect(customerRow).toBeVisible();
  await expect(customerRow).toContainText("200.000");
  await customerRow.getByRole("button", { name: /Xem chuyến/ }).click();
  await expect(page.locator(".admin-customer-summary")).toContainText(
    "200.000",
  );
  await expect(page.locator("dialog .admin-status")).toHaveText("Hoàn thành");
  await page.getByRole("button", { name: "Đóng cửa sổ", exact: true }).click();
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page
    .locator(".admin-sidebar")
    .getByRole("link", { name: "Tài xế", exact: true })
    .click();
  await page.getByRole("button", { name: "Đăng xuất", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/dang-nhap/);
  expect((await page.request.get("/api/admin/customers")).status()).toBe(401);
  expect(errors).toEqual([]);
});
