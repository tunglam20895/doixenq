import "server-only";
import { DRIVERS } from "./data";
import { backend, configured } from "./supabase/backend";
import type { Driver, PublicDriver } from "./admin/types";
export async function allDrivers() {
  return backend<Driver[]>("drivers");
}
export async function publicDrivers(): Promise<PublicDriver[]> {
  if (!configured()) return DRIVERS;
  const rows = await allDrivers();
  return rows
    .filter((d) => d.active && d.published)
    .map((d) => ({
      id: d.id,
      name: d.name,
      initials: d.name.trim().split(/\s+/).at(-1)!.slice(0, 1).toUpperCase(),
      color: "#dce6dd",
      vehicleIds: d.vehicle_ids,
      intro: d.intro,
      area: d.area,
      ...(d.hasAvatar
        ? {
            avatarUrl: `/api/drivers/${encodeURIComponent(d.id)}/photo?v=${encodeURIComponent(d.updated_at)}`,
          }
        : {}),
    }));
}
