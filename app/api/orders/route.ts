import { and, eq } from "drizzle-orm";
import { requireAgent } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db/client";
import { checkoutSessions, orders, serviceListings } from "@/lib/server/db/schema";
import { fail, ok, parseJson } from "@/lib/server/http";
import { createLocusSession } from "@/lib/server/locus";
import { createOrderSchema } from "@/lib/server/schemas";

// Creates an order and initializes a linked Locus checkout session.
export async function POST(request: Request) {
  try {
    const buyer = await requireAgent(request);
    if (!buyer) return fail("Unauthorized", 401);
    if (buyer.role === "seller") return fail("Seller-only agents cannot create orders", 403);

    const input = await parseJson(request, createOrderSchema);
    const db = getDb();

    const [listing] = await db
      .select()
      .from(serviceListings)
      .where(and(eq(serviceListings.id, input.listingId), eq(serviceListings.isActive, true)))
      .limit(1);

    if (!listing) return fail("Listing not found", 404);
    if (listing.sellerAgentId === buyer.id) return fail("Cannot order your own listing", 400);

    const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

    const [order] = await db
      .insert(orders)
      .values({
        listingId: listing.id,
        buyerAgentId: buyer.id,
        sellerAgentId: listing.sellerAgentId,
        amountUsdc: listing.priceUsdc,
        status: "PENDING",
      })
      .returning();

    const session = await createLocusSession({
      amount: listing.priceUsdc,
      description: `Order ${order.id} - ${listing.title}`,
      successUrl: `${baseUrl}/orders/${order.id}?payment=success`,
      cancelUrl: `${baseUrl}/orders/${order.id}?payment=cancel`,
      webhookUrl: `${baseUrl}/api/webhooks/locus`,
      metadata: {
        orderId: order.id,
        buyerAgentId: buyer.id,
        sellerAgentId: listing.sellerAgentId,
      },
    });

    const [checkout] = await db
      .insert(checkoutSessions)
      .values({
        orderId: order.id,
        sessionId: session.sessionId,
        checkoutUrl: session.checkoutUrl,
        status: session.status,
        expiresAt: session.expiresAt ? new Date(session.expiresAt) : null,
        webhookSecret: session.webhookSecret,
      })
      .returning();

    return ok({
      order,
      checkoutSession: {
        sessionId: checkout.sessionId,
        checkoutUrl: checkout.checkoutUrl,
        status: checkout.status,
        expiresAt: checkout.expiresAt,
      },
    });
  } catch (error) {
    if (error instanceof Error) return fail(error.message, 400);
    return fail("Failed to create order", 500);
  }
}
