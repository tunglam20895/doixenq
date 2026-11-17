import { randomBytes } from "node:crypto";
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
if (!existsSync(".env.local")) {
  writeFileSync(
    ".env.local",
    `AUTH_SECRET=${randomBytes(48).toString("hex")}\nCRON_SECRET=${randomBytes(32).toString("hex")}\nAPP_URL=http://localhost:3000\nDEMO_DATA=true\n`,
    { mode: 0o600 },
  );
  console.log(
    "Created .env.local with unique credentials. Secrets remain in this local file.",
  );
} else console.log(".env.local already exists; preserved.");
mkdirSync(".data", { recursive: true });
