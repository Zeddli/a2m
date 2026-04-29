import { asc, eq } from "drizzle-orm";
import { requireAgent } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db/client";
import { orderMessages, orders } from "@/lib/server/db/schema";
import { fail, ok, parseJson } from "@/lib/server/http";
import { createOrderMessageSchema } from "@/lib/server/schemas";
import { sendAgentMail } from "@/lib/server/agentmail";

// Lists collaboration messages for a specific order.
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireAgent(request);
    if (!actor) return fail("Unauthorized", 401);

    const { id } = await context.params;
    const db = getDb();

    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!order) return fail("Order not found", 404);
    if (order.buyerAgentId !== actor.id && order.sellerAgentId !== actor.id) return fail("Forbidden", 403);

    const messages = await db
      .select()
      .from(orderMessages)
      .where(eq(orderMessages.orderId, id))
      .orderBy(asc(orderMessages.createdAt));

    return ok({ messages });
  } catch (error) {
    if (error instanceof Error) return fail(error.message, 400);
    return fail("Failed to load order messages", 500);
  }
}

// Sends materials/delivery message and optionally relays via AgentMail.
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireAgent(request);
    if (!actor) return fail("Unauthorized", 401);

    const { id } = await context.params;
    const body = await parseJson(request, createOrderMessageSchema);
    const db = getDb();

    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!order) return fail("Order not found", 404);
    if (order.buyerAgentId !== actor.id && order.sellerAgentId !== actor.id) return fail("Forbidden", 403);

    const direction = actor.id === order.buyerAgentId ? "buyer_to_seller" : "seller_to_buyer";
    const serverLocusApiKey = process.env.LOCUS_API_KEY?.trim();
    const senderLocusApiKey = request.headers.get("x-locus-api-key")?.trim();
    const allowAgentMail = Boolean(senderLocusApiKey && body.recipientEmail);

    if (senderLocusApiKey && serverLocusApiKey && senderLocusApiKey === serverLocusApiKey) {
      return fail("Shared server Locus API key is not allowed. Use the sender's own Locus key.", 403);
    }

    let agentMailMessageId: string | null = null;
    let agentMailError: string | null = null;

    if (allowAgentMail && senderLocusApiKey) {
      try {
        const mail = await sendAgentMail(senderLocusApiKey, {
          to: body.recipientEmail!,
          subject: body.subject,
          body: `${body.content}\n\nAttachments:\n${body.attachments.join("\n")}`,
        });
        agentMailMessageId = mail.messageId;
      } catch (error) {
        agentMailError = error instanceof Error ? error.message : "Unknown AgentMail error";
      }
    }

    const [message] = await db
      .insert(orderMessages)
      .values({
        orderId: order.id,
        senderAgentId: actor.id,
        direction,
        messageType: body.messageType,
        subject: body.subject,
        content: body.content,
        attachments: body.attachments,
        agentMailMessageId,
      })
      .returning();

    return ok({
      message,
      agentMail: {
        attempted: allowAgentMail,
        messageId: agentMailMessageId,
        error: agentMailError,
      },
    });
  } catch (error) {
    if (error instanceof Error) return fail(error.message, 400);
    return fail("Failed to send order message", 500);
  }
}
