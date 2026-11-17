GATE: OPEN 73 (rounds used up)

# Kết quả kiểm tra — Như Quỳnh Hưng Yên

TasteSkill đã chạy đủ 3 vòng: còn 73 finding hình thức theo preset landing page, không có waiver. Log đầy đủ nằm ở taste-round-1.txt, taste-round-2.txt và taste-round-3.txt. Vòng cuối không còn FAIL về tràn viewport, vùng bấm, va chạm, vòng focus hoặc tương phản chữ ở 1440/390px; browser errors ở 1440/390/320px đều rỗng. Không tuyên bố toàn bộ bộ kiểm tra TasteSkill đã đạt.

## Đã đạt

- `npm run build`: tạo bản production thành công, 8 trang/tuyến bao gồm not-found và API động.
- `npm run typecheck`: TypeScript không có lỗi.
- `npm test`: 7/7 test. Kiểm tra bậc cước tại 1, 30, 40 km; chuyến dưới 1 km; khứ hồi tính hai lượt; số km không hợp lệ; giờ đi/về; chữ ký báo giá chống sửa.
- `npm run test:integration`: 21/21 kiểm tra trên bản production. Lưu đơn SQLite thật, tra cứu bằng số điện thoại hoặc khóa riêng, gửi lại cùng yêu cầu không tạo thêm đơn, từ chối sai tài xế, báo giá sửa, sai điện thoại, thiếu đồng ý và origin khác; các trang/ảnh trả 200.
- `npm run test:e2e`: 2/2 bài kiểm tra Chrome. Khách lọc 7 chỗ/xe điện; mở canvas 3D, đổi màu, đóng; chọn tuyến, xe VF 6, tài xế Anh Minh; nhập thông tin; gửi; mở tra cứu và xem trạng thái chờ xác nhận. Không phát sinh pageerror.
- Bài kiểm tra responsive mở lần lượt 320, 390, 768, 1024px: không tràn ngang; toàn bộ 6 ảnh xe tải được; menu mobile dẫn đúng trang; ghim điểm đến trên bản đồ thay đổi trường địa chỉ; chữ nút đặt xe ở menu dưới khác màu nền.
- Lỗi Leaflet phát sinh khi rời trang nhanh đã được tái hiện bằng E2E, sửa bằng dừng map và tắt các chuyển động viewport, rồi chạy lại thành công.
- Chuyển sang production server và loại cảnh báo hydration do script entrance chủ ý thay class HTML; xử lý đúng ở root, không tắt các cảnh báo toàn ứng dụng.

## Chưa xác minh với dịch vụ thật

- Chưa triển khai Vercel: quyền team trả 403; cần chủ tài khoản cấp quyền cho kết nối. Chưa có PostgreSQL cloud/DATABASE_URL.
- Chưa gửi Telegram vì chưa có bot token và chat ID. Tests cố ý từ chối chạy khi Telegram đang kết nối để tránh gửi tin kiểm thử.
- Nhánh Google Maps/Geocoding/Routes chưa gọi thực tế vì chưa có cặp khóa server/browser. Nhánh OSM/OSRM và ghim bản đồ đã được kiểm tra trên bản local; dịch vụ OSRM công khai là demo, không có SLA dành riêng.
- Chưa thử Safari/iOS hoặc thiết bị vật lý. Kiểm tra mobile là Chrome giả lập kích thước.
- Chưa có lịch xe/tài xế thật, giữ chỗ, xác nhận điều hành, thanh toán hoặc ứng dụng tài xế trong phạm vi hiện tại.

## Dữ liệu và ảnh

Giá, hồ sơ tài xế và sức chứa hành lý là mẫu. Loại xe và tên đội xe do chủ đội xe cung cấp. Ảnh là ảnh quảng bá dòng xe, không phải ảnh đội xe thực tế; xem public/images/sources.json và /nguon-anh. Mô hình 3D là minh họa riêng, không phải mô hình chính xác của VinFast hoặc Suzuki.

## Preset TasteSkill

Các kiểm tra hình thức không được coi là kiểm thử nghiệp vụ. Preset có các yêu cầu như mỗi section đúng 1–2 màn hình, không lặp bố cục card, không nghiêng phối cảnh 3D, không dùng nhãn sample hoặc lặp ảnh. Những yêu cầu này khác một phần với brief khách hàng: cần danh sách xe đồng nhất, bố cục form co giãn, dữ liệu mẫu công khai và 3D. Không chỉnh kit/checker hoặc giấu nội dung để lấy PASS. Xem log đính kèm cho mọi finding còn mở; không tuyên bố TasteSkill PASS nếu checker chưa đạt.

## Hiệu năng theo TasteSkill

Checker perf đã chạy trên production ở 1440 và 390px: tổng truyền khoảng 690 KiB; ảnh tổng 246 KiB; JavaScript truyền nén khoảng 201 KiB; không request hỏng, không long task, không WebGL ở tải trang; layout shift 0.000–0.002 trong các lần đo CPU tại máy này. Đây không phải điểm Lighthouse hoặc số đo mạng di động thực.

Kết quả checker: **3 FAIL, 5 WARN**. FAIL là 11 file font/subset và ảnh có kích thước gốc vượt hệ số 2.2 lần vùng hiển thị trên điện thoại. WARN gồm dung lượng/JS parse và kích thước ảnh. Giữ nguyên bằng chứng ở taste-performance.txt; không tuyên bố kiểm tra hiệu năng TasteSkill đã PASS. Khung 3D chỉ tải theo yêu cầu, ảnh khác lazy-load, font self-host cùng giấy phép OFL.

## Cập nhật ảnh theo yêu cầu chủ đội xe

- Suzuki Ertiga chuyển sang ảnh đen từ Suzuki Indonesia; áp dụng ở danh mục, đặt xe và phần giới thiệu quy trình.
- Bỏ mô hình 3D minh họa không đúng kiểu dáng. Cửa sổ xem chi tiết dùng ảnh hãng Limo Green ở ba góc trước/ngang/sau và hỗ trợ phóng to; không quảng bá đây là mô hình 3D hoặc xoay 360 độ.
- Bản cập nhật đã build production thành công. E2E 2/2 đạt, gồm kiểm tra ảnh Ertiga đen, đổi góc ảnh Limo Green, phóng to/đóng cửa sổ và luồng đặt/tra cứu; responsive vẫn đạt ở 320/390/768/1024px.
- Các log TasteSkill ở trên là bằng chứng của phiên bản trước lần thay ảnh này, chưa chạy lại cho thay đổi nhỏ hiện tại.
