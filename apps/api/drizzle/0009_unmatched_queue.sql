CREATE TYPE "public"."unmatched_source" AS ENUM('product', 'receipt', 'plate', 'ingredients', 'manual', 'finish_shopping');--> statement-breakpoint
CREATE TABLE "unmatched_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"normalized_name" text NOT NULL,
	"raw_name" text NOT NULL,
	"locale" text NOT NULL,
	"source" "unmatched_source" NOT NULL,
	"batch_id" uuid,
	"shopping_item_id" uuid,
	"dismissed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unmatched_entries_one_target" CHECK (("unmatched_entries"."batch_id" IS NOT NULL) <> ("unmatched_entries"."shopping_item_id" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "unmatched_entries" ADD CONSTRAINT "unmatched_entries_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unmatched_entries" ADD CONSTRAINT "unmatched_entries_shopping_item_id_shopping_items_id_fk" FOREIGN KEY ("shopping_item_id") REFERENCES "public"."shopping_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "unmatched_entries_normalized_name_idx" ON "unmatched_entries" USING btree ("normalized_name");--> statement-breakpoint
CREATE UNIQUE INDEX "unmatched_entries_batch_idx" ON "unmatched_entries" USING btree ("batch_id") WHERE "unmatched_entries"."batch_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "unmatched_entries_shopping_item_idx" ON "unmatched_entries" USING btree ("shopping_item_id") WHERE "unmatched_entries"."shopping_item_id" IS NOT NULL;