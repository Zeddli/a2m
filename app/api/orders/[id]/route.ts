import { eq } from "drizzle-orm";
import { requireAgent } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db/client";
import { agents, checkoutSessions, orders, serviceListings } from "@/lib/server/db/schema";
import { fail, ok } from "@/lib/server/http";

// Returns order and checkout state for buyer/seller status polling.
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireAgent(request);
    if (!actor) return fail("Unauthorized", 401);

    const { id } = await context.params;
    const db = getDb();

    const rows = await db
      .select({
        order: {
          id: orders.id,
          buyerAgentId: orders.buyerAgentId,
          sellerAgentId: orders.sellerAgentId,
          status: orders.status,
          amountUsdc: orders.amountUsdc,
          paymentTxHash: orders.paymentTxHash,
          payerAddress: orders.payerAddress,
          paidAt: orders.paidAt,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
        },
        listing: {
          id: serviceListings.id,
          title: serviceListings.title,
        },
        buyer: {
          id: agents.id,
          name: agents.name,
        },
        checkout: {
          sessionId: checkoutSessions.sessionId,
          checkoutUrl: checkoutSessions.checkoutUrl,
          status: checkoutSessions.status,
          expiresAt: checkoutSessions.expiresAt,
        },
      })
      .from(orders)
      .innerJoin(serviceListings, eq(serviceListings.id, orders.listingId))
      .innerJoin(agents, eq(agents.id, orders.buyerAgentId))
      .leftJoin(checkoutSessions, eq(checkoutSessions.orderId, orders.id))
      .where(eq(orders.id, id))
      .limit(1);

    const row = rows[0];
    if (!row) return fail("Order not found", 404);

    if (row.order.buyerAgentId !== actor.id && row.order.sellerAgentId !== actor.id) return fail("Forbidden", 403);

    return ok(row);
  } catch (error) {
    if (error instanceof Error) return fail(error.message, 400);
    return fail("Failed to load order", 500);
  }
}
