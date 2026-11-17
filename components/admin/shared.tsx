"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { STATUS_LABELS } from "@/lib/admin/types";
export async function api<T>(path: string, body?: unknown): Promise<T> {
  const r = await fetch("/api/admin/" + path, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store",
  });
  const d = await r.json();
  if (!r.ok) {
    if (r.status === 401 && typeof window !== "undefined") {
      window.location.assign("/admin/dang-nhap");
    }
    throw new Error(d.error || "Chưa thể tải dữ liệu.");
  }
  return d as T;
}
export function useData<T>(path: string) {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [revision, setRevision] = useState(0);
  const reload = () => setRevision((v) => v + 1);
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === "visible") setRevision((v) => v + 1);
    }, 30000);
    return () => clearInterval(t);
  }, [path]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api<T>(path)
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [path, revision]);
  return { data, error, loading, reload };
}
export function PageHeader({
  label,
  title,
  description,
  action,
}: {
  label: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="admin-page-header">
      <div>
        <span className="admin-label">{label}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Loading() {
  return (
    <div className="admin-loading" role="status">
      <Loader2 className="spin" size={23} />
      Đang tải dữ liệu…
    </div>
  );
}
export function ErrorBox({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="admin-alert error" role="alert">
      {message}
      <button onClick={onRetry}>
        <RefreshCw size={15} />
        Thử lại
      </button>
    </div>
  );
}
export function Empty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="admin-empty">
      <span>
        <Search size={30} strokeWidth={1.4} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
export function Status({ status }: { status: string }) {
  return (
    <span className={"admin-status " + status}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="admin-search">
      <Search size={18} />
      <input
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
export function useDebounce(value: string) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), 300);
    return () => clearTimeout(t);
  }, [value]);
  return v;
}
export function Pagination({
  offset,
  total,
  onChange,
}: {
  offset: number;
  total: number;
  onChange: (offset: number) => void;
}) {
  return (
    <div className="admin-pagination">
      <span>
        {total
          ? `${offset + 1}–${Math.min(offset + 30, total)} / ${total}`
          : "0 kết quả"}
      </span>
      <div>
        <button
          className="admin-icon-btn"
          aria-label="Trang trước"
          disabled={offset === 0}
          onClick={() => onChange(Math.max(0, offset - 30))}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          className="admin-icon-btn"
          aria-label="Trang tiếp"
          disabled={offset + 30 >= total}
          onClick={() => onChange(offset + 30)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
export function Dialog({
  title,
  subtitle,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={"admin-dialog " + (wide ? "wide" : "")}
      aria-label={title}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="admin-dialog-head">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        <button
          className="admin-icon-btn"
          aria-label="Đóng cửa sổ"
          onClick={onClose}
        >
          <X size={21} />
        </button>
      </div>
      <div className="admin-dialog-content">{children}</div>
    </dialog>
  );
}
export function SaveButton({
  busy,
  label = "Lưu thông tin",
}: {
  busy: boolean;
  label?: string;
}) {
  return (
    <button type="submit" className="admin-btn primary" disabled={busy}>
      {busy ? <Loader2 className="spin" size={17} /> : null}
      {busy ? "Đang lưu…" : label}
    </button>
  );
}
