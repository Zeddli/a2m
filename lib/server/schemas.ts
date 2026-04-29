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
});

// Validates order creation payload from buyer agents.
export const createOrderSchema = z.object({
  listingId: z.string().uuid(),
});
