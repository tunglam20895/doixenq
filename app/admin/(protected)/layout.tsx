import { requireAdmin } from "@/lib/admin/auth";
import AdminFrame from "@/components/admin/Frame";
import "../admin.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Quản trị đội xe",
  robots: { index: false, follow: false },
};
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  return (
    <AdminFrame username={admin.username} mustChange={admin.mustChange}>
      {children}
    </AdminFrame>
  );
}
