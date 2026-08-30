import { Pool, type PoolClient } from "pg";

const globalForDb = globalThis as unknown as { harshaPool?: Pool };

export const db = globalForDb.harshaPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
  max: Number(process.env.DATABASE_POOL_MAX || 5),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

if (process.env.NODE_ENV !== "production") globalForDb.harshaPool = db;

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
