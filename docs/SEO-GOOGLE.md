# SEO cho doixenq.com

## Cấu hình đã thực hiện

- Domain public cố định trong `lib/site.ts`: https://www.doixenq.com.
- APP_URL trong Vercel và local được cập nhật sang domain chính thức. Không dùng giá trị này làm URL máy dev; chạy dev bằng localhost như bình thường.
- Canonical riêng cho trang chủ, đặt xe, bảng giá, dịch vụ, chính sách. Trang đặt xe có query vẫn canonical về /dat-xe.
- robots.txt trỏ sitemap mới; sitemap chỉ liệt kê trang công khai.
- Redirect 308 từ doixenq.com, doixenq.vercel.app và nhu-quynh-hung-yen.vercel.app, giữ path/query. Deployment Protection của Vercel có thể chạy trước redirect trên domain .vercel.app; phải kiểm tra response public.
- Trang /dich-vu trình bày dịch vụ thực tế, có liên kết từ trang chủ, hướng dẫn chọn xe và liên hệ.
- Dữ liệu TaxiService có domain mới, ID ổn định và các loại dịch vụ. Không bịa đánh giá, địa chỉ, giá, giờ mở cửa.

## Nhóm truy vấn và trang đáp ứng

Các cụm dưới đây là nhóm ý định tìm kiếm, không phải thống kê lượng tìm kiếm. Cần dùng báo cáo Hiệu suất của Search Console sau khi có dữ liệu để ưu tiên bổ sung nội dung.

| Ý định | Ví dụ truy vấn | Trang |
| --- | --- | --- |
| Thương hiệu, khu vực | đội xe Như Quỳnh, taxi Như Quỳnh, taxi Văn Lâm, taxi Phố Nối, đặt xe Như Quỳnh Hưng Yên | /, /dich-vu#taxi-nhu-quynh và /dich-vu#taxi-pho-noi |
| Sân bay | xe Như Quỳnh đi Nội Bài, taxi sân bay Nội Bài từ Văn Lâm | /dich-vu#xe-noi-bai |
| Hà Nội | xe Như Quỳnh đi Hà Nội, taxi Văn Lâm đi Hà Nội | /dich-vu#xe-ha-noi |
| Xe, hành trình | đặt xe 5 chỗ, xe 7 chỗ, xe đi tỉnh, xe khứ hồi từ Như Quỳnh | /dich-vu và /dat-xe |
| Giá | giá taxi Như Quỳnh, giá xe đi Nội Bài, cước xe 7 chỗ | /bang-gia và /dat-xe; hiện là bảng cước mẫu |
| Liên hệ | số điện thoại taxi Như Quỳnh, gọi xe Như Quỳnh, Zalo đặt xe | /dich-vu và thông tin liên hệ trên website |

Không tạo hàng loạt trang lặp lại cho biến thể không dấu, lỗi chính tả hay tên tỉnh chưa xác nhận phục vụ. Không quảng cáo 24/7, rẻ nhất, xe 4 chỗ hoặc có xe ngay khi chưa có thông tin vận hành xác nhận. Không dùng meta keywords vì Google không sử dụng trường này để xếp hạng.

## Chủ website xác minh Search Console

1. Đăng nhập https://search.google.com/search-console bằng tài khoản Google sẽ quản lý website.
2. Thêm tài sản, chọn **Miền**, nhập `doixenq.com` (không https, không www, không đường dẫn).
3. Chép nguyên giá trị TXT `google-site-verification=...` do Google cấp.
4. Vào nhà cung cấp DNS đang quản lý nameserver của domain, thêm bản ghi TXT ở gốc: Name/Host `@` hoặc trống theo nhà cung cấp; Value là chuỗi Google cấp; TTL để mặc định. Giữ nguyên các bản ghi khác.
5. Quay lại Search Console chọn Xác minh. DNS có thể cập nhật chậm; nếu chưa tìm thấy thì chờ rồi thử lại. Giữ bản ghi sau khi xác minh thành công.
6. Trong Sơ đồ trang web, gửi `https://www.doixenq.com/sitemap.xml`.
7. Kiểm tra URL trang chủ, /dich-vu, /dat-xe, /bang-gia bằng công cụ kiểm tra URL đang hoạt động, rồi yêu cầu lập chỉ mục.
8. Nếu domain cũ đã được lập chỉ mục và có quyền quản lý: xác minh tài sản URL-prefix cũ, kiểm tra chuyển hướng hoạt động và dùng Change of Address khi đủ điều kiện.
9. Theo dõi báo cáo Lập chỉ mục trang và Hiệu suất: truy vấn, số lần hiển thị, lượt nhấp, trang đích. Dữ liệu thực tế mới xác định được khách đang tìm bằng cụm nào.

## Tìm kiếm gần đây / Google Maps

Chủ đội xe cần tạo hoặc cập nhật Google Business Profile với tên thật, số điện thoại, website https://www.doixenq.com, danh mục và khu vực phục vụ đúng thực tế. Nếu không đón khách tại địa chỉ văn phòng, cấu hình doanh nghiệp theo khu vực phục vụ theo điều kiện của Google. Xác minh theo phương thức Google cung cấp. Không tự thêm địa chỉ, giờ hoạt động hay đánh giá không có thật. Website SEO không tự tạo hoặc xác minh hồ sơ này.

## Nguồn

- https://support.google.com/webmasters/answer/9008080
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
- https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide

Google tự quyết định thời điểm lập chỉ mục, thứ hạng và gợi ý tìm kiếm; không có cách đảm bảo mọi truy vấn đều lên đầu.

## Biểu tượng và thương hiệu

Tên thương hiệu: Đội xe Như Quỳnh. Khu vực phục vụ được trình bày riêng: Như Quỳnh, Văn Lâm, Phố Nối và lân cận. Favicon lấy phần biểu tượng NQ từ logo hiện có, xuất ICO nhiều kích thước, PNG 96/512 và Apple icon 180. Google cần thu thập lại và tự quyết định việc hiển thị favicon. Không thêm khu vực chưa được chủ đội xe xác nhận.

## Mở rộng khu vực phục vụ

Danh sách thống nhất tại `lib/service-areas.ts`: Như Quỳnh, Văn Lâm, Phố Nối, Yên Mỹ, Mỹ Hào, Hưng Yên. Trang /dich-vu bổ sung nội dung và liên kết neo #taxi-hung-yen, #taxi-yen-my, #taxi-my-hao. Thông tin được đồng bộ vào giới thiệu, mô tả SEO và areaServed. Không bảo đảm thứ hạng cho từng truy vấn; dùng dữ liệu Search Console để đánh giá sau khi Google thu thập lại.
