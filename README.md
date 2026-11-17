# Đội xe Như Quỳnh Hưng Yên

Website khách đặt xe và khu vực admin riêng, Next.js 16 / React / TypeScript. Dữ liệu chính lưu tại Supabase PostgreSQL.

## Mở ứng dụng

- Website chính thức: https://doixenq.vercel.app
- Admin: https://doixenq.vercel.app/admin
- Local: http://localhost:3000 và http://localhost:3000/admin
- Đăng nhập bằng tên người dùng `admin`, không cần email. Mật khẩu khởi tạo đã thiết lập theo yêu cầu chủ đội xe, được lưu dưới dạng scrypt trong database; không được ghi trong mã nguồn. Đổi tại **Cài đặt**.

```bash
export PATH="$HOME/.local/bin:$PATH"
npm install
npm run dev
# Hoặc chạy bản production:
npm run build
npm start
```

Node.js 24+. `.env.local` của máy hiện tại đã cấu hình project Supabase riêng. Không commit, không gửi file này lên nơi công khai.

## Khách hàng

Chọn xe 5–7 chỗ, hành trình, giờ đón, tài xế đang công khai; ghim bản đồ, xem giá mẫu, đặt xe được xác nhận ngay; tra cứu bằng số điện thoại khớp 9 số cuối hoặc khóa riêng. Tra cứu chia Chuyến sắp tới và Chuyến đã đi; lịch sử có nhãn riêng cho chuyến hủy. Ertiga dùng ảnh đen. Đã bỏ mô hình 3D, gallery 3D và bệ phối cảnh.

Danh sách tài xế lấy từ Supabase, không cần sửa code sau khi cập nhật qua admin. Tài xế tạm nghỉ hoặc không công khai không hiển thị cho khách. Số điện thoại tài xế và ghi chú nội bộ không nằm trong phản hồi công khai. Chưa nhập hồ sơ thì khách vẫn chọn được “Đội xe sắp xếp”.

Xe, bảng giá và gợi ý địa điểm vẫn nằm ở `lib/data.ts`. Giá mẫu theo bậc km; phí chờ/cầu đường/bãi đỗ chưa bao gồm. Bản đồ mặc định OSM/OSRM; có thể cấu hình cặp khóa Google như `.env.example`. Phần ảnh xe là ảnh hãng/đại lý, không phải ảnh đội xe thực tế.

## Admin

- **Tổng quan:** số khách, tài xế hoạt động, chuyến đã đặt/hoàn thành/hủy, doanh thu và biểu đồ 7 ngày.
- **Khách hàng:** thêm/sửa tên, số điện thoại và ghi chú; tìm kiếm; xem lịch sử, số chuyến đã đi, tổng tiền. Chuẩn hóa +84 về 0, chặn hai hồ sơ trùng số điện thoại.
- **Chuyến đi:** danh sách, lọc và tìm kiếm; nhập chuyến nhận qua điện thoại; phân công tài xế; đổi Đã đặt / Hoàn thành / Đã hủy; ghi số tiền thực tế, lý do cập nhật; xem lịch sử thao tác.
- **Tài xế:** thêm/sửa hồ sơ, ảnh, điện thoại, khu vực, biển số, dòng xe, ghi chú; trạng thái hoạt động và công khai độc lập.
- **Cài đặt:** đổi mật khẩu; thu hồi các phiên khác khi đổi mật khẩu; đăng xuất thu hồi phiên hiện tại trong database.

“Đã đi” và tổng tiền khách chỉ tính **chuyến hoàn thành**, theo số tiền thực tế. Đánh dấu hoàn thành lại không cộng trùng. Chuyển sang hủy loại tiền khỏi thống kê; chuyển lại hoàn thành tính lại theo dữ liệu hiện tại. Biểu đồ dùng ngày hoàn thành theo giờ Việt Nam. Đây là doanh thu theo chuyến, chưa phải đối soát tiền đã thu.

`requested` và `confirmed` cùng hiển thị nhóm **Đã đặt**; `requested` thêm nhãn yêu cầu từ khách. Có khóa phiên bản để chặn hai cửa sổ ghi đè một chuyến. Chưa tự động tối ưu lịch hoặc kiểm tra trùng tài xế theo khoảng thời gian.

