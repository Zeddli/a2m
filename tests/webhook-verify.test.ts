import { describe, expect, it } from "vitest";
import { computeWebhookSignature, verifyWebhookSignature } from "../lib/server/webhook-verify";

// Verifies signature generation and validation behavior.
describe("webhook signature verification", () => {
  // Confirms valid payload/secret combinations pass verification.
  it("accepts valid signatures", () => {
    const payload = JSON.stringify({ event: "checkout.session.paid" });
    const secret = "whsec_example";
    const signature = computeWebhookSignature(payload, secret);

    expect(verifyWebhookSignature(payload, signature, secret)).toBe(true);
  });

  // Confirms modified payloads are rejected even with original signature.
  it("rejects invalid signatures", () => {
    const payload = JSON.stringify({ event: "checkout.session.paid" });
    const tamperedPayload = JSON.stringify({ event: "checkout.session.expired" });
    const secret = "whsec_example";
    const signature = computeWebhookSignature(payload, secret);

    expect(verifyWebhookSignature(tamperedPayload, signature, secret)).toBe(false);
  });
});
