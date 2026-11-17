import { test, expect } from "@playwright/test";

test("gợi ý theo input khi còn focus, gọi ngay và bỏ kết quả cũ", async ({
  page,
}) => {
  const requests: { query: string; time: number }[] = [];
  await page.route("**/api/places?*", async (route) => {
    const query = new URL(route.request().url()).searchParams.get("q")!;
    requests.push({ query, time: Date.now() });
    await new Promise((resolve) =>
      setTimeout(resolve, query === "ba" ? 350 : 10),
    );
    await route
      .fulfill({
        json: {
          source: "osm",
          places: [
            {
              id: query,
              name: `Kết quả ${query}`,
              address: "Hà Nội",
              lat: 21,
              lng: 105.8,
            },
          ],
        },
      })
      .catch(() => {});
  });
  await page.goto("/dat-xe");
  const input = page.getByLabel("Điểm đến", { exact: true });
  const options = page.locator(".place-list").getByRole("option");
  await input.fill("n");
  await expect(options.filter({ hasText: "Sân bay Nội Bài" })).toBeVisible();
  const start = Date.now();
  await input.fill("ba");
  await expect
    .poll(() => requests.some((r) => r.query === "ba"), { timeout: 400 })
    .toBe(true);
  expect(requests.find((r) => r.query === "ba")!.time - start).toBeLessThan(
    400,
  );
  await input.fill("bac");
  await expect(options).toHaveText(["Kết quả bacHà Nội"]);
  await page.waitForTimeout(450);
  await expect(options).toHaveCount(1);
  await expect(options).toContainText(["Kết quả bac"]);
  await expect(input).toBeFocused();
});

test("GPS lấy tên địa điểm và địa chỉ từ tọa độ", async ({ page, context }) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 21.0018, longitude: 105.8396 });
  await page.route("**/api/places/reverse?*", route => route.fulfill({json:{place:{id:"osm-hospital",name:"Bệnh viện Bạch Mai",address:"78 Giải Phóng, Hà Nội",lat:21.002,lng:105.84}}}));
  await page.goto("/dat-xe");
  await page.getByLabel("Điểm đến",{exact:true}).click();
  await page.getByRole("button",{name:"Vị trí của tôi",exact:true}).click();
  await expect(page.getByLabel("Điểm đến",{exact:true})).toHaveValue("Bệnh viện Bạch Mai");
});

test("ghim bản đồ giữ tên địa điểm, địa chỉ và tọa độ ghim", async ({ page }) => {
  await page.route("**/api/places/reverse?*", async route => {
    await new Promise(resolve => setTimeout(resolve, 150));
    await route.fulfill({json:{place:{id:"osm-poi",name:"Trường Tiểu học Như Quỳnh",address:"Như Quỳnh, Hưng Yên",lat:20.98,lng:105.98}}});
  });
  await page.goto("/dat-xe");
  await page.getByRole("button",{name:"Chọn vị trí trên bản đồ",exact:true}).click();
  const map=page.locator('.location-map .leaflet-container');
  await map.waitFor();
  await map.click({position:{x:150,y:140}});
  await expect(page.locator('.location-selected strong')).toHaveText("Trường Tiểu học Như Quỳnh");
  await page.getByRole("button",{name:"Xác nhận điểm đến",exact:true}).click();
  await expect(page.getByLabel("Điểm đến",{exact:true})).toHaveValue("Trường Tiểu học Như Quỳnh");
});