Danh sách admin tự tải lại 30 giây khi tab đang được mở. Ảnh tài xế tải lên được thu nhỏ trên trình duyệt và kiểm tra loại/giới hạn ở server; ảnh nhỏ được lưu cùng hồ sơ trong database Supabase. Ảnh hồ sơ nội bộ chỉ đọc được khi đăng nhập. Không có tính năng xóa vĩnh viễn chuyến/tài xế làm mất lịch sử.

## Supabase đã cấu hình

Project: `nhu-quynh-hung-yen` (`aihfwutpfejflrajdsvd`), Singapore. Tạo mới theo lựa chọn chủ đội xe, báo giá khi tạo: **0 USD/tháng**. Không dùng hoặc sửa dữ liệu project `auto-chat` / `tastore`.

Biến server trong `.env.local` và Vercel:

```text
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_BACKEND_SECRET
AUTH_SECRET
APP_URL
```

`SUPABASE_BACKEND_SECRET` là bí mật 256-bit riêng của ứng dụng, không phải khóa public và không được đưa vào biến `NEXT_PUBLIC_`. Chỉ máy chủ gọi Supabase RPC. Publishable key đơn lẻ không có quyền đọc các bảng khách, chuyến, tài khoản hoặc phiên. Không cần email hoặc Supabase Auth cho tài khoản admin username/password này.

Schema và lịch sử migration ở `supabase/migrations/`. Mọi bảng đều bật RLS và thu hồi quyền đọc/ghi trực tiếp của `anon`/`authenticated`. Gateway công khai là hàm **security invoker**; phần có quyền trong schema `fleet_private` và kiểm tra bí mật máy chủ ở đầu mọi lời gọi. Không có SQL động. Thiết kế này phục vụ xác thực username riêng theo yêu cầu; không thay bằng policy `USING (true)` hoặc cho browser đọc dữ liệu trực tiếp.

Session dùng cookie HttpOnly, SameSite Strict; Secure trên HTTPS/Vercel; token ký HMAC và đối chiếu phiên lưu hash ở database. API admin xác thực lại ở từng thao tác, kiểm tra origin, giới hạn đăng nhập, không cache dữ liệu cá nhân. Xem thêm `docs/ADMIN-SUPABASE.md`.

Local SQLite cũ vẫn giữ trong `.data/taxi.sqlite`. Khi kiểm tra chuyển đổi, các đơn cũ tại máy đều là dữ liệu kiểm thử; không nhập chúng vào dữ liệu kinh doanh. Chế độ SQLite chỉ còn là fallback phát triển nếu không cấu hình Supabase; admin luôn yêu cầu Supabase thật.

## Telegram

Biến `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` chỉ dùng máy chủ. Đơn web lưu trước rồi gửi sau qua `after()`. Tác vụ gửi lại `/api/notifications/retry` bảo vệ bằng `CRON_SECRET`; chưa tự bật lịch chạy.

Nếu môi trường đã nối Telegram thật, không chạy bài kiểm tra tạo đơn trên máy chủ đó. Có thể mở máy chủ kiểm thử với thông báo tắt:

```bash
APP_URL=http://localhost:3001 TELEGRAM_BOT_TOKEN= TELEGRAM_CHAT_ID= npm run start -- --port 3001
TEST_URL=http://localhost:3001 npm run test:e2e
TEST_URL=http://localhost:3001 npm run test:integration
```

Máy chủ chính vẫn giữ nguyên cấu hình Telegram của chủ đội xe.

## Đưa lên Vercel

Import source Next.js, Node `24.x`; đặt các biến server ở trên từ cấu hình riêng của bạn. Đặt `APP_URL` đúng URL HTTPS và tùy chọn `ADMIN_URL` nếu dùng hostname admin riêng. Không dùng SQLite trên Vercel. Project Supabase đã có schema và tài khoản khởi tạo; không chạy lại seed đặt mật khẩu sau khi chủ đội xe đổi mật khẩu.

