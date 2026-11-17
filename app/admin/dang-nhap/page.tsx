import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/admin/auth";
import { configured } from "@/lib/supabase/backend";
import Login from "@/components/admin/Login";
import "../admin.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Đăng nhập quản trị",
  robots: { index: false, follow: false },
};
export default async function Page() {
  if (await currentAdmin()) redirect("/admin");
  return <Login ready={configured()} />;
}
