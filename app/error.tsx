"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="content-page">
      <div className="wrap">
        <h1>Chưa thể mở trang.</h1>
        <p>
          Vui lòng thử tải lại. Yêu cầu đã gửi thành công vẫn được giữ trong hệ
          thống.
        </p>
        <button className="btn btn-primary" onClick={reset}>
          Thử lại
        </button>
      </div>
    </main>
  );
}
