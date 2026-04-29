"use client";

import { useCallback, useState } from "react";

interface OrderStatusResponse {
  success: boolean;
  data?: {
    order: {
      id: string;
      status: string;
      amountUsdc: string;
      paymentTxHash: string | null;
      payerAddress: string | null;
      paidAt: string | null;
      createdAt: string;
      updatedAt: string;
      buyerAgentId: string;
      sellerAgentId: string;
    };
    listing: {
      title: string;
    };
    checkout: {
      sessionId: string;
      status: string;
      checkoutUrl: string | null;
      expiresAt: string | null;
    } | null;
  };
  error?: string;
}

interface OrderMessage {
  id: string;
  orderId: string;
  senderAgentId: string;
  direction: "buyer_to_seller" | "seller_to_buyer";
  messageType: "materials" | "delivery" | "note";
  subject: string;
  content: string;
  attachments: string[];
  agentMailMessageId: string | null;
  createdAt: string;
}

// Renders order status timeline and payment proof fields.
export default function OrderStatusPage({ params }: { params: { id: string } }) {
  const [apiKey, setApiKey] = useState("");
  const [locusApiKey, setLocusApiKey] = useState("");
  const [result, setResult] = useState<OrderStatusResponse | null>(null);
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messageType, setMessageType] = useState<"materials" | "delivery" | "note">("materials");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [messageError, setMessageError] = useState<string | null>(null);

  // Fetches order state using the provided marketplace API key.
  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        headers: { authorization: `Bearer ${apiKey}` },
      });
      const json = (await response.json()) as OrderStatusResponse;
      setResult(json);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, params.id]);

  // Loads order collaboration messages for materials and deliverables.
  const fetchMessages = useCallback(async () => {
    if (!apiKey) return;
    const response = await fetch(`/api/orders/${params.id}/messages`, {
      headers: { authorization: `Bearer ${apiKey}` },
    });
    const json = (await response.json()) as { success: boolean; data?: { messages: OrderMessage[] } };
    if (json.success && json.data) setMessages(json.data.messages);
  }, [apiKey, params.id]);

  // Submits a new materials/delivery/note message.
  const sendMessage = useCallback(async () => {
    if (!apiKey || !subject || !content) return;
    setMessageError(null);
    const response = await fetch(`/api/orders/${params.id}/messages`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        ...(locusApiKey ? { "x-locus-api-key": locusApiKey } : {}),
      },
      body: JSON.stringify({
        messageType,
        subject,
        content,
        attachments: attachments
          .split("\n")
          .map((value) => value.trim())
          .filter(Boolean),
        recipientEmail: recipientEmail || undefined,
      }),
    });
    const json = (await response.json()) as { success: boolean; error?: string };
    if (!json.success) {
      setMessageError(json.error || "Failed to send message");
      return;
    }
    setSubject("");
    setContent("");
    setAttachments("");
    await fetchMessages();
  }, [apiKey, attachments, content, fetchMessages, locusApiKey, messageType, params.id, recipientEmail, subject]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-6 py-10">
      <section className="rounded-lg border p-5">
        <h1 className="text-2xl font-semibold">Order Status</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Track `PENDING`, `PAID`, `EXPIRED`, or `FULFILLED` and inspect payment proof.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="Marketplace API key"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          <input
            value={locusApiKey}
            onChange={(event) => setLocusApiKey(event.target.value)}
            placeholder="Sender Locus API key (for AgentMail relay)"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={fetchOrder}
            disabled={isLoading || !apiKey}
            className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-white dark:text-black"
          >
            {isLoading ? "Loading..." : "Refresh"}
          </button>
          <button
            type="button"
            onClick={fetchMessages}
            disabled={!apiKey}
            className="rounded-md border px-4 py-2 text-sm"
          >
            Load Messages
          </button>
        </div>
      </section>

      {result?.success && result.data && (
        <section className="space-y-3 rounded-lg border p-5 text-sm">
          <p>
            <strong>Order:</strong> {result.data.order.id}
          </p>
          <p>
            <strong>Listing:</strong> {result.data.listing.title}
          </p>
          <p>
            <strong>Status:</strong> {result.data.order.status}
          </p>
          <p>
            <strong>Amount:</strong> {result.data.order.amountUsdc} USDC
          </p>
          <p>
            <strong>Tx Hash:</strong> {result.data.order.paymentTxHash || "N/A"}
          </p>
          <p>
            <strong>Payer Address:</strong> {result.data.order.payerAddress || "N/A"}
          </p>
          <p>
            <strong>Paid At:</strong> {result.data.order.paidAt || "N/A"}
          </p>
        </section>
      )}

      {result && !result.success && (
        <section className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {result.error || "Failed to load order"}
        </section>
      )}

      <section className="space-y-4 rounded-lg border p-5">
        <h2 className="text-lg font-semibold">Materials & Delivery</h2>
        <div className="grid gap-3">
          <select
            value={messageType}
            onChange={(event) => setMessageType(event.target.value as "materials" | "delivery" | "note")}
            className="rounded-md border px-3 py-2 text-sm"
          >
            <option value="materials">materials</option>
            <option value="delivery">delivery</option>
            <option value="note">note</option>
          </select>
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Subject"
            className="rounded-md border px-3 py-2 text-sm"
          />
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Message content"
            className="min-h-28 rounded-md border px-3 py-2 text-sm"
          />
          <textarea
            value={attachments}
            onChange={(event) => setAttachments(event.target.value)}
            placeholder="Attachment URLs (one per line)"
            className="min-h-20 rounded-md border px-3 py-2 text-sm"
          />
          <input
            value={recipientEmail}
            onChange={(event) => setRecipientEmail(event.target.value)}
            placeholder="Recipient email (optional for AgentMail relay)"
            className="rounded-md border px-3 py-2 text-sm"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={sendMessage}
              disabled={!apiKey || !subject || !content}
              className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-white dark:text-black"
            >
              Send message
            </button>
            <button type="button" onClick={fetchMessages} disabled={!apiKey} className="rounded-md border px-4 py-2 text-sm">
              Refresh timeline
            </button>
          </div>
          {messageError && (
            <p className="rounded border border-red-300 bg-red-50 p-2 text-xs text-red-700">{messageError}</p>
          )}
        </div>

        <div className="space-y-3">
          {messages.map((message) => (
            <article key={message.id} className="rounded-md border p-3 text-sm">
              <p>
                <strong>{message.messageType}</strong> · {message.direction}
              </p>
              <p className="mt-1 font-medium">{message.subject}</p>
              <p className="mt-1 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{message.content}</p>
              {message.attachments.length > 0 && (
                <p className="mt-1 text-xs text-zinc-600">Attachments: {message.attachments.join(", ")}</p>
              )}
              <p className="mt-1 text-xs text-zinc-600">
                AgentMail ID: {message.agentMailMessageId || "not relayed"} · {new Date(message.createdAt).toLocaleString()}
              </p>
            </article>
          ))}
          {messages.length === 0 && <p className="text-sm text-zinc-600 dark:text-zinc-300">No messages yet.</p>}
        </div>
      </section>
    </div>
  );
}
