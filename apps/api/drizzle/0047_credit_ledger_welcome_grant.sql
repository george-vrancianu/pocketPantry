CREATE TYPE "public"."credit_entry_kind" AS ENUM('welcome_grant', 'grant', 'spend', 'transfer_in', 'transfer_out');--> statement-breakpoint
CREATE TABLE "credit_entry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid NOT NULL,
	"member_id" text,
	"kind" "credit_entry_kind" NOT NULL,
	"read_kind" text,
	"reason" text,
	"amount" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credit_entry_amount_not_zero" CHECK ("credit_entry"."amount" <> 0)
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "welcome_grant_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "credit_entry" ADD CONSTRAINT "credit_entry_family_id_family_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."family"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_entry" ADD CONSTRAINT "credit_entry_member_id_user_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credit_entry_family_id_idx" ON "credit_entry" USING btree ("family_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "credit_entry_welcome_grant_idx" ON "credit_entry" USING btree ("family_id") WHERE "credit_entry"."kind" = 'welcome_grant';--> statement-breakpoint
-- Rollout (ADR 0032): every existing Family gets one Welcome Grant of 100, attributed to its Owner, and every
-- existing Member is marked as having received theirs. Safe to repeat: a Family is given one Welcome Grant at most
-- (the unique index), and a Member already marked keeps their first date.
INSERT INTO "credit_entry" ("family_id", "member_id", "kind", "reason", "amount")
SELECT "family_id", "id", 'welcome_grant', 'Welcome Grant', 100
FROM "user"
WHERE "family_role" = 'owner'
ON CONFLICT DO NOTHING;--> statement-breakpoint
UPDATE "user" SET "welcome_grant_at" = now() WHERE "welcome_grant_at" IS NULL;
