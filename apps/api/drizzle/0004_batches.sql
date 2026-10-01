CREATE TABLE "batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid NOT NULL,
	"ingredient_id" uuid,
	"leaf_category_id" uuid NOT NULL,
	"unmatched" boolean DEFAULT false NOT NULL,
	"raw_name" text,
	"quantity" numeric(10, 3),
	"unit" "ingredient_unit",
	"location" "storage_location" NOT NULL,
	"expiry_date" date,
	"product_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "batches_unit_with_quantity" CHECK ("batches"."quantity" IS NULL OR "batches"."unit" IS NOT NULL),
	CONSTRAINT "batches_quantity_positive" CHECK ("batches"."quantity" IS NULL OR "batches"."quantity" > 0),
	CONSTRAINT "batches_match_state" CHECK (("batches"."unmatched" AND "batches"."ingredient_id" IS NULL AND "batches"."raw_name" IS NOT NULL) OR (NOT "batches"."unmatched" AND "batches"."ingredient_id" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "leaf_categories" ADD COLUMN "is_other" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_family_id_family_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."family"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_leaf_category_id_leaf_categories_id_fk" FOREIGN KEY ("leaf_category_id") REFERENCES "public"."leaf_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "batches_family_idx" ON "batches" USING btree ("family_id");--> statement-breakpoint
UPDATE "leaf_categories" SET "is_other" = true
FROM "parent_categories"
WHERE "leaf_categories"."parent_id" = "parent_categories"."id"
  AND ("leaf_categories"."normalized_name" = 'other'
    AND "parent_categories"."normalized_name" = 'other'
    OR "leaf_categories"."name" = 'Other ' || lower("parent_categories"."name"));--> statement-breakpoint
CREATE UNIQUE INDEX "leaf_categories_one_other_per_parent_idx" ON "leaf_categories" USING btree ("parent_id") WHERE "leaf_categories"."is_other";