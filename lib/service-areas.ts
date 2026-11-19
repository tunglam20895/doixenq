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
  {
    href: "/taxi-hung-yen",
    label: "Taxi Hưng Yên",
    summary: "So sánh xe 5–7 chỗ, cước dự kiến và các khu vực nhận đón.",
  },
  {
    href: "/taxi-yen-my",
    label: "Taxi Yên Mỹ",
    summary: "Hẹn giờ đi Hà Nội, Nội Bài hoặc khứ hồi từ Yên Mỹ.",
  },
  {
    href: "/taxi-my-hao",
    label: "Taxi Mỹ Hào",
    summary: "Chọn xe theo số người và hành lý, đón tại nhà hoặc nơi làm việc.",
  },
  {
    href: "/taxi-pho-noi",
    label: "Taxi Phố Nối",
    summary: "Xác định điểm hẹn, đi Yên Mỹ, Mỹ Hào hoặc sân bay.",
  },
] as const;
