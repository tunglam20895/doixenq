import Image from "next/image";

export default function BrandLogo() {
  return (
    <Image
      className="brand-logo"
      src="/brand/nhu-quynh-logo.png"
      alt="Đội xe Như Quỳnh · Hưng Yên"
      width={2172}
      height={724}
      loading="eager"
      sizes="(max-width: 639px) 174px, 228px"
    />
  );
}
