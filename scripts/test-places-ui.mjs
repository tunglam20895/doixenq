import { chromium, expect } from "@playwright/test";
const isLightpanda = !!process.env.LIGHTPANDA_CDP;
const browser = isLightpanda
  ? await chromium.connectOverCDP(process.env.LIGHTPANDA_CDP)
  : await chromium.launch({
      executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
      args: ["--no-sandbox"],
    });
try {
  const context = isLightpanda
    ? browser.contexts()[0]
    : await browser.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${process.env.TEST_URL || "http://localhost:3000"}/dat-xe`, {
    waitUntil: "domcontentloaded",
  });
  const destination = page.getByLabel("Điểm đến", { exact: true });
  await destination.fill("Bệnh viện Bạch Mai");
  const result = page
    .getByRole("option")
    .filter({ hasText: "Bệnh viện Bạch Mai" })
    .first();
  await expect(result).toBeVisible({ timeout: 15000 });
  await result.click();
  await expect(destination).toHaveValue("Bệnh viện Bạch Mai");
  await page.locator(".place-map-action").nth(1).click();
  await expect(page.locator("dialog[open]")).toBeVisible();
  if (!isLightpanda) {
    await page.getByRole("button", { name: "Zoom in", exact: true }).waitFor();
    await page.getByRole("button", { name: "Zoom in", exact: true }).click();
    const tileZoom = () =>
      page.locator(".leaflet-tile-container").evaluateAll((es) =>
        es
          .map((e) => e.querySelector("img")?.src)
          .filter(Boolean)
          .map((s) => new URL(s).pathname.split("/")[1]),
      );
    const before = await tileZoom();
    await page
      .locator(".leaflet-container")
      .tap({ position: { x: 170, y: 160 } });
    await expect(page.locator(".location-selected strong")).toHaveText(
      "Điểm đến đã ghim",
    );
    expect(await tileZoom()).toEqual(before);
    await page.screenshot({ path: "shots/location-picker-mobile.png" });
  }
  const confirmed = await page
    .locator(".location-selected strong")
    .textContent();
  await page
    .getByRole("button", { name: "Xác nhận điểm đến", exact: true })
    .click();
  await expect(page.locator("dialog")).toHaveCount(0);
  await expect(destination).toHaveValue(confirmed);
  const saved = await destination.inputValue();
  await page.locator(".place-map-action").nth(1).click();
  if (!isLightpanda) {
    await page.locator(".leaflet-control-zoom-in").waitFor();
    await page
      .locator(".leaflet-container")
      .tap({ position: { x: 90, y: 120 } });
  }
  await page
    .getByRole("button", { name: "Đóng chọn vị trí", exact: true })
    .click();
  await expect(destination).toHaveValue(saved);
  expect(errors).toEqual([]);
  if (!isLightpanda)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  console.log(
    JSON.stringify({
      browser: isLightpanda ? "Lightpanda" : "Chromium mobile",
      remoteSuggestions: "passed",
      selectDestination: "passed",
      confirm: "passed",
      cancelPreservesValue: "passed",
      pinZoomPreserved: isLightpanda ? "checked in Chromium" : "passed",
      pageErrors: errors,
    }),
  );
} finally {
  await browser.close();
}
