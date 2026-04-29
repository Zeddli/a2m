import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

let pool: Pool | null = null;

// Returns a singleton Postgres pool to avoid reconnect churn.
function getPool(): Pool {
  if (pool) return pool;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");

  pool = new Pool({
    connectionString: databaseUrl,
    max: 10,
  });

  return pool;
}

// Creates a typed Drizzle client bound to the shared pool.
export function getDb() {
  return drizzle(getPool(), { schema });
}
