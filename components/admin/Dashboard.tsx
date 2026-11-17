"use client";
import Link from "next/link";
import {
  Wallet,
  Route,
  Users,
  UserRound,
  ArrowUpRight,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  useData,
  PageHeader,
  Loading,
  ErrorBox,
  Empty,
  Status,
} from "./shared";
import type { Dashboard as Data } from "@/lib/admin/types";
import { money, tripDate } from "@/lib/data";
export default function Dashboard() {
  const { data, error, loading, reload } = useData<Data>("dashboard");
  const cards = data
    ? [
        {
          label: "Doanh thu hoàn thành",
          value: money(data.revenue),
          hint: "Theo số tiền thực tế của chuyến",
          Icon: Wallet,
        },
        {
          label: "Chuyến đã đặt",
          value: data.booked,
          hint: "Chờ thực hiện / xác nhận",
          Icon: Route,
        },
        {
          label: "Khách hàng",
          value: data.customers,
          hint: "Khách có trong hệ thống",
          Icon: Users,
        },
        {
          label: "Tài xế hoạt động",
          value: data.drivers,
          hint: "Sẵn sàng được phân chuyến",
          Icon: UserRound,
        },
      ]
    : [];
  const max = Math.max(1, ...(data?.chart.map((x) => x.revenue) || []));
  return (
    <>
      <PageHeader
        label="TỔNG QUAN ĐỘI XE"
        title="Hôm nay, mình đi đâu?"
        description="Theo dõi khách hàng và những chuyến đi của đội xe."
        action={
          <Link className="admin-btn primary" href="/admin/chuyen-di?new=1">
            <Plus size={17} />
            Thêm chuyến đi
          </Link>
        }
      />
      {error ? <ErrorBox message={error} onRetry={reload} /> : null}
      {loading && !data ? <Loading /> : null}
      {data ? (
        <>
          <div className="admin-metrics">
            {cards.map(({ label, value, hint, Icon }) => (
              <div className="admin-metric" key={label}>
                <div>
                  <span>{label}</span>
                  <Icon size={18} />
                </div>
                <strong>{value}</strong>
                <small>{hint}</small>
              </div>
            ))}
          </div>
          <div className="admin-overview-grid">
            <section className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <h2>Doanh thu 7 ngày</h2>
                  <p>Chỉ tính chuyến hoàn thành, theo ngày hoàn thành</p>
                </div>
                <span className="admin-live">
                  <span />
                  Dữ liệu thực
                </span>
              </div>
              <div className="admin-chart">
                {data.chart.map((c) => (
                  <div key={c.date}>
                    <span>{c.revenue ? money(c.revenue) : "0đ"}</span>
                    <div>
                      <i
                        style={{
                          height: `${c.revenue ? Math.max(4, (c.revenue / max) * 100) : 2}%`,
                        }}
                      />
                    </div>
                    <small>
                      {new Date(c.date + "T00:00:00+07:00").toLocaleDateString(
                        "vi-VN",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          timeZone: "Asia/Ho_Chi_Minh",
                        },
                      )}
                    </small>
                  </div>
                ))}
              </div>
            </section>
            <section className="admin-panel admin-today">
              <span className="admin-label">NHỊP CHUYẾN ĐI</span>
              <h2>
                {data.today}
                <small>chuyến có lịch hôm nay</small>
              </h2>
              <div>
                <span>
                  <Clock size={18} />
                  Đã đặt
                </span>
                <strong>{data.booked}</strong>
              </div>
              <div>
                <span>
                  <CheckCircle2 size={18} />
                  Hoàn thành
                </span>
                <strong>{data.completed}</strong>
              </div>
              <div>
                <span>
                  <XCircle size={18} />
                  Đã hủy
                </span>
                <strong>{data.cancelled}</strong>
              </div>
              <Link href="/admin/chuyen-di">
                Quản lý chuyến đi <ArrowUpRight size={17} />
              </Link>
            </section>
          </div>
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>Chuyến được tạo gần đây</h2>
                <p>Yêu cầu từ website và chuyến nhập trực tiếp</p>
              </div>
              <Link href="/admin/chuyen-di" className="admin-link">
                Xem tất cả <ArrowUpRight size={16} />
              </Link>
            </div>
            {data.recent.length ? (
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Khách hàng</th>
                      <th>Hành trình</th>
                      <th>Giờ đón</th>
                      <th>Giá chuyến</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <strong>{b.customer}</strong>
                          <span>{b.phone}</span>
                        </td>
                        <td>
                          <strong>{b.pickup.name}</strong>
                          <span>→ {b.destination.name}</span>
                        </td>
                        <td>{tripDate(b.departure)}</td>
                        <td>{money(b.actualTotal ?? b.total)}</td>
                        <td>
                          <Status status={b.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty
                title="Chưa có chuyến đi"
                description="Chuyến khách đặt trên website sẽ xuất hiện ở đây. Bạn cũng có thể thêm chuyến nhận qua điện thoại."
              />
            )}
          </section>
        </>
      ) : null}
    </>
  );
}
