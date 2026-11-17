"use client";

import { useEffect, useState } from "react";
import { siteUrl } from "@/lib/site";

export default function TripLookupQR({
  id,
  token,
}: {
  id: string;
  token: string;
}) {
  const [image, setImage] = useState("");
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setImage("");
    setError(false);
    const url = new URL("/tra-cuu", siteUrl);
    url.searchParams.set("ma", id);
    url.searchParams.set("token", token);
    import("qrcode")
      .then((qr) =>
        qr.toDataURL(url.href, {
          width: 800,
          margin: 4,
          errorCorrectionLevel: "M",
        }),
      )
      .then((value) => {
        if (active) setImage(value);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [id, token, attempt]);
  return (
    <section className="trip-lookup-qr" aria-label="QR tra cứu chuyến vừa đặt">
      <h2>QR tra cứu chuyến của bạn</h2>
      <p>Lưu mã QR để mở lại đúng chuyến này, không cần nhập số điện thoại.</p>
      {image ? (
        <>
          <img
            src={image}
            width={224}
            height={224}
            alt={`QR tra cứu chuyến ${id}`}
          />
          <a
            href={image}
            download={`tra-cuu-${id}.png`}
            className="btn btn-secondary"
          >
            Tải QR về máy
          </a>
        </>
      ) : error ? (
        <div role="status">
          <p>
            Chưa tạo được QR. Bạn vẫn có thể dùng nút Theo dõi chuyến xe bên
            dưới.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Tạo lại QR
          </button>
        </div>
      ) : (
        <p role="status">Đang tạo mã QR…</p>
      )}
      <p className="input-hint">
        QR chứa đường dẫn tra cứu riêng của chuyến. Chỉ chia sẻ với người đi
        cùng.
      </p>
    </section>
  );
}