URL `/admin` có giao diện và đăng nhập riêng, không hiện header/footer của website khách. Có thể gắn subdomain admin bằng rewrite trên hạ tầng; hiện dùng chung ứng dụng để hai bên đồng bộ cùng database.

Đã deploy production trên Vercel và xác minh URL thật. Các biến Supabase, khóa ký và cấu hình Telegram đã đặt dạng mã hóa ở project, không nằm trong source public. Chi tiết deployment và kiểm tra ở `docs/ADMIN-SUPABASE.md`.

## Kiểm tra

```bash
npm run typecheck
npm test
npm run test:admin
npm run test:integration
npm run test:e2e
npm run build
```

Bài admin test lấy mật khẩu qua `ADMIN_TEST_PASSWORD` trong môi trường kiểm thử riêng, không có mật khẩu mặc định trong source. Test tạo dữ liệu có nhãn `AUTOMATED_TEST_ONLY`, cần dọn chính xác những bản ghi kiểm thử đó sau khi chạy. Không chạy trên dữ liệu kinh doanh khi chưa tách môi trường kiểm thử.

## Liên hệ, Google Search và gợi ý địa điểm

- Hotline/Zalo/Telegram cá nhân: `0977823111`, khai báo ở `lib/contact.ts`. Telegram dùng liên kết số quốc tế; tài khoản cần cho phép tìm bằng số điện thoại. Nhóm thông báo đơn vẫn được cấu hình riêng bằng `TELEGRAM_CHAT_ID`.
- Đã có robots, sitemap, metadata và dữ liệu cấu trúc TaxiService. Khi đưa lên Internet, đặt `APP_URL` thành tên miền HTTPS thật rồi build lại; thêm tên miền vào Google Search Console và gửi `/sitemap.xml`. Google tự quyết định việc lập chỉ mục và thứ hạng; mã nguồn không thể đảm bảo xuất hiện ngay hoặc điều khiển gợi ý từ khóa của Google.
- Để gợi ý địa chỉ từ Google Maps: bật billing và **Places API (New)**, **Maps JavaScript API**, **Routes API**, **Geocoding API** trên Google Cloud. Đặt `GOOGLE_MAPS_API_KEY` (server) và `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` (browser, giới hạn theo domain), rồi build/khởi động lại. Dùng Autocomplete (New) khi gõ, chỉ lấy Place Details khi chọn kết quả; cùng session token để nhóm các truy vấn. Khi chưa cấu hình Google, tìm địa chỉ qua Photon/OpenStreetMap và giữ danh sách địa điểm quen thuộc. Photon hỗ trợ gợi ý khi gõ; không dùng Nominatim công cộng cho autocomplete. `PHOTON_URL` cho phép trỏ sang máy chủ Photon riêng. Máy chủ demo công khai có giới hạn và không có SLA; trước khi tăng tải cần dùng máy chủ riêng hoặc cấu hình Google.

Kiểm tra địa điểm thật (không tạo đơn): `npm run test:places`. Để dùng Lightpanda, chạy `lightpanda serve --port 9223` rồi `LIGHTPANDA_CDP=http://127.0.0.1:9223 npm run test:places`. Script thử gợi ý Bạch Mai, chọn địa điểm, xác nhận và hủy bản nháp; Chromium kiểm tra thêm thao tác chạm và mức zoom. Không giả lập API tìm kiếm.


## Nguồn địa điểm

- `VIETMAP_API_KEY` (server-only): bật Autocomplete/Place/Reverse v4 cho địa điểm Việt Nam; cần key của chủ dự án, không dùng key demo. Tra cứu v4 giữ nguyên ref_id và tọa độ khách ghim.
- Nếu không có VIETMAP: giữ Google khi đã cấu hình, hoặc Photon/OpenStreetMap hiện tại. GPS và ghim đều gọi reverse lookup, giữ tên và địa chỉ riêng. Cho bổ sung tên cổng/lối vào khi dữ liệu bản đồ chưa đủ.
- Admin phân công được tài xế hoạt động kể cả khác dòng xe đăng ký, có cảnh báo để điều phối kiểm tra xe thực tế; lựa chọn tài xế trên trang khách vẫn lọc theo dòng xe.
