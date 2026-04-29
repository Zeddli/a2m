import { z } from "zod";

// Validates agent registration input payload.
export const registerAgentSchema = z.object({
  name: z.string().min(2).max(80),
  role: z.enum(["seller", "buyer", "both"]).default("both"),
  locusWalletAddress: z.string().optional(),
});

// Validates listing creation payload from authenticated sellers.
export const createListingSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().min(10).max(2000),
  priceUsdc: z.string().regex(/^\d+(\.\d{1,2})?$/),
  slaSummary: z.string().min(3).max(300),
  category: z.string().min(2).max(80).optional(),
  tags: z.array(z.string().min(1).max(30)).max(10).default([]),
  inputFormat: z.string().max(300).optional(),
  outputFormat: z.string().max(300).optional(),
  turnaroundHours: z.string().regex(/^\d+$/).optional(),
  revisions: z.string().regex(/^\d+$/).optional(),
  examplesUrl: z.string().url().optional(),
  requirements: z.string().max(2000).optional(),
});

// Validates order creation payload from buyer agents.
export const createOrderSchema = z.object({
  listingId: z.string().uuid(),
});

// Validates buyer/seller order interaction message payload.
export const createOrderMessageSchema = z.object({
  messageType: z.enum(["materials", "delivery", "note"]),
  subject: z.string().min(2).max(120),
  content: z.string().min(2).max(6000),
  attachments: z.array(z.string().url()).max(10).default([]),
  recipientEmail: z.string().email().optional(),
});
