CREATE TABLE "known_barcodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid NOT NULL,
	"barcode" text NOT NULL,
	"ingredient_id" uuid,
	"raw_name" text,
	"normalized_name" text,
	"product_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "known_barcodes_match_state" CHECK (("known_barcodes"."ingredient_id" IS NOT NULL AND "known_barcodes"."raw_name" IS NULL) OR ("known_barcodes"."ingredient_id" IS NULL AND "known_barcodes"."raw_name" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "known_barcodes" ADD CONSTRAINT "known_barcodes_family_id_family_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."family"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "known_barcodes" ADD CONSTRAINT "known_barcodes_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "known_barcodes_family_barcode_idx" ON "known_barcodes" USING btree ("family_id","barcode");--> statement-breakpoint
CREATE INDEX "known_barcodes_ingredient_idx" ON "known_barcodes" USING btree ("ingredient_id");--> statement-breakpoint
CREATE INDEX "known_barcodes_normalized_name_idx" ON "known_barcodes" USING btree ("normalized_name");