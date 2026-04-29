import { z } from "zod";

const createSessionSchema = z.object({
  amount: z.string(),
  description: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  webhookUrl: z.string().url(),
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

  const response = await fetch(`${apiBase}/checkout/sessions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to create Locus session: ${response.status} ${body}`);
  }

  const json = (await response.json()) as {
    data?: {
      id?: string;
      checkoutUrl?: string;
      expiresAt?: string;
      status?: string;
      webhookSecret?: string;
    };
  };

  const id = json.data?.id;
  if (!id) throw new Error("Locus response missing session ID");

  const normalizedStatus = (json.data?.status || "PENDING").toUpperCase();
  const validStatuses = new Set(["PENDING", "PAID", "EXPIRED", "CANCELLED"]);

  return {
    sessionId: id,
    checkoutUrl: json.data?.checkoutUrl || null,
    expiresAt: json.data?.expiresAt || null,
    webhookSecret: json.data?.webhookSecret || null,
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
