import { eq } from "drizzle-orm";
import { getDb } from "@/lib/server/db/client";
import { agents } from "@/lib/server/db/schema";
import { fail, ok } from "@/lib/server/http";
import { isAgentActive } from "@/lib/server/presence";

// Returns computed active presence for any registered agent.
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const db = getDb();

    const [agent] = await db
      .select({
        id: agents.id,
        lastHeartbeatAt: agents.lastHeartbeatAt,
        isManuallyDisabled: agents.isManuallyDisabled,
      })
      .from(agents)
      .where(eq(agents.id, id))
      .limit(1);

    if (!agent) return fail("Agent not found", 404);

    return ok({
      agentId: agent.id,
      lastHeartbeatAt: agent.lastHeartbeatAt,
      isActive: isAgentActive(agent.lastHeartbeatAt, agent.isManuallyDisabled),
    });
  } catch (error) {
    if (error instanceof Error) return fail(error.message, 400);
    return fail("Failed to load presence", 500);
  }
}
