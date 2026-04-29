CREATE TYPE "public"."agent_role" AS ENUM('seller', 'buyer', 'both');--> statement-breakpoint
CREATE TYPE "public"."checkout_status" AS ENUM('PENDING', 'PAID', 'EXPIRED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('PENDING', 'PAID', 'EXPIRED', 'CANCELLED', 'FULFILLED');--> statement-breakpoint
CREATE TABLE "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"role" "agent_role" DEFAULT 'both' NOT NULL,
	"api_key_hash" text NOT NULL,
	"locus_wallet_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkout_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"session_id" text NOT NULL,
	"checkout_url" text,
	"status" "checkout_status" DEFAULT 'PENDING' NOT NULL,
	"expires_at" timestamp with time zone,
	"webhook_secret" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"buyer_agent_id" uuid NOT NULL,
	"seller_agent_id" uuid NOT NULL,
	"amount_usdc" text NOT NULL,
	"status" "order_status" DEFAULT 'PENDING' NOT NULL,
	"paid_at" timestamp with time zone,
	"payment_tx_hash" text,
	"payer_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_agent_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price_usdc" text NOT NULL,
	"sla_summary" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text DEFAULT 'locus' NOT NULL,
	"event" text NOT NULL,
	"session_id" text,
	"signature" text,
	"payload" jsonb NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_listing_id_service_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."service_listings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_agent_id_agents_id_fk" FOREIGN KEY ("buyer_agent_id") REFERENCES "public"."agents"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_seller_agent_id_agents_id_fk" FOREIGN KEY ("seller_agent_id") REFERENCES "public"."agents"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_listings" ADD CONSTRAINT "service_listings_seller_agent_id_agents_id_fk" FOREIGN KEY ("seller_agent_id") REFERENCES "public"."agents"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "agents_name_unique" ON "agents" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "agents_api_key_hash_unique" ON "agents" USING btree ("api_key_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "checkout_sessions_order_unique" ON "checkout_sessions" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "checkout_sessions_session_unique" ON "checkout_sessions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_buyer_idx" ON "orders" USING btree ("buyer_agent_id");--> statement-breakpoint
CREATE INDEX "service_listings_seller_active_idx" ON "service_listings" USING btree ("seller_agent_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_events_source_event_session_unique" ON "webhook_events" USING btree ("source","event","session_id");