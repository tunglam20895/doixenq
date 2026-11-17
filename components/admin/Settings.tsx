"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { api, PageHeader, SaveButton } from "./shared";
export default function Settings() {
  const [current, setCurrent] = useState(""),
    [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(false);
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (password !== confirm) {
      setError("Hai lần nhập mật khẩu mới chưa khớp.");
      return;
    }
    setBusy(true);
    try {
      await api("password", { current, password });
      setCurrent("");
      setPassword("");
      setConfirm("");
      setSuccess(true);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        label="CÀI ĐẶT"
        title="Bảo vệ khu vực quản trị."
        description="Tài khoản đăng nhập bằng tên người dùng, không cần email."
      />
      <section className="admin-panel admin-settings">
        <div className="admin-panel-head">
          <div>
            <h2>Đổi mật khẩu</h2>
            <p>Tên đăng nhập: admin</p>
          </div>
          <ShieldCheck size={24} />
        </div>
        <form onSubmit={submit}>
          <label className="admin-field">
            Mật khẩu hiện tại
            <input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
              required
              maxLength={128}
            />
          </label>
          <label className="admin-field">
            Mật khẩu mới
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={10}
              maxLength={128}
              required
            />
            <small>
              Tối thiểu 10 ký tự. Nên dùng mật khẩu riêng cho đội xe.
            </small>
          </label>
          <label className="admin-field">
            Nhập lại mật khẩu mới
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
              maxLength={128}
            />
          </label>
          {error ? (
            <p className="admin-alert error" role="alert">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="admin-alert success" role="status">
              Đã đổi mật khẩu. Các phiên đăng nhập khác đã được thu hồi.
            </p>
          ) : null}
          <SaveButton busy={busy} label="Đổi mật khẩu" />
        </form>
      </section>
    </>
  );
}
