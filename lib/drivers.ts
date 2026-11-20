import "server-only";
import { backend } from "./supabase/backend";
import type { Driver } from "./admin/types";
export async function allDrivers() {
  return backend<Driver[]>("drivers");
}
