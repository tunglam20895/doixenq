export type Place = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
};
export type Vehicle = {
  id: string;
  name: string;
  seats: number;
  passengers: number;
  luggage: number;
  electric: boolean;
  image: string;
  category: string;
  opening: number;
  perKm: number;
  longKm: number;
  description: string;
  features: string[];
};
export const BRAND = {
  name: "Như Quỳnh",
  fullName: "Đội xe Như Quỳnh Hưng Yên",
  area: "Như Quỳnh, Hưng Yên",
  tagline: "Từ Như Quỳnh, đến nơi bạn cần.",
};
// Replace sample vehicle prices and descriptions here. Seat counts include the driver.
export const VEHICLES: Vehicle[] = [
  {
    id: "limo",
    name: "VinFast Limo Green",
    seats: 7,
    passengers: 6,
    luggage: 3,
    electric: true,
    image: "/images/limo.webp",
    category: "Rộng rãi cho cả nhà",
    opening: 17000,
    perKm: 12000,
    longKm: 10000,
    description:
      "Không gian 7 chỗ cho chuyến đi cùng gia đình, nhóm bạn và hành lý.",
    features: ["Xe điện", "Điều hòa", "Cổng sạc"],
  },
  {
    id: "ertiga",
    name: "Suzuki Ertiga",
    seats: 7,
    passengers: 6,
    luggage: 3,
    electric: false,
    image: "/images/ertiga-black.webp",
    category: "Bạn đồng hành đường dài",
    opening: 17000,
    perKm: 12000,
    longKm: 10000,
    description:
      "Dòng MPV 7 chỗ quen thuộc cho những chuyến liên tỉnh và về quê.",
    features: ["7 chỗ", "Điều hòa", "Ghế gập linh hoạt"],
  },
  {
    id: "vf5",
    name: "VinFast VF 5",
    seats: 5,
    passengers: 4,
    luggage: 2,
    electric: true,
    image: "/images/vf5.webp",
    category: "Gọn gàng trong phố",
    opening: 14000,
    perKm: 10000,
    longKm: 8500,
    description:
      "Xe điện nhỏ gọn cho chuyến đi cá nhân, cặp đôi và gia đình nhỏ.",
    features: ["Xe điện", "Điều hòa", "Cổng sạc"],
  },
  {
    id: "vios",
    name: "Toyota Vios",
    seats: 5,
    passengers: 4,
    luggage: 2,
    electric: false,
    image: "/images/vios.webp",
    category: "Lựa chọn quen thuộc",
    opening: 14000,
    perKm: 10000,
    longKm: 8500,
    description: "Sedan 5 chỗ, khoang hành lý riêng cho chuyến đi hằng ngày.",
    features: ["5 chỗ", "Điều hòa", "Cốp hành lý riêng"],
  },
  {
    id: "vf6",
    name: "VinFast VF 6",
    seats: 5,
    passengers: 4,
    luggage: 2,
    electric: true,
    image: "/images/vf6.webp",
    category: "Thêm thoải mái mỗi chuyến",
    opening: 16000,
    perKm: 11000,
    longKm: 9000,
    description:
      "Xe điện 5 chỗ cho hành trình công việc, sân bay và chuyến đi cuối tuần.",
    features: ["Xe điện", "Điều hòa", "Cổng sạc"],
  },
  {
    id: "nerio",
    name: "VinFast Nerio Green",
    seats: 5,
    passengers: 4,
    luggage: 2,
    electric: true,
    image: "/images/nerio.webp",
    category: "Chuyến đi xanh",
    opening: 15000,
    perKm: 10500,
    longKm: 8800,
    description: "Xe điện 5 chỗ phục vụ nhu cầu đưa đón và đi lại liên tỉnh.",
    features: ["Xe điện", "Điều hòa", "Cổng sạc"],
  },
];
// Driver information is intentionally code-managed. These are sample profiles, not verified staff.
export const DRIVERS = [
  {
    id: "minh",
    name: "Anh Minh",
    initials: "M",
    color: "#dce6dd",
    vehicleIds: ["limo", "vf6"],
    intro: "Nhận chuyến sân bay và liên tỉnh.",
    area: "Như Quỳnh · Hà Nội",
  },
  {
    id: "hung",
    name: "Anh Hùng",
    initials: "H",
    color: "#eadfc9",
    vehicleIds: ["ertiga", "vios"],
    intro: "Nhận chuyến gia đình, công việc và về quê.",
    area: "Hưng Yên · Hải Dương",
  },
  {
    id: "tuan",
    name: "Anh Tuấn",
    initials: "T",
    color: "#dce5ea",
    vehicleIds: ["vf5", "nerio"],
    intro: "Nhận chuyến nội thành và đặt lịch trước.",
    area: "Như Quỳnh · Gia Lâm",
  },
];
export const PLACES: Place[] = [
  {
    id: "nhu-quynh",
    name: "Như Quỳnh, Hưng Yên",
    address: "Khu vực Như Quỳnh, Hưng Yên",
    lat: 20.9815,
    lng: 105.9849,
  },
  {
    id: "noi-bai",
    name: "Sân bay Nội Bài",
    address: "Nhà ga T1, sân bay Nội Bài, Hà Nội",
    lat: 21.2187,
    lng: 105.8042,
  },
  {
    id: "hoan-kiem",
    name: "Hồ Hoàn Kiếm",
    address: "Khu vực Hồ Hoàn Kiếm, Hà Nội",
    lat: 21.0285,
    lng: 105.8542,
  },
  {
    id: "ecopark",
    name: "Khu đô thị Ecopark",
    address: "Ecopark, Hưng Yên",
    lat: 20.9497,
    lng: 105.9385,
  },
  {
    id: "hung-yen",
    name: "Trung tâm Hưng Yên",
    address: "Khu vực Phố Hiến, Hưng Yên",
    lat: 20.6464,
    lng: 106.0511,
  },
  {
    id: "hai-phong",
    name: "Trung tâm Hải Phòng",
    address: "Khu vực Nhà hát lớn, Hải Phòng",
    lat: 20.8561,
    lng: 106.6822,
  },
  {
    id: "hai-duong",
    name: "Trung tâm Hải Dương",
    address: "Khu vực trung tâm Hải Dương",
    lat: 20.9373,
    lng: 106.3146,
  },
  {
    id: "ninh-binh",
    name: "Tràng An, Ninh Bình",
    address: "Khu du lịch Tràng An, Ninh Bình",
    lat: 20.2505,
    lng: 105.9187,
  },
  {
    id: "times-city",
    name: "Times City",
    address: "Khu đô thị Times City, Hà Nội",
    lat: 20.9959,
    lng: 105.8678,
  },
];
export const POPULAR_ROUTES = [
  {
    from: "nhu-quynh",
    to: "noi-bai",
    label: "Sân bay Nội Bài",
    detail: "Đưa đón sân bay",
    distance: 48,
    kind: "airport",
  },
  {
    from: "nhu-quynh",
    to: "hoan-kiem",
    label: "Trung tâm Hà Nội",
    detail: "Công việc & gặp gỡ",
    distance: 24,
    kind: "city",
  },
  {
    from: "nhu-quynh",
    to: "hai-phong",
    label: "Hải Phòng",
    detail: "Hành trình liên tỉnh",
    distance: 86,
    kind: "coast",
  },
];
export const money = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
export const tripDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
