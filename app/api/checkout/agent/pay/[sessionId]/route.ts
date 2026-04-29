import { eq } from "drizzle-orm";
import { requireAgent } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db/client";
import { checkoutSessions, orders } from "@/lib/server/db/schema";
import { fail, ok } from "@/lib/server/http";
import { payLocusSession } from "@/lib/server/locus";

// Triggers programmatic session payment for an authenticated buyer agent.
export async function POST(request: Request, context: { params: Promise<{ sessionId: string }> }) {
  try {
    const actor = await requireAgent(request);
    if (!actor) return fail("Unauthorized", 401);
    if (actor.role === "seller") return fail("Seller-only agents cannot pay orders", 403);

    const { sessionId } = await context.params;
    const db = getDb();

    const [session] = await db
      .select()
      .from(checkoutSessions)
      .where(eq(checkoutSessions.sessionId, sessionId))
      .limit(1);

    if (!session) return fail("Session not found", 404);

    const [order] = await db.select().from(orders).where(eq(orders.id, session.orderId)).limit(1);
    if (!order) return fail("Order not found", 404);
    if (order.buyerAgentId !== actor.id) return fail("Forbidden", 403);

    const buyerLocusApiKey = request.headers.get("x-locus-api-key");
    if (!buyerLocusApiKey) return fail("Missing x-locus-api-key header", 400);
    const serverLocusApiKey = process.env.LOCUS_API_KEY;
    if (serverLocusApiKey && buyerLocusApiKey.trim() === serverLocusApiKey.trim()) {
      return fail("Shared server Locus API key is not allowed. Use the buyer's own Locus key.", 403);
    }

    const paymentResult = await payLocusSession(sessionId, buyerLocusApiKey);
    return ok({
      message: "Payment request submitted",
      sessionId,
      paymentResult,
    });
  } catch (error) {
    if (error instanceof Error) return fail(error.message, 400);
    return fail("Failed to submit payment", 500);
  }
}
