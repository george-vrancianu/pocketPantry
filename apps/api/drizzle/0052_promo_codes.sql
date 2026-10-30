ALTER TYPE "public"."credit_entry_kind" ADD VALUE 'promo_code';--> statement-breakpoint
CREATE TABLE "promo_code" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"credits" integer NOT NULL,
	"note" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"redeemed_at" timestamp with time zone,
	"redeemed_by" text,
	"redeemed_by_name" text,
	"redeemed_by_email" text,
	"redeemed_family_id" uuid,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "promo_code_code_unique" UNIQUE("code"),
	CONSTRAINT "promo_code_credits_range" CHECK ("promo_code"."credits" between 0 and 10000),
	CONSTRAINT "promo_code_redeemed_xor_revoked" CHECK ("promo_code"."redeemed_at" is null or "promo_code"."revoked_at" is null)
);
--> statement-breakpoint
ALTER TABLE "credit_entry" DROP CONSTRAINT "credit_entry_amount_not_zero";--> statement-breakpoint
ALTER TABLE "credit_entry" ADD COLUMN "promo_code_id" uuid;--> statement-breakpoint
ALTER TABLE "promo_code" ADD CONSTRAINT "promo_code_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_code" ADD CONSTRAINT "promo_code_redeemed_by_user_id_fk" FOREIGN KEY ("redeemed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "promo_code_created_at_idx" ON "promo_code" USING btree ("created_at","id");--> statement-breakpoint
ALTER TABLE "credit_entry" ADD CONSTRAINT "credit_entry_promo_code_id_promo_code_id_fk" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_code"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_entry" ADD CONSTRAINT "credit_entry_amount_not_zero" CHECK ("credit_entry"."amount" <> 0 or "credit_entry"."kind"::text = 'promo_code');