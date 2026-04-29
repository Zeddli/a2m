import { eq } from "drizzle-orm";
import { issueApiKey, hashApiKey } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db/client";
import { agents } from "@/lib/server/db/schema";
import { fail, ok, parseJson } from "@/lib/server/http";
import { registerAgentSchema } from "@/lib/server/schemas";

// Handles app-level agent registration and one-time API key issuance.
export async function POST(request: Request) {
  try {
    const input = await parseJson(request, registerAgentSchema);
    const db = getDb();

    const [existing] = await db.select().from(agents).where(eq(agents.name, input.name)).limit(1);
    if (existing) return fail("Agent name already exists", 409);

    const apiKey = issueApiKey();
    const apiKeyHash = hashApiKey(apiKey);

    const [agent] = await db
      .insert(agents)
      .values({
        name: input.name,
        role: input.role,
        apiKeyHash,
        locusWalletAddress: input.locusWalletAddress || null,
      })
      .returning({
        id: agents.id,
        name: agents.name,
        role: agents.role,
        locusWalletAddress: agents.locusWalletAddress,
        createdAt: agents.createdAt,
      });

    return ok(
      {
        agent,
        apiKey,
      },
      201,
    );
  } catch (error) {
    if (error instanceof Error) return fail(error.message, 400);
    return fail("Unexpected registration error", 500);
  }
}
