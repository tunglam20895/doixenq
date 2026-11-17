import { defineConfig } from "@playwright/test";
try {
  process.loadEnvFile(".env.local");
} catch {}
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45000,
  workers: 1,
  use: {
    baseURL: process.env.TEST_URL || "http://localhost:3000",
    browserName: "chromium",
    headless: true,
    actionTimeout: 15000,
    launchOptions: {
      executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    },
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  reporter: "list",
});
