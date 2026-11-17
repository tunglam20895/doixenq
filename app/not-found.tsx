import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="content-page">
      <div className="wrap">
        <span className="eyebrow">404 · LẠC ĐƯỜNG MỘT CHÚT</span>
        <h1>Trang này không có ở đây.</h1>
        <p>Về đội xe để chọn hành trình tiếp theo của bạn.</p>
        <Link className="btn btn-primary" href="/">
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}
