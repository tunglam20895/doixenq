# Thiết kế — Đội xe Như Quỳnh Hưng Yên

Kind: service. Phạm vi hiện tại chỉ dành cho khách hàng.

TasteSkill 2.5.1 được dùng cho định hướng, micro-interactions, hero entrance, pinned chapters, kiểm tra Chrome và ảnh chụp responsive. Dealer ban đầu chọn film, paper-grey-brass / Red Hat. Sau khi chủ đội xe bổ sung yêu cầu xe điện, 3D và thiết bị di động, thiết kế dùng nền ivory/sage, xanh rừng và lime; Be Vietnam Pro hỗ trợ đầy đủ dấu tiếng Việt. Hero dùng ảnh thật dòng Limo Green trên bệ có phối cảnh. Màu và bố cục này là điều chỉnh theo yêu cầu mới, không tuyên bố giữ nguyên palette ngẫu nhiên ban đầu.

Voice: tiếng Việt gần gũi, cụ thể về hành trình; không dùng đánh giá, số chuyến, thâm niên hoặc cam kết giả.

- Trang chủ: giới thiệu Như Quỳnh; xem giá/đặt xe là hành động chính; ảnh Limo Green; form tìm chuyến; 6 dòng xe lọc theo chỗ/động cơ; tuyến phổ biến; hồ sơ tài xế mẫu; quy trình và FAQ.
- 3D: tải Three.js theo nhu cầu trong dialog; mô hình minh họa được dựng riêng; kéo xoay, thu phóng, đổi màu; không tự quay; fallback ảnh khi WebGL không dùng được; giải phóng GPU khi đóng.
- Moment: pinned-chapters giải thích luồng đặt xe bằng từng hình xe; chỉ pin trên desktop; điện thoại và reduced motion hiển thị tĩnh.
- Trang đặt xe: 3 bước, giữ nguyên dữ liệu khi quay lại; phân biệt giá dự kiến, lựa chọn mong muốn và xác nhận điều hành.
- Mobile: 320, 390, 768, 1024 và desktop; điều hướng dưới, input ngày giờ gốc của thiết bị, bản đồ tải theo nhu cầu.
- Hero entrance: xuất hiện một lần bằng lớp motion nguyên bản của TasteSkill.
- Hover: ảnh zoom nhẹ, thẻ nâng nhẹ, nút phản hồi khi nhấn; có reduced-motion.

## Dữ liệu cần thay

Tên đội xe, khu vực và danh sách dòng xe được chủ đội xe cung cấp. Các giá, tên/giới thiệu tài xế, sức chứa hành lý và các tuyến km dự phòng là dữ liệu mẫu. Không có ảnh chân dung hoặc xếp hạng tài xế giả. Số chỗ gồm tài xế.

Ảnh được tìm trên trang hãng/đại lý và lưu nguồn tại public/images/sources.json; đây là ảnh dòng xe, không phải ảnh xe thực tế của đội xe. Cần ảnh xe thực tế hoặc xác nhận quyền sử dụng hình quảng bá trước khai thác thương mại. Nguồn được liên kết ở trang /nguon-anh. Không dùng ảnh tải từ kho PNG không rõ nguồn.

## Các lựa chọn phục vụ nghiệp vụ

Luồng đặt xe là ứng dụng, không ép form và bảng giá vào các section đúng một chiều cao màn hình. Hero có bệ và mô hình 3D theo yêu cầu trực tiếp của chủ đội xe; điều này thay thế giới hạn chỉ ảnh của trang service trong TasteSkill. Dữ liệu mẫu được ghi rõ theo yêu cầu người dùng, dù checker landing page mặc định không thích nhãn sample.

## Điều chỉnh theo chủ đội xe

Suzuki Ertiga dùng ảnh màu đen từ Suzuki Indonesia. Đã bỏ mô hình 3D dựng minh họa vì không đúng kiểu dáng Limo Green; thay bằng ảnh dòng xe của VinFast ở các góc trước, ngang, sau, hỗ trợ phóng to. Giữ bệ phối cảnh ở hero, đổi nhãn hành động thành “Xem chi tiết xe”, không mô tả gallery là ảnh xoay 360 hay mô hình 3D.
