import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
export function hashPassword(value: string) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt$${salt}$${scryptSync(value, salt, 64).toString("hex")}`;
}
export function checkPassword(value: string, hash: string) {
  try {
    const [algorithm, salt, key] = hash.split("$");
    if (algorithm !== "scrypt" || !salt || !key) return false;
    const expected = Buffer.from(key, "hex"),
      actual = scryptSync(value, salt, 64);
    return (
      expected.length === actual.length && timingSafeEqual(expected, actual)
    );
  } catch {
    return false;
  }
}
