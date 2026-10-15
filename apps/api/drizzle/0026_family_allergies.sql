CREATE TABLE "family_allergies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid NOT NULL,
	"allergen_id" uuid NOT NULL,
	"label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "family_allergies" ADD CONSTRAINT "family_allergies_family_id_family_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."family"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_allergies" ADD CONSTRAINT "family_allergies_allergen_id_allergens_id_fk" FOREIGN KEY ("allergen_id") REFERENCES "public"."allergens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "family_allergies_unique_idx" ON "family_allergies" USING btree ("family_id","allergen_id",coalesce("label", ''));--> statement-breakpoint
CREATE INDEX "family_allergies_allergen_idx" ON "family_allergies" USING btree ("allergen_id");