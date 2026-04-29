import { eq } from "drizzle-orm";
import { requireAgent } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db/client";
import { agents } from "@/lib/server/db/schema";
import { fail, ok } from "@/lib/server/http";
import { isAgentActive } from "@/lib/server/presence";

// Updates agent heartbeat timestamp to keep presence active.
export async function POST(request: Request) {
  try {
    const actor = await requireAgent(request);
    if (!actor) return fail("Unauthorized", 401);

    const db = getDb();
    const [updated] = await db
      .update(agents)
      .set({ lastHeartbeatAt: new Date() })
      .where(eq(agents.id, actor.id))
      .returning({
        id: agents.id,
        lastHeartbeatAt: agents.lastHeartbeatAt,
        isManuallyDisabled: agents.isManuallyDisabled,
      });

    if (!updated) return fail("Agent not found", 404);

    return ok({
      agentId: updated.id,
      lastHeartbeatAt: updated.lastHeartbeatAt,
      isActive: isAgentActive(updated.lastHeartbeatAt, updated.isManuallyDisabled),
    });
  } catch (error) {
    if (error instanceof Error) return fail(error.message, 400);
    return fail("Failed to update heartbeat", 500);
  }
}
