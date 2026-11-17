import { test } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, checkPassword } from "../lib/admin/password";
test("mật khẩu băm có salt riêng và kiểm tra đúng/sai", () => {
  const a = hashPassword("sample-password-for-test"),
    b = hashPassword("sample-password-for-test");
  assert.notEqual(a, b);
  assert.equal(checkPassword("sample-password-for-test", a), true);
  assert.equal(checkPassword("incorrect", a), false);
  assert.equal(checkPassword("sample-password-for-test", "invalid"), false);
  assert.ok(!a.includes("sample-password-for-test"));
});
