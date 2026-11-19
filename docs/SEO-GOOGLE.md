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

## Kiểm tra gợi ý và Search Console ngày 18/11/2026

Nguồn quan sát: ô gợi ý Google trong trình duyệt đăng nhập, giao diện tiếng Việt. Gợi ý có yếu tố cá nhân hóa; mục có nút xóa khỏi nhật ký là lịch sử tìm kiếm, không coi là bằng chứng nhu cầu mới. Không có số liệu lượng tìm kiếm hoặc thứ hạng từ danh sách autocomplete.

- `taxi Hưng Yên`: có gợi ý `taxi hưng yên hà nội`, `taxi hưng yên phố nối`, `taxi hưng yên giá rẻ`; đồng thời có 24h, khu vực khác và tên hãng khác.
- `taxi Như Quỳnh`: có `taxi như quỳnh văn lâm hưng yên`, `taxi như quỳnh hưng yên`, `số taxi như quỳnh`, `tổng đài taxi như quỳnh` và các tên đơn vị khác.
- `taxi Yên Mỹ`: có `taxi yên mỹ hưng yên`, `taxi yên mỹ phố nối`, `tổng đài taxi yên mỹ` và các tên đơn vị khác.
- `taxi Mỹ Hào`: có `taxi mỹ hào hưng yên`, `số taxi mỹ hào hưng yên`, `taxi phố nối mỹ hào`, `tổng đài taxi mỹ hào` và các tên đơn vị khác.
- `taxi Hưng Yên đi`: có `taxi từ hưng yên đi nội bài`, `taxi hưng yên đi hà nội`, `số điện thoại taxi hưng yên`, `taxi điện hưng yên`, `taxi điện vinfast hưng yên`.

Search Console, thuộc tính Domain `doixenq.com`, báo cáo hiệu suất Web / 3 tháng: “Đang xử lý dữ liệu, hãy kiểm tra lại sau khoảng một ngày”; bảng truy vấn “Không có dữ liệu”. Chưa thể kết luận từ khóa có nhiều lượt tìm, CTR thấp hoặc mang lại nhiều đơn nhất. Ảnh bằng chứng lưu cục bộ trong reports (không push).

Thay đổi theo bằng chứng: tạo /xe-san-bay-noi-bai với canonical riêng, thêm sitemap và liên kết từ trang chủ/dịch vụ/footer; làm rõ số gọi đặt xe, taxi điện, tuyến Hưng Yên–Hà Nội và Yên Mỹ–Phố Nối–Mỹ Hào. Rút gọn title theo mục đích trang. Không thêm tên hãng khác, cam kết 24/7, giá rẻ nhất hoặc khu vực chưa xác nhận. Không triển khai cách can thiệp autocomplete.

Khi Search Console có dữ liệu: so sánh truy vấn theo lượt hiển thị, lượt nhấp, CTR, vị trí và trang đích; ưu tiên truy vấn có ý định đặt xe và phù hợp dịch vụ. Search Console không đo trực tiếp số đơn đặt xe theo từng truy vấn.

Nguồn hướng dẫn:
- https://support.google.com/websearch/answer/7368877
- https://developers.google.com/search/docs/appearance/title-link
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content


## Kiểm tra ngày 19/11/2026

Search Console 24 giờ (18–19/11, lần cập nhật hiển thị: 3,5 giờ trước): 2 lượt nhấp, 14 lượt hiển thị, CTR 14,3%, vị trí trung bình 4,1. Bảng truy vấn hiển thị “taxi như quỳnh”: 2 nhấp / 9 hiển thị. Không coi truy vấn duy nhất được báo cáo là toàn bộ truy vấn đã phát sinh hoặc toàn bộ nhu cầu thị trường.

Bảng theo trang: trang chủ 1 nhấp / 11 hiển thị; /dich-vu 1 / 10; /dat-xe 0 / 2; /bang-gia 0 / 1. Không cộng số hiển thị theo trang để so với tổng thuộc tính vì cách tổng hợp khác nhau. Dữ liệu còn quá ít để kết luận xu hướng hay thay đổi tiêu đề hàng ngày.

Google trực tiếp với “taxi Như Quỳnh” vẫn có /dich-vu ở trang đầu, dùng tiêu đề/mô tả cũ. Các kết quả còn phụ thuộc vị trí và phiên tìm kiếm; không khẳng định thứ hạng cố định. /xe-san-bay-noi-bai được URL Inspection báo Google chưa xác định URL; đã khởi động yêu cầu lập chỉ mục. Website thật vẫn trả HTTP 200, canonical mới và các favicon ICO/PNG đều truy cập được.

Bổ sung WebSite JSON-LD trên trang chủ với tên “Đội xe Như Quỳnh”, URL canonical, ngôn ngữ vi-VN. Đây là tín hiệu đề xuất tên website, không phải cách can thiệp autocomplete hoặc bảo đảm đổi tên hiển thị.

Nguồn: https://developers.google.com/search/docs/appearance/site-names
