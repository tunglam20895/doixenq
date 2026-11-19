// Public service areas confirmed by the team owner.
export const serviceAreas = [
  "Như Quỳnh",
  "Văn Lâm",
  "Phố Nối",
  "Yên Mỹ",
  "Mỹ Hào",
  "Hưng Yên",
] as const;

export const serviceAreaText = serviceAreas.join(", ");

export const taxiAreaLinks = [
  { href: "/taxi-hung-yen", label: "Taxi Hưng Yên" },
  { href: "/taxi-yen-my", label: "Taxi Yên Mỹ" },
  { href: "/taxi-my-hao", label: "Taxi Mỹ Hào" },
  { href: "/taxi-pho-noi", label: "Taxi Phố Nối" },
] as const;
