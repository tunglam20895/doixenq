"use client";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { useState } from "react";
import {
  ArrowUpRight,
  Menu,
  X,
  MapPin,
  ArrowRight,
  CarFront,
  Search,
  Phone,
  Send,
  MessageCircle,
} from "lucide-react";
import { CONTACT } from "@/lib/contact";
import { usePathname } from "next/navigation";
export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link
          href="/"
          className="brand"
          aria-label="Đội xe Như Quỳnh — Trang chủ"
        >
          <BrandLogo />
        </Link>
        <nav
          className={open ? "desktop-nav is-open" : "desktop-nav"}
          aria-label="Điều hướng chính"
        >
          <Link href="/#doi-xe" onClick={() => setOpen(false)}>
            Đội xe
          </Link>
          <Link href="/#hanh-trinh" onClick={() => setOpen(false)}>
            Tuyến đường
          </Link>
          <Link href="/#tai-xe" onClick={() => setOpen(false)}>
            Tài xế
          </Link>
          <Link href="/bang-gia" onClick={() => setOpen(false)}>
            Bảng giá
          </Link>
        </nav>
        <div className="header-actions">
          <Link className="lookup-link" href="/tra-cuu">
            <Search size={17} />
            <span>Tra cứu chuyến</span>
          </Link>
          <Link
            className="btn btn-primary small"
            href="/dat-xe"
            aria-current={pathname === "/dat-xe" ? "page" : undefined}
          >
            Đặt xe <ArrowUpRight size={17} />
          </Link>
          <button
            className="icon-button menu-toggle"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Đóng menu" : "Mở menu"}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-top">
          <div>
            <span className="eyebrow">ĐỘI XE NHƯ QUỲNH HƯNG YÊN</span>
            <h2>
              Chuyến tới,
              <br />
              mình đi cùng nhau.
            </h2>
            <Link className="btn btn-lime" href="/dat-xe">
              Đặt chuyến xe <ArrowUpRight size={20} />
            </Link>
          </div>
          <div className="footer-columns">
            <div>
              <h3>Hành trình của bạn</h3>
              <Link href="/#doi-xe">Chọn dòng xe</Link>
              <Link href="/#tai-xe">Gặp tài xế</Link>
              <Link href="/tra-cuu">Tra cứu chuyến</Link>
              <Link href="/bang-gia">Xem bảng giá</Link>
            </div>
            <div>
              <h3>Thông tin cần biết</h3>
              <Link href="/chinh-sach">Đặt xe & hủy chuyến</Link>
              <Link href="/chinh-sach#bao-mat">Bảo mật thông tin</Link>
              <span className="footer-location">
                <MapPin size={17} /> Như Quỳnh, Hưng Yên
              </span>
              <a href={CONTACT.telephone}>Hotline: {CONTACT.phone}</a>
              <a href={CONTACT.zalo} target="_blank" rel="noopener noreferrer">
                Zalo: {CONTACT.phone}
              </a>
              <a
                href={CONTACT.telegram}
                target="_blank"
                rel="noopener noreferrer"
              >
                Telegram: {CONTACT.phone}
              </a>
              <span>Xe 5–7 chỗ · Đặt lịch trước</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Đội xe Như Quỳnh Hưng Yên.</span>
          <span>Bản trải nghiệm · Bảng giá mẫu.</span>
          <Link href="/nguon-anh">
            Nguồn hình ảnh <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
export function MobileNav() {
  const p = usePathname();
  return (
    <nav className="mobile-bottom" aria-label="Điều hướng điện thoại">
      <Link href="/" aria-current={p === "/" ? "page" : undefined}>
        <CarFront size={20} />
        Đội xe
      </Link>
      <Link
        href="/dat-xe"
        className="mobile-book"
        aria-current={p === "/dat-xe" ? "page" : undefined}
      >
        Đặt chuyến xe <ArrowRight size={17} />
      </Link>
      <Link
        href="/tra-cuu"
        aria-current={p === "/tra-cuu" ? "page" : undefined}
      >
        <Search size={19} />
        Tra cứu
      </Link>
    </nav>
  );
}

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <>{children}</>;
  return (
    <>
      <Header />
      {children}
      <Footer />
      <nav className="floating-contact" aria-label="Liên hệ đội xe">
        <a
          className="contact-phone"
          href={CONTACT.telephone}
          aria-label={`Gọi ${CONTACT.phone}`}
        >
          <Phone size={20} />
          <span>{CONTACT.phone}</span>
        </a>
        <a
          className="contact-zalo"
          href={CONTACT.zalo}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Zalo ${CONTACT.phone}`}
        >
          <MessageCircle size={20} />
          <span>Zalo</span>
        </a>
        <a
          className="contact-telegram"
          href={CONTACT.telegram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Telegram ${CONTACT.phone}`}
        >
          <Send size={20} />
          <span>Telegram</span>
        </a>
      </nav>
      <MobileNav />
    </>
  );
}
