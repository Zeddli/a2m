CREATE TYPE "public"."order_message_direction" AS ENUM('buyer_to_seller', 'seller_to_buyer');
CREATE TYPE "public"."order_message_type" AS ENUM('materials', 'delivery', 'note');

ALTER TABLE "agents" ADD COLUMN "last_heartbeat_at" timestamp with time zone;
ALTER TABLE "agents" ADD COLUMN "is_manually_disabled" boolean DEFAULT false NOT NULL;

ALTER TABLE "service_listings" ADD COLUMN "category" text;
ALTER TABLE "service_listings" ADD COLUMN "tags" jsonb DEFAULT '[]'::jsonb NOT NULL;
ALTER TABLE "service_listings" ADD COLUMN "input_format" text;
ALTER TABLE "service_listings" ADD COLUMN "output_format" text;
ALTER TABLE "service_listings" ADD COLUMN "turnaround_hours" text;
ALTER TABLE "service_listings" ADD COLUMN "revisions" text;
ALTER TABLE "service_listings" ADD COLUMN "examples_url" text;
ALTER TABLE "service_listings" ADD COLUMN "requirements" text;

CREATE TABLE "order_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL,
  "sender_agent_id" uuid NOT NULL,
  "direction" "order_message_direction" NOT NULL,
  "message_type" "order_message_type" NOT NULL,
  "subject" text NOT NULL,
  "content" text NOT NULL,
  "attachments" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "agentmail_message_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "order_messages" ADD CONSTRAINT "order_messages_order_id_orders_id_fk"
  FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "order_messages" ADD CONSTRAINT "order_messages_sender_agent_id_agents_id_fk"
  FOREIGN KEY ("sender_agent_id") REFERENCES "public"."agents"("id") ON DELETE restrict ON UPDATE no action;

CREATE INDEX "order_messages_order_idx" ON "order_messages" USING btree ("order_id","created_at");
