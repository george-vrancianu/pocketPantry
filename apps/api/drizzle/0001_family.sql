CREATE TYPE "public"."family_role" AS ENUM('owner', 'member');--> statement-breakpoint
CREATE TABLE "family" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invite_code" text NOT NULL,
	"invite_code_expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "family_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "family_id" uuid;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "family_role" "family_role" DEFAULT 'member' NOT NULL;--> statement-breakpoint
-- Backfill: every existing Member becomes the Owner of their own Household of One.
UPDATE "user" SET "family_id" = gen_random_uuid(), "family_role" = 'owner';--> statement-breakpoint
INSERT INTO "family" ("id", "invite_code", "invite_code_expires_at")
SELECT "family_id", translate(upper(substr(md5(random()::text || "id"), 1, 8)), '01', 'GH'), now() + interval '7 days'
FROM "user";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "family_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_family_id_family_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."family"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_family_id_idx" ON "user" USING btree ("family_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_family_owner_idx" ON "user" USING btree ("family_id") WHERE "user"."family_role" = 'owner';