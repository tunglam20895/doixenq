import { ESTIMATED_FARE_NOTE } from "@/lib/fare-copy";
import Link from "next/link";
import { CONTACT } from "@/lib/contact";
export const metadata = {
  title: "Chính sách đặt xe & bảo mật",
  description:
    "Thông tin về xác nhận chuyến, giá dự kiến, thay đổi hoặc hủy chuyến và bảo mật thông tin khi đặt xe với Đội xe Như Quỳnh.",
  alternates: { canonical: "/chinh-sach" },
};
export default function Page() {
  return (
    <main id="main" className="content-page">
      <div className="wrap policy-content">
        <span className="eyebrow">THÔNG TIN TRƯỚC CHUYẾN ĐI</span>
        <h1>Đặt xe & thông tin của bạn.</h1>
        <p className="page-lead">
          Điều khoản cho bản trải nghiệm. Đội xe cần bổ sung chính sách vận hành
          chính thức trước khi nhận khách thực tế.
        </p>
        <article>
          <h2>1. Yêu cầu đặt xe và xác nhận</h2>
          <p>
            Chuyến được tự động xác nhận khi đặt thành công. Đội xe sắp xếp tài
            xế và cập nhật trạng thái tiếp tục, hoàn thành hoặc hủy trên hệ
            thống. Khách có thể theo dõi qua đường dẫn tra cứu riêng.
          </p>
          <p>
            Ảnh minh họa dòng xe có thể khác màu, phiên bản và xe thực tế. Bảng
            giá hiện là dữ liệu mẫu; hồ sơ tài xế được đội xe cập nhật qua
            admin.
          </p>
        </article>
        <article>
          <h2>2. Giá dự kiến và thanh toán</h2>
          <p>
            Giá hiển thị được tính theo bảng cước mẫu và quãng đường. Phí cầu
            đường, bãi đỗ, chờ, thay đổi điểm đón/đến hoặc yêu cầu khác chưa bao
            gồm. {ESTIMATED_FARE_NOTE} Website hiện không thu tiền và không yêu
            cầu cung cấp thông tin thẻ.
          </p>
        </article>
        <article>
          <h2>3. Thay đổi hoặc hủy chuyến</h2>
          <p>
            Nếu cần thay đổi hoặc hủy, hãy thông báo khi đội xe liên hệ xác
            nhận, hoặc qua thông tin liên hệ đội xe đã cung cấp cho chuyến.
            Chính sách phí hủy, chờ và đặt cọc chưa được thiết lập trong bản
            trải nghiệm; không tự động áp dụng khoản phí nào trên website.
          </p>
        </article>
        <article id="bao-mat">
          <h2>4. Dữ liệu cá nhân</h2>
          <p>
            Thông tin được thu thập gồm họ tên, số điện thoại, địa điểm, giờ đi
            và ghi chú bạn chủ động cung cấp. Mục đích là xử lý yêu cầu và liên
            hệ xác nhận chuyến. Khi cấu hình Telegram, thông tin chuyến được
            chuyển tới nhóm điều hành được chỉ định.
          </p>
          <p>
            Website không công khai hành trình của bạn. Tra cứu bằng số điện
            thoại khớp 9 số cuối, hoặc đường dẫn tra cứu riêng. Không chia sẻ
            đường dẫn đó cho người không liên quan.
          </p>
          <p>
            Thiết bị có thể lưu mã và khóa tra cứu cho tối đa 5 chuyến gần nhất.
            Bạn có thể xóa dữ liệu trang trong trình duyệt để bỏ danh sách này.
            Website chỉ lấy vị trí hiện tại khi bạn chọn chức năng định vị và
            cho phép.
          </p>
        </article>
        <article>
          <h2>5. Dịch vụ bản đồ</h2>
          <p>
            Bản đồ mặc định dùng OpenStreetMap và OSRM. Khi tìm địa chỉ, nội
            dung bạn gõ được gửi tới Photon/OpenStreetMap; khi chọn ghim, tọa độ
            được gửi để tìm địa chỉ gần đó. Khi được cấu hình, website dùng
            VIETMAP để gợi ý địa điểm và tìm địa chỉ từ tọa độ, hoặc Google Maps
            để hiển thị, gợi ý địa điểm và tính hành trình. Nội dung bạn gõ để
            tìm địa điểm được gửi tới Google khi tính năng này được bật. Điểm đi
            và điểm đến được gửi tới dịch vụ bản đồ đang sử dụng. Thời gian đi
            và quãng đường có thể khác thực tế. Khi không truy cập được dịch vụ,
            một số tuyến phổ biến dùng số km mẫu và được ghi rõ trên màn hình.
          </p>
        </article>
        <article>
          <h2>6. Liên hệ đội xe</h2>
          <p>
            Gọi <a href={CONTACT.telephone}>{CONTACT.phone}</a> hoặc{" "}
            <a href={CONTACT.zalo}>nhắn Zalo</a> để xác nhận chuyến, thay đổi
            lịch và yêu cầu hỗ trợ về dữ liệu cá nhân.
          </p>
          <p>
            Đội xe sẽ cập nhật thông tin chủ thể kinh doanh, thời hạn lưu dữ
            liệu, bảng giá và chính sách hủy chính thức. Các mục này sẽ được cập
            nhật theo thông tin chủ đội xe cung cấp.
          </p>
        </article>
        <Link href="/dat-xe" className="btn btn-primary">
          Tiếp tục đặt chuyến xe
        </Link>
      </div>
    </main>
  );
}
