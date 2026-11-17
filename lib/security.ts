import { createHmac, timingSafeEqual, createHash } from "node:crypto";
export function sign<T>(data: T) {
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32)
    throw new Error("AUTH_SECRET_NOT_CONFIGURED");
  const body = Buffer.from(JSON.stringify(data)).toString("base64url");
  return (
    body +
    "." +
    createHmac("sha256", process.env.AUTH_SECRET)
      .update(body)
      .digest("base64url")
  );
}
export function verify<T>(value: string): T {
  const [body, sig] = value.split(".");
  if (!body || !sig)
    throw new Error("Báo giá không hợp lệ. Vui lòng tính lại giá.");
  const expected = sign(
    JSON.parse(Buffer.from(body, "base64url").toString()),
  ).split(".")[1];
  if (!equal(sig, expected))
    throw new Error("Báo giá không hợp lệ. Vui lòng tính lại giá.");
  return JSON.parse(Buffer.from(body, "base64url").toString());
}
export function equal(a: string, b: string) {
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export function clientKey(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return createHash("sha256")
    .update(ip + (process.env.AUTH_SECRET || "local"))
    .digest("hex");
}
