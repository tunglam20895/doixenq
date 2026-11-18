import { ESTIMATED_FARE_NOTE } from "@/lib/fare-copy";
import Link from "next/link";
import { ArrowUpRight, Info } from "lucide-react";
import { VEHICLES, money } from "@/lib/data";
export const metadata = {
  title: "Giá taxi Hưng Yên & cước xe 5–7 chỗ",
  description:
    "Tham khảo bảng cước mẫu xe 5–7 chỗ tại Hưng Yên, Yên Mỹ, Mỹ Hào và các khu vực phục vụ, cách tính giá theo km và chi phí phát sinh. Liên hệ đội xe để xác nhận giá thực tế.",
  alternates: { canonical: "/bang-gia" },
};
export default function Page() {
  return (
    <main id="main" className="content-page">
      <div className="wrap">
        <span className="eyebrow">CHI PHÍ CHO HÀNH TRÌNH</span>
        <h1>Tham khảo chi phí, an tâm đặt xe.</h1>
        <p className="page-lead">
          Bảng cước mẫu để bạn trải nghiệm đặt xe.
          <br />
          {ESTIMATED_FARE_NOTE}
        </p>
        <div className="info-note">
          <Info size={19} />
          Đây chưa phải bảng giá kinh doanh chính thức của đội xe Như Quỳnh Hưng
          Yên.
        </div>
        <div className="price-table-wrap">
          <table className="price-table">
            <caption>Bảng giá mẫu theo dòng xe — đơn vị VNĐ</caption>
            <thead>
              <tr>
                <th>Dòng xe</th>
                <th>Km đầu tiên</th>
                <th>Trên 1 đến 30 km</th>
                <th>Trên 30 km</th>
              </tr>
            </thead>
            <tbody>
              {VEHICLES.map((v) => (
                <tr key={v.id}>
                  <th>
                    {v.name}
                    <span>{v.seats} chỗ</span>
                  </th>
                  <td>{money(v.opening)}</td>
                  <td>{money(v.perKm)} / km</td>
                  <td>{money(v.longKm)} / km</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="policy-grid">
          <article>
            <h2>Cách tính tiền</h2>
            <p>
              Cước một chiều = giá km đầu + số km trên 1 đến 30 × đơn giá bậc
              hai + số km trên 30 × đơn giá đường dài. Cước được làm tròn đến
              1.000đ gần nhất.
            </p>
            <p>
              Ví dụ Limo Green đi 40 km: 17.000 + 29 × 12.000 + 10 × 10.000 ={" "}
              <strong>465.000đ</strong>.
            </p>
          </article>
          <article>
            <h2>Khứ hồi & phát sinh</h2>
            <p>
              Giá mẫu khứ hồi tính hai lượt trên cùng hành trình. Chưa có giảm
              giá khứ hồi tự động. Chi phí chờ, cầu đường, bãi đỗ và thay đổi
              hành trình chưa bao gồm.
            </p>
            <p>
              Quãng đường là đường ô tô do dịch vụ bản đồ trả về; thời gian đi
              chỉ mang tính tham khảo.
            </p>
          </article>
        </div>
        <Link className="btn btn-primary" href="/dat-xe">
          Tính giá hành trình của bạn <ArrowUpRight size={18} />
        </Link>
      </div>
    </main>
  );
}
