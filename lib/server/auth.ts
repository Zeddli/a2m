import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/server/db/client";
import { agents } from "@/lib/server/db/schema";

const API_KEY_PREFIX = "a2m_";

// Hashes API keys before persistence to avoid plaintext credential storage.
export function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

// Issues a random API key string for a newly registered agent.
export function issueApiKey(): string {
  const random = crypto.randomBytes(24).toString("hex");
  return `${API_KEY_PREFIX}${random}`;
}

// Extracts a bearer token from the request headers.
export function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  if (!authHeader.toLowerCase().startsWith("bearer ")) return null;
  return authHeader.slice(7).trim();
}

// Resolves the authenticated agent from a bearer API key.
export async function requireAgent(request: Request) {
  const token = extractBearerToken(request);
  if (!token) return null;

  const db = getDb();
  const [agent] = await db
    .select()
    .from(agents)
    .where(eq(agents.apiKeyHash, hashApiKey(token)))
    .limit(1);

  return agent ?? null;
}
