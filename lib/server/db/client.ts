import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

let pool: Pool | null = null;

// Ensures public schema is in search_path for pooled Supabase connections.
function withPublicSearchPath(databaseUrl: string): string {
  try {
    const parsed = new URL(databaseUrl);
    if (!parsed.searchParams.get("options")) parsed.searchParams.set("options", "-csearch_path=public");
    return parsed.toString();
  } catch {
    return databaseUrl;
  }
}

// Returns a singleton Postgres pool to avoid reconnect churn.
function getPool(): Pool {
  if (pool) return pool;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");

  const connectionString = withPublicSearchPath(databaseUrl);
  const useSupabaseSsl = connectionString.includes("supabase.com");

  pool = new Pool({
    connectionString,
    max: 10,
    ssl: useSupabaseSsl ? { rejectUnauthorized: false } : undefined,
  });

  return pool;
}

// Creates a typed Drizzle client bound to the shared pool.
export function getDb() {
  return drizzle(getPool(), { schema });
}
