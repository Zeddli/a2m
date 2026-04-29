import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// Defines marketplace roles for app-level registration.
export const agentRoleEnum = pgEnum("agent_role", ["seller", "buyer", "both"]);

// Defines order lifecycle transitions driven by checkout and fulfillment.
export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "PAID",
  "EXPIRED",
  "CANCELLED",
  "FULFILLED",
]);

// Defines checkout lifecycle mirrored from Locus session states.
export const checkoutStatusEnum = pgEnum("checkout_status", [
  "PENDING",
  "PAID",
  "EXPIRED",
  "CANCELLED",
]);

// Stores app-level agent identity and API auth material.
export const agents = pgTable(
  "agents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    role: agentRoleEnum("role").notNull().default("both"),
    apiKeyHash: text("api_key_hash").notNull(),
    locusWalletAddress: text("locus_wallet_address"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    nameUniqueIdx: uniqueIndex("agents_name_unique").on(table.name),
    apiKeyHashIdx: uniqueIndex("agents_api_key_hash_unique").on(table.apiKeyHash),
  }),
);

// Stores services listed by seller agents.
export const serviceListings = pgTable(
  "service_listings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sellerAgentId: uuid("seller_agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    priceUsdc: text("price_usdc").notNull(),
    slaSummary: text("sla_summary").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    sellerActiveIdx: index("service_listings_seller_active_idx").on(table.sellerAgentId, table.isActive),
  }),
);

// Stores purchase intent and fulfillment state.
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => serviceListings.id, { onDelete: "restrict" }),
    buyerAgentId: uuid("buyer_agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "restrict" }),
    sellerAgentId: uuid("seller_agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "restrict" }),
    amountUsdc: text("amount_usdc").notNull(),
    status: orderStatusEnum("status").notNull().default("PENDING"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    paymentTxHash: text("payment_tx_hash"),
    payerAddress: text("payer_address"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    orderStatusIdx: index("orders_status_idx").on(table.status),
    buyerIdx: index("orders_buyer_idx").on(table.buyerAgentId),
  }),
);

// Stores checkout session metadata for each order.
export const checkoutSessions = pgTable(
  "checkout_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    sessionId: text("session_id").notNull(),
    checkoutUrl: text("checkout_url"),
    status: checkoutStatusEnum("status").notNull().default("PENDING"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    webhookSecret: text("webhook_secret"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    orderUniqueIdx: uniqueIndex("checkout_sessions_order_unique").on(table.orderId),
    sessionUniqueIdx: uniqueIndex("checkout_sessions_session_unique").on(table.sessionId),
  }),
);

// Stores raw webhook events to provide idempotent handling.
export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    source: text("source").notNull().default("locus"),
    event: text("event").notNull(),
    sessionId: text("session_id"),
    signature: text("signature"),
    payload: jsonb("payload").notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idempotencyIdx: uniqueIndex("webhook_events_source_event_session_unique").on(
      table.source,
      table.event,
      table.sessionId,
    ),
  }),
);
