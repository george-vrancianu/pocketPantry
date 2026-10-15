ALTER TYPE "public"."catalog_entity_type" ADD VALUE 'allergen';--> statement-breakpoint
CREATE TABLE "allergens" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "family_allergies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid NOT NULL,
	"allergen_id" uuid NOT NULL,
	"label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingredient_allergens" (
	"ingredient_id" uuid NOT NULL,
	"allergen_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ingredient_allergens_ingredient_id_allergen_id_pk" PRIMARY KEY("ingredient_id","allergen_id")
);
--> statement-breakpoint
CREATE TABLE "member_allergies" (
	"user_id" text NOT NULL,
	"allergen_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "member_allergies_user_id_allergen_id_pk" PRIMARY KEY("user_id","allergen_id")
);
--> statement-breakpoint
ALTER TABLE "ingredients" ADD COLUMN "allergens_checked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "family_allergies" ADD CONSTRAINT "family_allergies_family_id_family_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."family"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_allergies" ADD CONSTRAINT "family_allergies_allergen_id_allergens_id_fk" FOREIGN KEY ("allergen_id") REFERENCES "public"."allergens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredient_allergens" ADD CONSTRAINT "ingredient_allergens_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredient_allergens" ADD CONSTRAINT "ingredient_allergens_allergen_id_allergens_id_fk" FOREIGN KEY ("allergen_id") REFERENCES "public"."allergens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_allergies" ADD CONSTRAINT "member_allergies_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_allergies" ADD CONSTRAINT "member_allergies_allergen_id_allergens_id_fk" FOREIGN KEY ("allergen_id") REFERENCES "public"."allergens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "allergens_normalized_name_idx" ON "allergens" USING btree ("normalized_name");--> statement-breakpoint
CREATE UNIQUE INDEX "family_allergies_unique_idx" ON "family_allergies" USING btree ("family_id","allergen_id",coalesce("label", ''));--> statement-breakpoint
CREATE INDEX "family_allergies_allergen_idx" ON "family_allergies" USING btree ("allergen_id");--> statement-breakpoint
CREATE INDEX "ingredient_allergens_allergen_idx" ON "ingredient_allergens" USING btree ("allergen_id");--> statement-breakpoint
CREATE INDEX "member_allergies_allergen_idx" ON "member_allergies" USING btree ("allergen_id");