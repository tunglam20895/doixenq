export default function BookingQR() {
  return (
    <section className="admin-panel" style={{ padding: 24, marginBottom: 24 }}>
      <h2>QR đặt xe nhanh</h2>
      <p>Khách quét mã để mở trang đặt xe. Chuyến mới được xác nhận ngay sau khi đặt thành công.</p>
      <img src="/api/booking-qr" width={220} height={220} alt="Mã QR mở trang đặt xe" />
      <div className="admin-form-actions">
        <a className="admin-btn primary" href="/api/booking-qr?download=1" download="qr-dat-xe.svg">Tải mã QR để in</a>
        <a className="admin-btn" href="/dat-xe" target="_blank" rel="noreferrer">Mở trang đặt xe</a>
      </div>
      <p className="admin-footnote">QR mở https://www.doixenq.com/dat-xe. Hãy tải mã mới và quét thử trên điện thoại trước khi in.</p>
    </section>
  );
}
