#!/usr/bin/env node

import { Command } from "commander";
import { listListings, request } from "./api";

const program = new Command();

// Reads the required marketplace base URL env value.
function readBaseUrl(): string {
  return process.env.MARKETPLACE_BASE_URL || "http://localhost:3000";
}

// Reads the required marketplace API key env value.
function readApiKey(): string {
  const apiKey = process.env.MARKETPLACE_API_KEY;
  if (!apiKey) throw new Error("MARKETPLACE_API_KEY is required");
  return apiKey;
}

// Reads optional buyer Locus API key for programmatic payment.
function readLocusApiKey(): string {
  const apiKey = process.env.BUYER_LOCUS_API_KEY;
  if (!apiKey) throw new Error("BUYER_LOCUS_API_KEY is required for payment");
  return apiKey;
}

program.name("agent-client").description("A2A marketplace automation client");

// Lists active services for discovery.
program.command("discover").description("List active listings").action(async () => {
  const data = await listListings(readBaseUrl());
  console.log(JSON.stringify(data, null, 2));
});

// Creates an order for a selected listing.
program
  .command("create-order")
  .requiredOption("--listing-id <id>", "Listing ID")
  .description("Create an order for a listing")
  .action(async (options: { listingId: string }) => {
    const data = await request(
      { baseUrl: readBaseUrl(), apiKey: readApiKey() },
      "/api/orders",
      {
        method: "POST",
        body: JSON.stringify({ listingId: options.listingId }),
      },
    );
    console.log(JSON.stringify(data, null, 2));
  });

// Executes agent-side payment for an existing checkout session.
program
  .command("pay")
  .requiredOption("--session-id <id>", "Checkout session ID")
  .description("Pay a checkout session as a buyer agent")
  .action(async (options: { sessionId: string }) => {
    const data = await request(
      {
        baseUrl: readBaseUrl(),
        apiKey: readApiKey(),
        locusApiKey: readLocusApiKey(),
      },
      `/api/checkout/agent/pay/${options.sessionId}`,
      { method: "POST" },
    );
    console.log(JSON.stringify(data, null, 2));
  });

// Polls order status until a terminal state is reached.
program
  .command("poll-order")
  .requiredOption("--order-id <id>", "Order ID")
  .option("--interval-ms <ms>", "Poll interval milliseconds", "3000")
  .description("Poll order status until it is PAID, EXPIRED, CANCELLED, or FULFILLED")
  .action(async (options: { orderId: string; intervalMs: string }) => {
    const intervalMs = Number(options.intervalMs);
    const terminal = new Set(["PAID", "EXPIRED", "CANCELLED", "FULFILLED"]);

    while (true) {
      const data = await request<{ order: { status: string } }>(
        { baseUrl: readBaseUrl(), apiKey: readApiKey() },
        `/api/orders/${options.orderId}`,
      );

      console.log(JSON.stringify(data, null, 2));
      if (terminal.has(data.order.status)) break;

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  });

program.parseAsync(process.argv).catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
