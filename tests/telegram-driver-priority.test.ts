import { test } from "node:test";
import assert from "node:assert/strict";
import { driverPriorityLines } from "../lib/telegram-driver-priority";
const driver = (id: string, extra = {}) => ({
  id,
  name: `Tài xế ${id}`,
  phone: "0900000000",
  active: true,
  vehicle_ids: ["limo"],
  created_at: "2026-01-01",
  ...extra,
});
const trip = (id: string, driverId: string, total: number, extra = {}) => ({
  id,
  driverId,
  status: "completed" as const,
  total,
  ...extra,
});
const auto = { driverId: "auto", vehicleId: "limo" };

test("auto: xếp 3 tài xế ít doanh thu nhất, có tài xế chưa có chuyến, đọc đủ các trang", async () => {
  const offsets: number[] = [];
  const result = await driverPriorityLines(auto, {
    drivers: async () => [
      driver("a"),
      driver("b"),
      driver("c"),
      driver("d"),
      driver("off", { active: false }),
      driver("other", { vehicle_ids: ["vf5"] }),
    ],
    completed: async (offset) => {
      offsets.push(offset);
      return {
        total: 5,
        items:
          offset === 0
            ? [
                trip("1", "a", 900000, { actualTotal: 100000 }),
                trip("2", "b", 200000),
              ]
            : [
                trip("3", "c", 50000),
                trip("4", "c", 100000, { status: "cancelled" as const }),
                trip("5", "b", 900000, { actualTotal: 0 }),
              ],
      };
    },
  });
  assert.deepEqual(offsets, [0, 2]);
  assert.match(result[1], /^1\. Tài xế d/);
  assert.match(result[2], /^2\. Tài xế c/);
  assert.match(result[3], /^3\. Tài xế a/);
  assert.equal(result.length, 5);
  assert.ok(!result.join("\n").includes("Tài xế off"));
  assert.ok(!result.join("\n").includes("Tài xế other"));
});
test("khách chọn tài xế: không đọc dữ liệu và không thêm gợi ý", async () => {
  const fail = async (): Promise<never> => {
    throw new Error("must not query");
  };
  assert.deepEqual(
    await driverPriorityLines(
      { ...auto, driverId: "chosen" },
      { drivers: fail, completed: fail },
    ),
    [],
  );
});
test("đồng doanh thu: ưu tiên hồ sơ tạo trước, giữ thứ tự ổn định; có ít hơn 3 tài xế", async () => {
  const result = await driverPriorityLines(auto, {
    drivers: async () => [
      driver("b"),
      driver("a", { created_at: "2025-01-01" }),
    ],
    completed: async () => ({ total: 0, items: [] }),
  });
  assert.match(result[1], /^1\. Tài xế a/);
  assert.match(result[2], /^2\. Tài xế b/);
  assert.equal(result.length, 4);
});
test("lỗi hoặc dữ liệu thiếu: thông báo không có xếp hạng, không làm mất cảnh báo đặt xe", async () => {
  const result = await driverPriorityLines(auto, {
    drivers: async () => [driver("a")],
    completed: async () => {
      throw new Error("database unavailable");
    },
  });
  assert.match(result[0], /chưa tải được doanh thu/);
  const incomplete = await driverPriorityLines(auto, {
    drivers: async () => [driver("a")],
    completed: async () => ({ total: 1, items: [] }),
  });
  assert.match(incomplete[0], /chưa tải được doanh thu/);
});
test("không có tài xế phù hợp: không tạo đề xuất từ dữ liệu mẫu", async () => {
  const result = await driverPriorityLines(auto, {
    drivers: async () => [],
    completed: async () => {
      throw new Error("must not query");
    },
  });
  assert.match(result[0], /chưa có tài xế/);
});
