import { randomBytes } from "node:crypto";
import { access, readFile, writeFile } from "node:fs/promises";

try {
  await access(".env");
  console.error(".env already exists. Keeping it unchanged.");
  process.exitCode = 1;
} catch {
  const template = await readFile(".env.example", "utf8");
  const configured = template
    .replace("__POSTGRES_PASSWORD__", randomBytes(32).toString("base64url"))
    .replace("__BETTER_AUTH_SECRET__", randomBytes(48).toString("base64url"));
  await writeFile(".env", configured, { flag: "wx", mode: 0o600 });
  console.info("Created .env with fresh database and session secrets.");
  console.info("Start Pixelproof with: docker compose up --build");
}
