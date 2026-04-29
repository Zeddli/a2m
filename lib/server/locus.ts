import { z } from "zod";

const createSessionSchema = z.object({
  amount: z.string(),
  description: z.string(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  webhookUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.string()).default({}),
});

const paymentResultSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      sessionId: z.string().optional(),
      txHash: z.string().optional(),
      status: z.string().optional(),
    })
    .optional(),
});

export interface LocusSessionResult {
  sessionId: string;
  checkoutUrl: string | null;
  expiresAt: string | null;
  webhookSecret: string | null;
  status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED";
}

// Creates a checkout session using the configured Locus API endpoint.
export async function createLocusSession(input: z.input<typeof createSessionSchema>): Promise<LocusSessionResult> {
  const payload = createSessionSchema.parse(input);
  const apiKey = process.env.LOCUS_API_KEY;
  const apiBase = process.env.LOCUS_API_BASE_URL || "https://beta-api.paywithlocus.com/api";

  if (!apiKey) throw new Error("LOCUS_API_KEY is required");

  const isLocalUrl = (url: string | undefined) =>
    !url || url.includes("localhost") || url.includes("127.0.0.1");

  // Avoid sending localhost callbacks to Locus in local development.
  const cleanPayload = {
    amount: payload.amount,
    description: payload.description,
    ...(payload.successUrl ? { successUrl: payload.successUrl } : {}),
    ...(payload.cancelUrl ? { cancelUrl: payload.cancelUrl } : {}),
    ...(payload.webhookUrl && !isLocalUrl(payload.webhookUrl) ? { webhookUrl: payload.webhookUrl } : {}),
    ...(payload.metadata ? { metadata: payload.metadata } : {}),
  };

  const attemptRequest = async (requestBody: Record<string, unknown>) =>
    fetch(`${apiBase}/checkout/sessions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

  let response = await attemptRequest(cleanPayload);
  let responseText = await response.text();

  // Fallback for APIs that expect snake_case keys.
  if (!response.ok && response.status >= 500) {
    const snakeCasePayload: Record<string, unknown> = {
      amount: cleanPayload.amount,
      description: cleanPayload.description,
      ...(cleanPayload.successUrl ? { success_url: cleanPayload.successUrl } : {}),
      ...(cleanPayload.cancelUrl ? { cancel_url: cleanPayload.cancelUrl } : {}),
      ...(cleanPayload.webhookUrl ? { webhook_url: cleanPayload.webhookUrl } : {}),
      ...(cleanPayload.metadata ? { metadata: cleanPayload.metadata } : {}),
    };

    response = await attemptRequest(snakeCasePayload);
    responseText = await response.text();
  }

  if (!response.ok) {
    const hints: string[] = [];
    hints.push(`status=${response.status}`);
    if (isLocalUrl(payload.webhookUrl)) hints.push("webhookUrl_localhost_not_sent");
    if (!payload.successUrl || !payload.cancelUrl) hints.push("missing_success_or_cancel_url");
    hints.push("check_locus_api_base_and_key_environment_match");
    throw new Error(
      `Failed to create Locus session: ${response.status} ${responseText} [${hints.join(", ")}]`,
    );
  }

  const json = JSON.parse(responseText) as {
    data?: {
      id?: string;
      sessionId?: string;
      checkoutUrl?: string;
      checkout_url?: string;
      expiresAt?: string;
      expires_at?: string;
      status?: string;
      webhookSecret?: string;
      webhook_secret?: string;
    };
  };

  const id = json.data?.id || json.data?.sessionId;
  if (!id) throw new Error("Locus response missing session ID");

  const normalizedStatus = (json.data?.status || "PENDING").toUpperCase();
  const validStatuses = new Set(["PENDING", "PAID", "EXPIRED", "CANCELLED"]);

  return {
    sessionId: id,
    checkoutUrl: json.data?.checkoutUrl || json.data?.checkout_url || null,
    expiresAt: json.data?.expiresAt || json.data?.expires_at || null,
    webhookSecret: json.data?.webhookSecret || json.data?.webhook_secret || null,
    status: validStatuses.has(normalizedStatus) ? (normalizedStatus as LocusSessionResult["status"]) : "PENDING",
  };
}

// Pays a checkout session programmatically for agent-only flow.
export async function payLocusSession(sessionId: string, apiKey: string): Promise<{ txHash?: string; status?: string }> {
  const apiBase = process.env.LOCUS_API_BASE_URL || "https://beta-api.paywithlocus.com/api";

  const response = await fetch(`${apiBase}/checkout/agent/pay/${sessionId}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to pay Locus session: ${response.status} ${body}`);
  }

  const json = paymentResultSchema.parse(await response.json());
  return {
    txHash: json.data?.txHash,
    status: json.data?.status,
  };
}
