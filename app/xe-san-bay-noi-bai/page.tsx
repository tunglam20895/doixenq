import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT } from "@/lib/contact";
import { ESTIMATED_FARE_NOTE, FARE_EXCLUSIONS } from "@/lib/fare-copy";
import { serviceAreaText } from "@/lib/service-areas";

export const metadata: Metadata = {
  title: "Taxi Hưng Yên đi Nội Bài — xe 5–7 chỗ",
  description:
    "Đặt taxi Hưng Yên đi sân bay Nội Bài, đón tại Như Quỳnh, Văn Lâm, Phố Nối, Yên Mỹ, Mỹ Hào. Xe 5–7 chỗ, giá dự kiến theo hành trình. Gọi 0977823111.",
  alternates: { canonical: "/xe-san-bay-noi-bai" },
};

export default function Page() {
  return (
    <main id="main" className="content-page">
      <div className="wrap policy-content">
        <span className="eyebrow">ĐỘI XE NHƯ QUỲNH · XE SÂN BAY</span>
        <h1>Taxi Hưng Yên đi Nội Bài, đặt xe theo giờ bay của bạn.</h1>
        <p className="page-lead">
          Nhận yêu cầu xe 5–7 chỗ tại {serviceAreaText}. Bạn cung cấp điểm đón,
          giờ đi và hành lý; tài xế liên hệ xác nhận lịch và báo giá chính thức
          trước chuyến. Nên đặt trước để đội xe kiểm tra khả năng sắp xếp.
        </p>
        <p>
          <a href={CONTACT.telephone}>Gọi đặt xe sân bay: {CONTACT.phone}</a>
          {" · "}
          <a href={CONTACT.zalo}>Trao đổi hành trình qua Zalo</a>
        </p>
        <Link href="/dat-xe?to=noi-bai" className="btn btn-primary">
          Chọn điểm đón & xem giá dự kiến
        </Link>
        <article>
          <h2>Đặt xe từ Văn Lâm, Như Quỳnh, Phố Nối, Yên Mỹ và Mỹ Hào</h2>
          <p>
            Nhập đúng địa chỉ đón thay vì chỉ tên khu vực, sau đó chọn sân bay
            Nội Bài làm điểm đến. Nếu đón trong khu dân cư hoặc nhà máy, ghi chú
            cổng, số nhà hoặc ghim vị trí trên bản đồ để tài xế trao đổi điểm
            hẹn thuận tiện. Như Quỳnh là tên đội xe, không giới hạn nơi đón.
          </p>
          <p>
            Với nhiều điểm đón trong cùng chuyến, hãy ghi chú từng điểm để tài
            xế kiểm tra tuyến đi và báo lại chi phí. Đặt xe trên website giúp
            lưu lịch trình; xe và giờ đón cần được xác nhận trực tiếp.
          </p>
        </article>
        <article>
          <h2>Giá taxi Hưng Yên đi Nội Bài bao nhiêu?</h2>
          <p>
            Chi phí phụ thuộc địa chỉ đón, dòng xe, một chiều hay khứ hồi và các
            yêu cầu của chuyến đi. Website tính giá dự kiến theo quãng đường ô
            tô và bảng cước tham khảo, không áp dụng một giá cố định cho mọi
            điểm đón tại Hưng Yên.
          </p>
          <p>
            {ESTIMATED_FARE_NOTE} {FARE_EXCLUSIONS}
          </p>
          <Link href="/bang-gia">Xem bảng cước và cách tính giá xe</Link>
        </article>
        <article>
          <h2>Chọn xe 5 chỗ hay 7 chỗ khi đi sân bay?</h2>
          <p>
            Xem số hành khách tối đa và sức chứa hành lý của từng dòng xe trên
            trang đặt xe; số chỗ của xe bao gồm tài xế. Ghi rõ số vali, đồ cồng
            kềnh hoặc nhu cầu riêng để đội xe kiểm tra xe phù hợp. Nếu muốn đi
            xe điện, bạn có thể chọn các dòng VinFast hiện có trên website và
            chờ đội xe xác nhận lịch.
          </p>
          <Link href="/#doi-xe">Xem xe 5–7 chỗ và sức chứa hành lý</Link>
        </article>
        <article>
          <h2>Cần cung cấp gì để đón đúng giờ bay?</h2>
          <ul>
            <li>Địa chỉ đón, ngày đi và giờ đón mong muốn.</li>
            <li>Giờ bay, số hiệu chuyến bay và nhà ga theo thông tin vé.</li>
            <li>Số hành khách, số vali và những điểm dừng thêm nếu có.</li>
            <li>Số điện thoại để tài xế liên hệ xác nhận.</li>
          </ul>
          <p>
            Thời gian bản đồ chỉ là tham khảo. Khi thống nhất lịch, cần tính cả
            giao thông, thời gian làm thủ tục và yêu cầu của hãng bay. Kiểm tra
            nhà ga trên vé hoặc thông báo của hãng trước ngày đi.
          </p>
        </article>
        <article>
          <h2>Có thể đặt xe đón từ Nội Bài về Hưng Yên không?</h2>
          <p>
            Bạn có thể gửi yêu cầu đón chiều về bằng cách chọn Nội Bài làm điểm
            đón, nhập địa chỉ đến và ghi chú giờ hạ cánh, số hiệu chuyến bay,
            nhà ga. Đội xe sẽ kiểm tra lịch, trao đổi điểm hẹn được phép đón
            khách và chi phí chờ nếu có. Với chuyến khứ hồi, chọn thêm giờ đón
            về trong biểu mẫu.
          </p>
          <Link href="/dat-xe?from=noi-bai">Gửi yêu cầu xe từ Nội Bài về</Link>
        </article>
        <article>
          <h2>Số điện thoại đặt taxi đi Nội Bài là gì?</h2>
          <p>
            Gọi <a href={CONTACT.telephone}>{CONTACT.phone}</a> hoặc{" "}
            <a href={CONTACT.zalo}>nhắn Zalo Đội xe Như Quỳnh</a> để trao đổi
            lịch, xe và giá. Bạn cũng có thể đặt online bằng họ tên và số điện
            thoại, không cần cài ứng dụng hay tạo tài khoản.
          </p>
          <p>
            Sau khi gửi lịch, giữ đường dẫn tra cứu riêng và điện thoại liên lạc
            để nhận thông tin từ tài xế. Không chia sẻ đường dẫn tra cứu chuyến
            cho người không liên quan.
          </p>
        </article>
        <Link href="/dich-vu">Xem các khu vực phục vụ và tuyến xe khác</Link>
      </div>
    </main>
  );
}
