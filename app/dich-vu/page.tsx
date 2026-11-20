import { serviceAreaText, taxiAreaLinks } from "@/lib/service-areas";
import Link from "next/link";
import { CONTACT } from "@/lib/contact";

export const metadata = {
  title: "Taxi Hưng Yên, Yên Mỹ, Mỹ Hào & các khu vực phục vụ",
  description: `Đặt taxi tại ${serviceAreaText}. Đội xe Như Quỳnh có xe 5–7 chỗ đi Nội Bài, Hà Nội và liên tỉnh. Liên hệ 0977823111.`,
  alternates: { canonical: "/dich-vu" },
};

export default function Page() {
  return (
    <main id="main" className="content-page">
      <div className="wrap policy-content">
        <span className="eyebrow">CHỌN CHUYẾN ĐI CỦA BẠN</span>
        <h1>Taxi Hưng Yên — Đội xe Như Quỳnh đón bạn ở nhiều khu vực.</h1>
        <p className="page-lead">
          Như Quỳnh là tên đội xe. Chúng tôi nhận đón tại {serviceAreaText} và
          khu vực lân cận, đi Nội Bài, Hà Nội và các tỉnh. Bạn chọn hành trình,
          thời gian và dòng xe mong muốn; đội xe kiểm tra lịch và liên hệ xác
          nhận trước chuyến đi.
        </p>
        <p>
          Gọi đặt taxi Hưng Yên: <a href={CONTACT.telephone}>{CONTACT.phone}</a>
          {" · "}
          <a href={CONTACT.zalo}>Nhắn Zalo</a>
        </p>
        <nav aria-label="Trang hướng dẫn theo khu vực">
          <h2>Chọn khu vực bạn muốn đặt taxi</h2>
          <ul>
            {taxiAreaLinks.map((area) => (
              <li key={area.href}>
                <Link href={area.href}>{area.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Dịch vụ xe">
          <ul>
            <li>
              <a href="#taxi-hung-yen">Taxi Hưng Yên</a>
            </li>
            <li>
              <a href="#taxi-yen-my">Taxi Yên Mỹ</a>
            </li>
            <li>
              <a href="#taxi-my-hao">Taxi Mỹ Hào</a>
            </li>
            <li>
              <a href="#taxi-nhu-quynh">Taxi Như Quỳnh, Văn Lâm</a>
            </li>
            <li>
              <a href="#taxi-pho-noi">Taxi Phố Nối</a>
            </li>
            <li>
              <a href="#xe-noi-bai">Xe đi sân bay Nội Bài</a>
            </li>
            <li>
              <a href="#xe-ha-noi">Xe đi Hà Nội</a>
            </li>
            <li>
              <a href="#xe-lien-tinh">Xe liên tỉnh, một chiều & khứ hồi</a>
            </li>
          </ul>
        </nav>
        <article id="taxi-hung-yen">
          <h2>Đặt taxi Hưng Yên</h2>
          <p>
            Đội xe Như Quỳnh nhận yêu cầu đón khách tại nhiều khu vực ở Hưng
            Yên, đi Hà Nội, sân bay Nội Bài và liên tỉnh. Bạn có thể chọn xe 5–7
            chỗ, hành trình một chiều hoặc khứ hồi theo số người và lịch đi.
          </p>
          <p>
            Nhập địa chỉ đón cụ thể và thời gian mong muốn để đội xe kiểm tra
            khả năng sắp xếp. Nếu có nhiều điểm đón, ghi chú từng địa chỉ và
            liên hệ để thống nhất hành trình, xe và giá trước chuyến.
          </p>
          <Link href="/dat-xe">Đặt xe tại Hưng Yên</Link>
        </article>
        <article id="taxi-yen-my">
          <h2>Đặt taxi Yên Mỹ</h2>
          <p>
            Cần xe đón tại Yên Mỹ để đi làm việc, ra sân bay hoặc đi tỉnh? Chọn
            điểm đón trên bản đồ, nhập điểm đến và giờ đi. Với chuyến có giờ hẹn
            cố định, hãy trao đổi trước để đội xe xác nhận lịch đón.
          </p>
          <p>
            Nếu đi về trong cùng lịch trình, chọn Khứ hồi và giờ đón về. Thời
            gian chờ, điểm dừng thêm và chi phí phát sinh cần được thống nhất
            riêng; giá trên website là giá dự kiến.
          </p>
          <Link href="/dat-xe">Chọn điểm đón tại Yên Mỹ</Link>
        </article>
        <article id="taxi-my-hao">
          <h2>Đặt taxi Mỹ Hào</h2>
          <p>
            Khi cần taxi tại Mỹ Hào, bạn có thể gửi yêu cầu xe 5–7 chỗ đến Đội
            xe Như Quỳnh. Cung cấp số hành khách, hành lý và địa chỉ đón để đội
            xe kiểm tra dòng xe phù hợp cho hành trình của bạn.
          </p>
          <p>
            Với điểm đón ở nhà máy, khu công nghiệp hoặc khu dân cư, ghi rõ tên
            cổng và vị trí hẹn. Bạn có thể gọi hoặc nhắn Zalo nếu cần trao đổi
            điểm đón; đội xe sẽ xác nhận trước khi thực hiện chuyến.
          </p>
          <Link href="/dat-xe">Chọn điểm đón tại Mỹ Hào</Link>
        </article>
        <article id="yen-my-pho-noi">
          <h2>Taxi Yên Mỹ, Phố Nối và Mỹ Hào: chọn đúng điểm đón</h2>
          <p>
            Khi đặt xe giữa Yên Mỹ, Phố Nối và Mỹ Hào, hãy cung cấp địa chỉ cụ
            thể ở cả hai đầu hành trình. Chọn ghim trên bản đồ nếu tên đường
            hoặc khu vực chưa đủ rõ; ghi chú cổng nhà máy, khu dân cư hay điểm
            hẹn để tài xế liên hệ xác nhận nơi đón và trả khách.
          </p>
          <Link href="/dat-xe">Chọn điểm đi và điểm đến</Link>
        </article>
        <article id="taxi-dien">
          <h2>Đặt taxi điện tại Hưng Yên</h2>
          <p>
            Đội xe có các dòng xe điện VinFast hiển thị trên website. Bạn có thể
            lọc Xe điện ở trang chủ, xem số hành khách và hành lý của từng xe
            trước khi gửi yêu cầu. Dòng xe mong muốn cần được đội xe kiểm tra
            lịch và xác nhận; giá chính thức được tài xế trao đổi trước chuyến
            đi.
          </p>
          <Link href="/#doi-xe">Xem các dòng xe điện</Link>
        </article>
        <article id="taxi-nhu-quynh">
          <h2>Đặt taxi tại Như Quỳnh, Văn Lâm</h2>
          <p>
            Cần xe đón tại nhà ở Như Quỳnh hoặc khu vực Văn Lâm? Nhập địa chỉ
            đón cụ thể và điểm đến trên trang đặt xe. Bạn có thể chọn địa chỉ
            gợi ý hoặc ghim vị trí trên bản đồ để đội xe biết nơi đón.
          </p>
          <p>
            Website có lựa chọn xe 5 chỗ và 7 chỗ. Hãy xem số hành khách tối đa
            của từng dòng xe và ghi chú số người, hành lý hoặc nhu cầu riêng. Xe
            thực tế phụ thuộc lịch được đội xe xác nhận.
          </p>
          <Link href="/dat-xe">Chọn điểm đón tại Như Quỳnh</Link>
        </article>
        <article id="taxi-pho-noi">
          <h2>Đặt taxi Phố Nối</h2>
          <p>
            Cần xe đón tại Phố Nối để đi Hà Nội, sân bay hoặc liên tỉnh? Chọn
            địa chỉ đón cụ thể trên trang đặt xe, kèm giờ đi và số người. Đội xe
            Như Quỳnh kiểm tra lịch xe rồi liên hệ xác nhận điểm hẹn, hành trình
            và giá trước chuyến đi.
          </p>
          <p>
            Với điểm đón trong khu dân cư, khu công nghiệp hoặc gần quốc lộ, bạn
            có thể ghim vị trí trên bản đồ và ghi chú cổng hoặc điểm hẹn dễ nhận
            biết. Nếu chưa tìm thấy địa chỉ, hãy gọi đội xe để trao đổi.
          </p>
          <Link href="/dat-xe">Chọn điểm đón tại Phố Nối</Link>
        </article>
        <article id="xe-noi-bai">
          <h2>Xe đi sân bay Nội Bài từ các khu vực ở Hưng Yên</h2>
          <p>
            Với chuyến ra sân bay, chọn Nội Bài làm điểm đến, nhập ngày và giờ
            đón mong muốn. Ghi chú nhà ga T1 hoặc T2, giờ bay và lượng hành lý
            để đội xe trao đổi lịch đi phù hợp. Thời gian di chuyển trên bản đồ
            chỉ là tham khảo, cần tính thêm thời gian làm thủ tục và tình hình
            giao thông.
          </p>
          <p>
            Nếu cần đón chiều về, cung cấp giờ hạ cánh, số hiệu chuyến bay và
            nhà ga để đội xe kiểm tra khả năng sắp xếp. Liên hệ trực tiếp để
            thống nhất điểm hẹn và chi phí chờ nếu có.
          </p>
          <Link href="/xe-san-bay-noi-bai">
            Xem hướng dẫn đặt taxi Hưng Yên đi Nội Bài
          </Link>
        </article>
        <article id="xe-ha-noi">
          <h2>Taxi Hưng Yên đi Hà Nội</h2>
          <p>
            Đặt xe đi làm việc, thăm người thân, đến bệnh viện hoặc bến xe tại
            Hà Nội bằng cách nhập địa chỉ đến cụ thể. Ghi rõ cổng, tòa nhà hay
            điểm hẹn thuận tiện để tài xế trao đổi nơi trả khách.
          </p>
          <p>
            Bạn có thể đặt một chiều hoặc chọn khứ hồi khi cần xe đưa về. Với
            lịch hẹn có giờ cố định, hãy đặt trước và trao đổi giờ đón với đội
            xe; thời gian dự kiến không phải cam kết đến nơi.
          </p>
          <Link href="/dat-xe">Chọn địa chỉ đến tại Hà Nội</Link>
        </article>
        <article id="xe-lien-tinh">
          <h2>Xe đi tỉnh 5–7 chỗ, một chiều hoặc khứ hồi</h2>
          <p>
            Với hành trình liên tỉnh, nhập điểm đi và điểm đến để xem quãng
            đường cùng giá dự kiến. Nếu đi và về trong cùng lịch trình, chọn Khứ
            hồi và giờ đón về. Ghi chú các điểm dừng thêm để đội xe kiểm tra
            hành trình và báo lại chi phí.
          </p>
          <p>
            Giá trên website được tính từ bảng cước mẫu. Phí cầu đường, bãi đỗ,
            thời gian chờ và thay đổi hành trình chưa bao gồm. Tổng giá cần được
            thống nhất với đội xe trước chuyến đi.
          </p>
          <Link href="/bang-gia">Xem cách tính giá xe</Link>
        </article>
        <article id="so-dien-thoai">
          <h2>Số điện thoại đặt taxi Như Quỳnh, Yên Mỹ, Mỹ Hào</h2>
          <p>
            Gọi <a href={CONTACT.telephone}>{CONTACT.phone}</a> hoặc{" "}
            <a href={CONTACT.zalo}>nhắn Zalo cho đội xe</a>. Khi liên hệ, cung
            cấp điểm đón, điểm đến, giờ đi, số hành khách và nhu cầu một chiều
            hay khứ hồi để được tư vấn chuyến phù hợp.
          </p>
          <h2>Giá taxi Hưng Yên được tính thế nào?</h2>
          <p>
            Giá dự kiến được tính theo dòng xe, quãng đường và lựa chọn một
            chiều hoặc khứ hồi. Bạn có thể xem bảng cước hoặc nhập hành trình để
            tham khảo chi phí. Tài xế sẽ liên hệ báo giá chính thức để bạn thống
            nhất trước khi đi; phí cầu đường, bãi đỗ, chờ và yêu cầu phát sinh
            cần được trao đổi riêng.
          </p>
          <Link href="/bang-gia">Tham khảo giá taxi 5–7 chỗ</Link>
          <h2>Đặt xe online có cần tài khoản không?</h2>
          <p>
            Bạn đặt trực tiếp trên website bằng họ tên và số điện thoại, không
            cần cài ứng dụng. Sau khi gửi, giữ đường dẫn tra cứu riêng và trao
            đổi với đội xe để xác nhận lịch, xe và giá.
          </p>
        </article>
        <Link href="/dat-xe" className="btn btn-primary">
          Xem hành trình & đặt xe
        </Link>
      </div>
    </main>
  );
}
