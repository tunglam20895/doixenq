import { VEHICLES } from "./data";
export function calculateFare(
  vehicleId: string,
  distanceKm: number,
  roundTrip = false,
) {
  const vehicle = VEHICLES.find((v) => v.id === vehicleId);
  if (
    !vehicle ||
    !Number.isFinite(distanceKm) ||
    distanceKm <= 0 ||
    distanceKm > 1500
  )
    throw new Error("Hành trình hoặc loại xe không hợp lệ.");
  const legs = roundTrip ? 2 : 1;
  const first = vehicle.opening;
  const middle = Math.max(0, Math.min(distanceKm, 30) - 1) * vehicle.perKm;
  const far = Math.max(0, distanceKm - 30) * vehicle.longKm;
  const oneWay = Math.round((first + middle + far) / 1000) * 1000;
  return {
    opening: first * legs,
    middle: Math.round(middle) * legs,
    far: Math.round(far) * legs,
    legs,
    total: oneWay * legs,
    distanceKm: Math.round(distanceKm * 10) / 10,
  };
}
export function validateDeparture(
  departure: string,
  returnAt?: string,
  roundTrip = false,
  durationMinutes = 0,
) {
  const start = Date.parse(departure);
  if (!Number.isFinite(start) || start < Date.now() + 10 * 60000)
    throw new Error("Vui lòng đặt giờ đón cách hiện tại ít nhất 10 phút.");
  if (start > Date.now() + 180 * 86400000)
    throw new Error("Vui lòng chọn chuyến trong 180 ngày tới.");
  if (
    roundTrip &&
    (!returnAt ||
      !Number.isFinite(Date.parse(returnAt)) ||
      Date.parse(returnAt) < start + durationMinutes * 60000)
  )
    throw new Error("Giờ về cần sau thời điểm dự kiến đến nơi.");
}
