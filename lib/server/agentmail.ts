import { z } from "zod";

const agentMailSendSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(2).max(120),
  body: z.string().min(2).max(6000),
});

interface AgentMailSendResult {
  messageId: string | null;
  raw: unknown;
}

// Sends an AgentMail message through the Locus x402 bridge.
export async function sendAgentMail(
  locusApiKey: string,
  input: z.input<typeof agentMailSendSchema>,
): Promise<AgentMailSendResult> {
  const payload = agentMailSendSchema.parse(input);
  const apiBase = process.env.LOCUS_API_BASE_URL || "https://beta-api.paywithlocus.com/api";

  const response = await fetch(`${apiBase}/x402/agentmail-send-message`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${locusApiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseBody = await response.text();
  if (!response.ok) {
    throw new Error(`AgentMail send failed: ${response.status} ${responseBody}`);
  }

  const json = JSON.parse(responseBody) as {
    data?: { messageId?: string; id?: string };
  };

  return {
    messageId: json.data?.messageId || json.data?.id || null,
    raw: json,
  };
}
