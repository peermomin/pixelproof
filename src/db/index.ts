import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { schema } from "./schema";

const globalDb = globalThis as typeof globalThis & { pixelproofPool?: Pool };
function createRuntime() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL must be set before Pixelproof can connect to its database.");

  const pool = globalDb.pixelproofPool ?? new Pool({
    connectionString,
    max: Number(process.env.DATABASE_POOL_SIZE ?? 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  if (process.env.NODE_ENV !== "production") globalDb.pixelproofPool = pool;
  return { database: drizzle(pool, { schema }), pool };
}

let runtime: ReturnType<typeof createRuntime> | undefined;

export function getDb() {
  runtime ??= createRuntime();
  return runtime.database;
}

export function getPool() {
  runtime ??= createRuntime();
  return runtime.pool;
}
