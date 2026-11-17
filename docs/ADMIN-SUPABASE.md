# Admin và dữ liệu Supabase

## Phạm vi

Khách dùng website hiện tại. Chủ đội xe dùng `/admin` với layout và đăng nhập riêng. Tài khoản tên `admin`, mật khẩu ban đầu do chủ đội xe chỉ định; không dùng email. Không có trang đăng ký công khai.

## Database

- `fleet_customers`: tên, điện thoại chuẩn hóa và duy nhất, ghi chú, ngày tạo/cập nhật.
- `fleet_drivers`: hồ sơ công khai và nội bộ, dòng xe có thể nhận, trạng thái hoạt động/công khai, ảnh nhỏ đã kiểm tra.
- `fleet_bookings`: liên kết khách/tài xế, trạng thái, tiền thực tế, phiên bản, giờ hoàn thành; payload giữ snapshot của đơn web để tra cứu cũ không bị mất.
- `fleet_booking_events`: lịch sử tạo/cập nhật, trạng thái trước/sau, số tiền, ghi chú và người thao tác.
- `fleet_admin_accounts`: mật khẩu scrypt có salt riêng; cờ mật khẩu ban đầu.
- `fleet_admin_sessions`: chỉ lưu fingerprint phiên, có hạn dùng 8 giờ; đăng xuất xóa phiên; đổi mật khẩu thu hồi phiên khác.
- `fleet_rate_limits`: giới hạn đăng nhập, đổi mật khẩu và endpoint công khai.
- `fleet_private.config`: fingerprint SHA-256 của bí mật server. Không chứa bí mật nguyên văn.

Khóa public không đọc trực tiếp các bảng. RLS bật, không tạo policy cho browser vì tất cả truy cập dữ liệu đi qua server. Advisors Supabase báo INFO “RLS enabled no policy” cho 8 bảng: đây là mô hình từ chối trực tiếp có chủ đích, không phải bảng được mở công khai. Đã kiểm tra trực tiếp đọc bảng bằng publishable key bị từ chối và RPC thiếu bí mật bị từ chối.

Gateway invoker ở public chỉ gọi implementation security definer trong schema không expose `fleet_private`. Implementation kiểm tra secret ở đầu cho mọi action. Không dùng `user_metadata`, không dựa vào role authenticated chung, không cấp quyền bảng cho browser, không chạy SQL động. Username auth của ứng dụng thay thế việc dùng `auth.uid()` vì chủ đội xe yêu cầu đăng nhập không email.

## Quy tắc thống kê

Không tăng bộ đếm khi bấm hoàn thành. Mỗi truy vấn tổng hợp từ trạng thái hiện tại của các chuyến:

- số chuyến đã đi = số chuyến trạng thái completed;
- tổng tiền = tổng tiền thực tế của completed (đơn cũ chưa có tiền thực tế dùng giá snapshot);
- cancelled không tính doanh thu;
- đổi giá / hoàn thành lại / mở lại / hủy được tính lại, tránh cộng trùng;
- biểu đồ 7 ngày tính theo completed_at, múi giờ Asia/Ho_Chi_Minh;
- tên/điện thoại snapshot trên chuyến giữ nguyên khi sửa hồ sơ khách, bảo toàn tra cứu cũ.

## Chuyển trạng thái

Admin chọn Đã đặt, Hoàn thành hoặc Đã hủy. Hoàn thành bắt buộc nhập tiền thực tế. Lưu dùng version/row lock: nếu một cửa sổ khác đã sửa, API trả 409 để người dùng tải lại. Mọi cập nhật được lưu lịch sử. Chưa có hệ thống thanh toán, đối soát, tự phân chuyến hoặc lịch tránh trùng giờ.

## Ảnh tài xế

Browser chỉ nhận JPG/PNG/WebP dưới 8 MB; thu nhỏ tối đa 512px. Server kiểm tra MIME, signature và giới hạn 256KB sau xử lý, từ chối SVG. Lưu ảnh nhỏ trong DB để không cần cấp quyền upload trực tiếp cho khóa public. Public endpoint chỉ trả ảnh hồ sơ active + published; ảnh draft cần cookie admin. Cache ảnh công khai tối đa 60 giây, ảnh admin no-store.

## Vận hành

Không công khai `.env.local`, không đổi `SUPABASE_BACKEND_SECRET` chỉ ở một phía: khi xoay cần cập nhật fingerprint trong fleet_private.config và biến server cùng lúc. Mọi secret ở server, không `NEXT_PUBLIC_`. Backup dữ liệu theo chính sách vận hành. Không reset mật khẩu sau khi chủ xe đã đổi.

