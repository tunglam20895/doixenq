import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
let client: SupabaseClient | undefined;
export const configured = () =>
  !!(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_PUBLISHABLE_KEY &&
    process.env.SUPABASE_BACKEND_SECRET
  );
export async function backend<T = unknown>(
  action: string,
  data: Record<string, unknown> = {},
): Promise<T> {
  if (!configured()) throw new Error("SUPABASE_NOT_CONFIGURED");
  client ??= createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            cache: "no-store",
            signal: AbortSignal.timeout(15000),
          }),
      },
    },
  );
  const { data: result, error } = await client.rpc("fleet_backend", {
    p_secret: process.env.SUPABASE_BACKEND_SECRET!,
    p_action: action,
    p_data: data,
  });
  if (error) {
    if (error.message.includes("VERSION_CONFLICT"))
      throw new Error("VERSION_CONFLICT");
    if (error.code === "23505") throw new Error("DUPLICATE_PHONE");
    if (error.message.includes("NOT_FOUND")) throw new Error("NOT_FOUND");
    throw new Error("SUPABASE_UNAVAILABLE");
  }
  return result as T;
}
