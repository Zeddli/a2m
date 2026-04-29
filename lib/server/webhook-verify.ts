import crypto from "node:crypto";

// Computes the canonical webhook signature value for a payload.
export function computeWebhookSignature(payload: string, secret: string): string {
  const digest = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `sha256=${digest}`;
}

// Verifies a Locus-style webhook signature in constant time.
export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expected = computeWebhookSignature(payload, secret);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