Thông tin kinh doanh, hotline, chính sách lưu dữ liệu, giá chính thức và ảnh xe thực tế vẫn cần chủ đội xe bổ sung trước nhận khách thật. Không có seed khách/tài xế giả vào database mới; dữ liệu QA được đánh dấu riêng và dọn sau xác minh.

## Xác minh và triển khai

- Build production và TypeScript: đạt.
- 10 unit tests: đạt, gồm bậc giá, thời gian, chữ ký và mật khẩu băm.
- 27 kiểm tra API admin với Supabase thật: đạt; 21 kiểm tra API đặt/tra cứu: đạt.
- 3 bài Chrome E2E: đạt; nhập tài xế và ảnh, công khai/ẩn ảnh, nhập chuyến, hoàn thành, thống kê khách, đăng xuất; web khách và các kích thước 320/390/768/1024px vẫn hoạt động.
- Đổi mật khẩu và thu hồi các phiên khác đã được kiểm tra bằng tài khoản QA riêng; mật khẩu của admin thật không thay đổi.
- Quét bundle browser: không có AUTH_SECRET, SUPABASE_BACKEND_SECRET, mật khẩu kiểm thử hoặc token Telegram.
- Advisors Supabase: chỉ INFO về RLS không policy như giải thích ở trên; không có WARN/ERROR bảo mật được trả về.
- Đã dọn khách, chuyến và tài xế kiểm thử có nhãn, giữ database sạch để chủ đội xe nhập dữ liệu thật.

Vercel production: https://doixenq.vercel.app
Admin: https://doixenq.vercel.app/admin
Project Vercel: `prj_KcDotqoYDT2wrdq3bGemRd0IvVaG`.
Deployment: `dpl_67Xp8hqmF1PqJQbJVkgT6sp4sPWH` — READY.
Snapshot source SHA-256: `522aa5b32c38fb4d19198b019ab055056bb0a8bd636486f9254975369bf64ce5`.


## Cập nhật ngày 17/11/2026

- Production READY: `dpl_F8t4p9ZtJ3VH7HQTFWPh9suzpuUz`, tên miền https://doixenq.vercel.app.
- Migration Supabase `20261117014823_phone_booking_lookup`: thêm `lookup_phone` vào gateway hiện có, giữ kiểm tra bí mật máy chủ và quyền truy cập.
- Tra cứu không cần nhập mã, khớp 9 số cuối; hai nhóm sắp tới và lịch sử theo trạng thái admin. Chuyến hủy nằm trong lịch sử và có nhãn riêng.
- Đơn mới tự xác nhận; QR tại admin Chuyến đi và `/api/booking-qr` dẫn tới website chính thức.
- Không đổi dữ liệu chuyến hoặc mật khẩu khi cập nhật migration; giữ nguyên cấu hình dịch vụ.


Cập nhật tiến trình tài xế: production `dpl_BCYPjRLJe43TSpFA5URQtu4oR4Jx` READY.
Migration `20261117021634_lookup_assigned_driver` bổ sung driverAssigned và driverPhone trong booking_json.
Tài xế mong muốn của khách chưa được coi là đã phân công; bước Đã giao tài xế dựa vào phân công admin (lịch sử cập nhật hoặc chuyến do admin tạo có tài xế). Số điện thoại chỉ hiển thị trong thông tin chuyến được tra cứu khi đã phân công. Không có thao tác tài xế tự nhận cuốc.
Đã kiểm tra PostgreSQL phân công/bỏ phân công, Chrome cập nhật sau mỗi phút và giao diện điện thoại production.


Bản sửa phân công/địa điểm: `dpl_3CCrKhECPyJLBY1nnygYSTje2Wbf` READY.
Nguyên nhân tài xế không xuất hiện: hồ sơ chỉ chọn Ertiga nhưng chuyến Vios. Admin nay chọn được tài xế hoạt động, cảnh báo khác dòng xe; backend cho phép điều phối chọn, vẫn chặn tài xế không tồn tại/tạm nghỉ mới. Không thay đổi dòng xe trong hồ sơ thật hoặc tự giao chuyến thật.
GPS gọi reverse geocoding; ghim giữ tên và địa chỉ riêng, đợi phản hồi trước xác nhận, có ô bổ sung tên lối vào. Tìm kiếm debounce 300ms và lọc Việt Nam.
VIETMAP v4 tích hợp tùy chọn qua VIETMAP_API_KEY, chưa bật do chưa có key. Photon/OpenStreetMap tiếp tục hoạt động; reverse Bạch Mai trên production trả đúng tên bệnh viện. Adapter VIETMAP được kiểm thử với phản hồi mô phỏng theo tài liệu, chưa kiểm thử bằng key thật.
Đã kiểm tra dropdown admin thật (chỉ đọc), kiểm tra lưu qua API với backend mô phỏng, GPS/ghim bằng Chrome, build, TypeScript, 14 unit và 26 API checks.
