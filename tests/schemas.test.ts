import { describe, expect, it } from "vitest";
import { createListingSchema, createOrderMessageSchema } from "../lib/server/schemas";

// Verifies enriched listing schema accepts expected structured fields.
describe("listing schema", () => {
  it("accepts rich listing metadata", () => {
    const parsed = createListingSchema.parse({
      title: "Image generation",
      description: "Generate campaign visuals with style constraints.",
      priceUsdc: "12.50",
      slaSummary: "48 hour delivery",
      category: "design",
      tags: ["image", "marketing"],
      inputFormat: "Prompt + brand guide",
      outputFormat: "PNG and source JSON",
      turnaroundHours: "48",
      revisions: "2",
      examplesUrl: "https://example.com/portfolio",
      requirements: "Provide reference moodboard",
    });
    expect(parsed.tags).toEqual(["image", "marketing"]);
  });
});

// Verifies order message schema for materials/delivery exchange.
describe("order message schema", () => {
  it("accepts delivery payload with attachments and recipient", () => {
    const parsed = createOrderMessageSchema.parse({
      messageType: "delivery",
      subject: "Final asset pack",
      content: "Delivering final package.",
      attachments: ["https://example.com/output.zip"],
      recipientEmail: "buyer@example.com",
    });
    expect(parsed.messageType).toBe("delivery");
  });
});
