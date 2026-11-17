import { test } from "node:test";
import assert from "node:assert/strict";
import { localPlaces } from "../lib/place-search";
test("tìm địa điểm không dấu và không phân biệt hoa thường", () => {
  assert.ok(localPlaces("NHU QUYNH").some((p) => p.id === "nhu-quynh"));
  assert.ok(localPlaces("noi bai").length > 0);
});
test("tìm nhiều từ trên tên và địa chỉ không phụ thuộc thứ tự", () => {
  assert.deepEqual(localPlaces("quynh nhu"), localPlaces("nhu quynh"));
  assert.equal(localPlaces("dia diem khong ton tai zzz").length, 0);
});

test("đọc địa chỉ Photon, loại kết quả ngoài Việt Nam và trùng lặp", async () => {
  const { photonPlaces } = await import("../lib/place-search");
  const feature = {
    properties: {
      osm_type: "W",
      osm_id: 123,
      name: "Bệnh viện Bạch Mai",
      housenumber: "78",
      street: "Giải Phóng",
      city: "Hà Nội",
      state: "Hà Nội",
      countrycode: "VN",
    },
    geometry: { coordinates: [105.8396722, 21.0018168] },
  };
  const places = photonPlaces({
    features: [
      feature,
      feature,
      { ...feature, geometry: { coordinates: [2.35, 48.85] } },
      { ...feature, properties: { ...feature.properties, countrycode: "LA" } },
      {},
    ],
  });
  assert.equal(places.length, 1);
  assert.equal(places[0].name, "Bệnh viện Bạch Mai");
  assert.equal(places[0].address, "78 Giải Phóng, Hà Nội");
  assert.equal(places[0].lat, 21.0018168);
});

test("phiên gợi ý không cần crypto.randomUUID trên HTTP nội mạng", async () => {
  const { searchSession } = await import("../lib/place-search");
  assert.match(
    searchSession(),
    /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/,
  );
  assert.notEqual(searchSession(), searchSession());
});
