import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/server/db/client";
import { checkoutSessions, orders, webhookEvents } from "@/lib/server/db/schema";
import { fail, ok } from "@/lib/server/http";
import { verifyWebhookSignature } from "@/lib/server/webhook-verify";

interface LocusWebhookPayload {
  event: "checkout.session.paid" | "checkout.session.expired";
  data: {
    sessionId: string;
    paymentTxHash?: string;
    payerAddress?: string;
    paidAt?: string;
  };
  timestamp: string;
}

// Processes verified Locus webhook events and updates order state.
export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-signature-256");
    if (!signature) return fail("Missing signature", 400);

    const body = await request.text();
    const payload = JSON.parse(body) as LocusWebhookPayload;

    if (!payload?.event || !payload?.data?.sessionId) return fail("Invalid payload", 400);

    const db = getDb();
    const [session] = await db
      .select()
      .from(checkoutSessions)
      .where(eq(checkoutSessions.sessionId, payload.data.sessionId))
      .limit(1);

    if (!session) return fail("Unknown session", 404);
    if (!session.webhookSecret) return fail("Session missing webhook secret", 400);

    if (!verifyWebhookSignature(body, signature, session.webhookSecret)) return fail("Invalid signature", 401);

    const alreadyProcessed = await db
      .select()
      .from(webhookEvents)
      .where(
        and(
          eq(webhookEvents.source, "locus"),
          eq(webhookEvents.event, payload.event),
          eq(webhookEvents.sessionId, payload.data.sessionId),
        ),
      )
      .limit(1);

    if (alreadyProcessed[0]) return ok({ accepted: true, duplicate: true });

    await db.insert(webhookEvents).values({
      source: "locus",
      event: payload.event,
      sessionId: payload.data.sessionId,
      signature,
      payload: payload as unknown as Record<string, unknown>,
    });

    if (payload.event === "checkout.session.paid") {
      await db
        .update(checkoutSessions)
        .set({
          status: "PAID",
          updatedAt: new Date(),
        })
        .where(eq(checkoutSessions.id, session.id));

      await db
        .update(orders)
        .set({
          status: "PAID",
          paidAt: payload.data.paidAt ? new Date(payload.data.paidAt) : new Date(),
          paymentTxHash: payload.data.paymentTxHash || null,
          payerAddress: payload.data.payerAddress || null,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, session.orderId));
    }

    if (payload.event === "checkout.session.expired") {
      await db
        .update(checkoutSessions)
        .set({
          status: "EXPIRED",
          updatedAt: new Date(),
        })
        .where(eq(checkoutSessions.id, session.id));

      await db
        .update(orders)
        .set({
          status: "EXPIRED",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, session.orderId));
    }

    return ok({ accepted: true });
  } catch (error) {
    if (error instanceof Error) return fail(error.message, 400);
    return fail("Failed to process webhook", 500);
  }
}
