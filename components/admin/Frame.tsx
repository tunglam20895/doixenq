"use client";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Route,
  UserRound,
  Settings,
  LogOut,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
const links = [
  ["/admin", "Tổng quan", LayoutDashboard],
  ["/admin/chuyen-di", "Chuyến đi", Route],
  ["/admin/khach-hang", "Khách hàng", Users],
  ["/admin/tai-xe", "Tài xế", UserRound],
  ["/admin/cai-dat", "Cài đặt", Settings],
] as const;
export default function AdminFrame({
  children,
  username,
  mustChange,
}: {
  children: React.ReactNode;
  username: string;
  mustChange: boolean;
}) {
  const path = usePathname(),
    router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function logout() {
    setBusy(true);
    try {
      const r = await fetch("/api/admin/logout", { method: "POST" });
      if (!r.ok) throw Error();
      router.replace("/admin/dang-nhap");
      router.refresh();
    } catch {
      setError("Chưa thể đăng xuất. Vui lòng thử lại.");
      setBusy(false);
    }
  }
  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          <BrandLogo />
        </Link>
        <span className="admin-nav-label">KHÔNG GIAN ĐIỀU HÀNH</span>
        <nav aria-label="Điều hướng quản trị">
          {links.map(([href, label, Icon]) => (
            <Link
              href={href}
              key={href}
              className={path === href ? "active" : ""}
              aria-current={path === href ? "page" : undefined}
            >
              <Icon size={19} />
              {label}
              {path === href ? <ChevronRight size={15} /> : null}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <span>
            <ShieldCheck size={17} />
            Khu vực quản trị riêng
          </span>
          <Link href="/" target="_blank">
            Mở website khách hàng <ArrowUpRight size={16} />
          </Link>
        </div>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <div>
            <span>Đội xe Như Quỳnh Hưng Yên</span>
            <small>Quản lý khách hàng & hành trình</small>
          </div>
          <div className="admin-account">
            <span className="admin-account-avatar">A</span>
            <span>
              {username}
              <small>Quản trị viên</small>
            </span>
            <button
              className="admin-icon-btn"
              onClick={logout}
              disabled={busy}
              aria-label="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        {error ? (
          <div className="admin-alert error" role="alert">
            {error}
          </div>
        ) : null}
        {mustChange && path !== "/admin/cai-dat" ? (
          <div className="admin-password-notice">
            Bạn đang dùng mật khẩu ban đầu.{" "}
            <Link href="/admin/cai-dat">Đổi mật khẩu</Link>
          </div>
        ) : null}
        <main id="main" className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
