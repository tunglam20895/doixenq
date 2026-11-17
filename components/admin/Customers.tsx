"use client";
import { useState } from "react";
import { Plus, Pencil, Phone, ArrowUpRight } from "lucide-react";
import {
  api,
  useData,
  useDebounce,
  PageHeader,
  Loading,
  ErrorBox,
  Empty,
  SearchField,
  Pagination,
  Dialog,
  SaveButton,
  Status,
} from "./shared";
import type { Customer, AdminBooking } from "@/lib/admin/types";
import { money, tripDate } from "@/lib/data";
export default function Customers() {
  const [search, setSearch] = useState(""),
    [offset, setOffset] = useState(0),
    [editing, setEditing] = useState<Customer | null | undefined>(undefined),
    [view, setView] = useState<Customer | null>(null);
  const q = useDebounce(search);
  const { data, error, loading, reload } = useData<{
    items: Customer[];
    total: number;
  }>(`customers?search=${encodeURIComponent(q)}&offset=${offset}`);
  return (
    <>
      <PageHeader
        label="KHÁCH HÀNG"
        title="Nhớ từng khách, từng chuyến."
        description="Thông tin liên hệ và lịch sử đi xe, gom theo số điện thoại."
        action={
          <button
            className="admin-btn primary"
            onClick={() => setEditing(null)}
          >
            <Plus size={17} />
            Thêm khách hàng
          </button>
        }
      />
      <section className="admin-panel">
        <div className="admin-toolbar">
          <SearchField
            value={search}
            onChange={(v) => {
              setSearch(v);
              setOffset(0);
            }}
            placeholder="Tìm tên hoặc số điện thoại"
          />
          <span>{data?.total || 0} khách hàng</span>
        </div>
        {error ? (
          <ErrorBox message={error} onRetry={reload} />
        ) : loading && !data ? (
          <Loading />
        ) : data?.items.length ? (
          <>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Khách hàng</th>
                    <th>Số điện thoại</th>
                    <th>Tổng chuyến</th>
                    <th>Đã đi</th>
                    <th>Tổng tiền đã đi</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.name}</strong>
                        <span>{c.note || "Chưa có ghi chú"}</span>
                      </td>
                      <td>
                        <a href={"tel:" + c.phone}>{c.phone}</a>
                      </td>
                      <td>{c.bookings}</td>
                      <td>
                        <strong>{c.completed}</strong>
                        <span>{c.cancelled} chuyến hủy</span>
                      </td>
                      <td>
                        <strong>{money(c.total_spent)}</strong>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            className="admin-btn subtle"
                            onClick={() => setView(c)}
                          >
                            Xem chuyến <ArrowUpRight size={14} />
                          </button>
                          <button
                            className="admin-icon-btn"
                            onClick={() => setEditing(c)}
                            aria-label={"Sửa khách " + c.name}
                          >
                            <Pencil size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              total={data.total}
              offset={offset}
              onChange={setOffset}
            />
          </>
        ) : (
          <Empty
            title="Chưa có khách hàng phù hợp"
            description="Khách sẽ được tạo tự động khi có chuyến đặt mới. Bạn cũng có thể thêm khách trực tiếp."
          />
        )}
      </section>
      <p className="admin-footnote">
        “Đã đi” và “Tổng tiền đã đi” chỉ tính chuyến hoàn thành; không cộng
        chuyến đã đặt hoặc đã hủy.
      </p>
      {editing !== undefined ? (
        <CustomerForm
          customer={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            reload();
          }}
        />
      ) : null}
      {view ? (
        <CustomerTrips customer={view} onClose={() => setView(null)} />
      ) : null}
    </>
  );
}
function CustomerForm({
  customer,
  onClose,
  onSaved,
}: {
  customer: Customer | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(customer?.name || ""),
    [phone, setPhone] = useState(customer?.phone || ""),
    [note, setNote] = useState(customer?.note || ""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("customers", {
        ...(customer ? { id: customer.id } : {}),
        name,
        phone,
        note,
      });
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      title={customer ? "Sửa khách hàng" : "Thêm khách hàng"}
      onClose={onClose}
    >
      <form className="admin-form" onSubmit={submit}>
        <label className="admin-field">
          Họ và tên
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={2}
            maxLength={120}
            required
          />
        </label>
        <label className="admin-field">
          Số điện thoại
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            maxLength={16}
          />
        </label>
        <label className="admin-field">
          Ghi chú riêng
          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={2000}
            placeholder="Nhu cầu thường đi, điểm đón quen…"
          />
        </label>
        {customer ? (
          <p className="admin-footnote">
            Đổi số điện thoại hồ sơ không sửa số điện thoại đã ghi nhận ở các
            chuyến cũ.
          </p>
        ) : null}
        {error ? (
          <p className="admin-alert error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="admin-form-actions">
          <button type="button" className="admin-btn" onClick={onClose}>
            Đóng
          </button>
          <SaveButton busy={busy} />
        </div>
      </form>
    </Dialog>
  );
}
function CustomerTrips({
  customer,
  onClose,
}: {
  customer: Customer;
  onClose: () => void;
}) {
  const [offset, setOffset] = useState(0);
  const { data, error, loading, reload } = useData<{
    items: AdminBooking[];
    total: number;
  }>(`bookings?customerId=${customer.id}&offset=${offset}`);
  return (
    <Dialog
      wide
      title={customer.name}
      subtitle={customer.phone}
      onClose={onClose}
    >
      <div className="admin-customer-summary">
        <div>
          <span>Chuyến đã đi</span>
          <strong>{customer.completed}</strong>
        </div>
        <div>
          <span>Tổng tiền đã đi</span>
          <strong>{money(customer.total_spent)}</strong>
        </div>
        <div>
          <span>Chuyến đã hủy</span>
          <strong>{customer.cancelled}</strong>
        </div>
      </div>
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : loading ? (
        <Loading />
      ) : data?.items.length ? (
        <>
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Chuyến / giờ đón</th>
                  <th>Hành trình</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <strong>{b.id}</strong>
                      <span>{tripDate(b.departure)}</span>
                    </td>
                    <td>
                      <strong>{b.pickup.name}</strong>
                      <span>→ {b.destination.name}</span>
                    </td>
                    <td>{money(b.actualTotal ?? b.total)}</td>
                    <td>
                      <Status status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination offset={offset} total={data.total} onChange={setOffset} />
        </>
      ) : (
        <Empty
          title="Khách chưa có chuyến đi"
          description="Lịch sử sẽ hiển thị khi có chuyến liên kết số điện thoại này."
        />
      )}
    </Dialog>
  );
}
