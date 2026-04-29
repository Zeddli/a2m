ALTER TABLE "agents" ADD COLUMN "owner_user_id" text;

CREATE INDEX "agents_owner_user_id_idx" ON "agents" USING btree ("owner_user_id");

