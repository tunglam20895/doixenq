import sources from "@/public/images/sources.json";
export const metadata = { title: "Nguồn hình ảnh" };
export default function Page() {
  return (
    <main id="main" className="content-page">
      <div className="wrap policy-content">
        <span className="eyebrow">HÌNH ẢNH TRONG BẢN THIẾT KẾ</span>
        <h1>Nguồn hình ảnh.</h1>
        <p className="page-lead">
          Ảnh minh họa dòng xe từ website hãng và đại lý, chưa phải ảnh xe thực
          tế của đội xe Như Quỳnh Hưng Yên. Cần thay bằng ảnh đội xe hoặc xác
          nhận quyền sử dụng trước khi khai thác thương mại.
        </p>
        <ul className="credits-list">
          {Object.entries(sources).map(([name, url]) => (
            <li key={name}>
              <strong>{name.toUpperCase()}</strong>
              <a href={url} target="_blank" rel="noreferrer">
                Xem nguồn ảnh
              </a>
            </li>
          ))}
        </ul>
        <p>
          Hình tuyến đường và phối cảnh trang đầu được dựng riêng cho giao diện.
          Website sử dụng ảnh đúng dòng xe từ hãng; không sử dụng mô hình 3D.
        </p>
      </div>
    </main>
  );
}
