import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required to run database migrations.");

const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 10_000 });
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../drizzle");

try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "_pixelproof_migrations" (
      "name" text PRIMARY KEY,
      "applied_at" timestamptz NOT NULL DEFAULT now()
    )
  `);
  const files = (await readdir(root)).filter((file) => /^\d+_[\w-]+\.sql$/.test(file)).sort();

  for (const file of files) {
    const migration = await readFile(path.join(root, file), "utf8");
    const connection = await pool.connect();
    try {
      await connection.query("BEGIN");
      try {
        // Transaction-scoped lock also works through transaction-pooled services like Neon.
        await connection.query("SELECT pg_advisory_xact_lock(74190511)");
        const applied = await connection.query('SELECT 1 FROM "_pixelproof_migrations" WHERE "name" = $1', [file]);
        if (applied.rowCount) {
          await connection.query("COMMIT");
          continue;
        }
        await connection.query(migration);
        await connection.query('INSERT INTO "_pixelproof_migrations" ("name") VALUES ($1)', [file]);
        await connection.query("COMMIT");
        console.info(`Applied ${file}`);
      } catch (error) {
        await connection.query("ROLLBACK");
        throw error;
      }
    } finally {
      connection.release();
    }
  }
  console.info("Database is up to date.");
} finally {
  await pool.end();
}
