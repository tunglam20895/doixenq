"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import {
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
  ArrowLeft,
} from "lucide-react";
export default function Login({ ready }: { ready: boolean }) {
  const [username, setUsername] = useState("admin"),
    [password, setPassword] = useState(""),
    [show, setShow] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      router.replace("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa thể đăng nhập.");
      setBusy(false);
    }
  }
  return (
    <main id="main" className="admin-login">
      <div className="admin-login-story">
        <Link href="/" className="admin-brand">
          <BrandLogo />
        </Link>
        <div>
          <span className="eyebrow">KHÔNG GIAN ĐIỀU HÀNH</span>
          <h1>
            Mỗi chuyến đi.
            <br />
            Đều trong tầm tay.
          </h1>
          <p>
            Khách hàng, tài xế và lịch chuyến.
            <br />
            Một nơi để bạn quản lý đội xe của mình.
          </p>
          <img
            src="/images/ertiga-black.webp"
            alt="Suzuki Ertiga màu đen"
            width="558"
            height="360"
          />
        </div>
        <span>
          <ShieldCheck size={17} />
          Dành riêng cho quản trị viên đội xe
        </span>
      </div>
      <div className="admin-login-form">
        <div className="admin-login-card">
          <span className="admin-label">NHƯ QUỲNH / ADMIN</span>
          <h2>Chào bạn trở lại.</h2>
          <p>Đăng nhập để quản lý hoạt động đội xe.</p>
          {!ready ? (
            <div className="admin-alert error">
              Chưa kết nối Supabase. Vui lòng hoàn tất cấu hình trước khi đăng
              nhập.
            </div>
          ) : null}
          <form onSubmit={submit}>
            <label className="admin-field">
              Tên đăng nhập
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                maxLength={40}
              />
            </label>
            <label className="admin-field">
              Mật khẩu
              <div className="admin-password-input">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  maxLength={128}
                />
                <button
                  type="button"
                  aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            {error ? (
              <p className="admin-alert error" role="alert">
                {error}
              </p>
            ) : null}
            <button
              className="admin-btn primary"
              disabled={busy || !ready}
              type="submit"
            >
              {busy ? <Loader2 size={18} className="spin" /> : null}Đăng nhập{" "}
              <ArrowRight size={18} />
            </button>
          </form>
          <Link href="/" className="admin-back">
            <ArrowLeft size={15} />
            Về website khách hàng
          </Link>
        </div>
      </div>
    </main>
  );
}
