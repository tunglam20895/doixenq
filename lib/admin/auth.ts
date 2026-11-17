import "server-only";
import { cookies } from "next/headers";
import { randomBytes, createHash } from "node:crypto";
import { backend, configured } from "@/lib/supabase/backend";
import { sign, verify } from "@/lib/security";
import { redirect } from "next/navigation";
const COOKIE = "nq_admin_session";
const LIFE = 8 * 3600;
type Session = { kind: "admin"; id: string; expires: number };
export type Admin = {
  username: string;
  mustChange: boolean;
  sessionId: string;
};
const fingerprint = (id: string) =>
  createHash("sha256").update(id).digest("hex");
export async function currentAdmin(): Promise<Admin | null> {
  if (!configured()) return null;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  try {
    const s = verify<Session>(raw);
    if (s.kind !== "admin" || s.expires < Date.now()) return null;
    const account = await backend<{
      username: string;
      mustChange: boolean;
    } | null>("auth_session", { id: fingerprint(s.id) });
    return account ? { ...account, sessionId: fingerprint(s.id) } : null;
  } catch {
    return null;
  }
}
export async function requireAdmin() {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/dang-nhap");
  return admin;
}
export async function startSession(username: string) {
  const id = randomBytes(32).toString("hex"),
    expires = Date.now() + LIFE * 1000;
  await backend("auth_session_create", {
    id: fingerprint(id),
    username,
    expires: new Date(expires).toISOString(),
  });
  (await cookies()).set(COOKIE, sign<Session>({ kind: "admin", id, expires }), {
    httpOnly: true,
    secure: process.env.APP_URL?.startsWith("https://") || !!process.env.VERCEL,
    sameSite: "strict",
    path: "/",
    maxAge: LIFE,
  });
}
export async function endSession() {
  const admin = await currentAdmin();
  if (admin) await backend("auth_logout", { id: admin.sessionId });
  (await cookies()).delete(COOKIE);
}
