CREATE TYPE "public"."eating_moment_polarity" AS ENUM('good_for', 'avoid');--> statement-breakpoint
CREATE TYPE "public"."pairing_kind" AS ENUM('food', 'drink');--> statement-breakpoint
CREATE TYPE "public"."pairing_principle" AS ENUM('acid_cuts_fat', 'salt_balances_sweet', 'fat_carries_flavour', 'contrast_texture', 'complement_flavour', 'bitter_balances_rich', 'cleanses_palate', 'regional_tradition');--> statement-breakpoint
ALTER TYPE "public"."catalog_entity_type" ADD VALUE 'eating_moment';--> statement-breakpoint
CREATE TABLE "eating_moments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"sort_order" integer NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_eating_moment_translations" (
	"recipe_eating_moment_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipe_eating_moment_translations_recipe_eating_moment_id_locale_pk" PRIMARY KEY("recipe_eating_moment_id","locale")
);
--> statement-breakpoint
CREATE TABLE "recipe_eating_moments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"recipe_id" uuid NOT NULL,
	"eating_moment_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"polarity" "eating_moment_polarity" NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_nutrition_note_translations" (
	"recipe_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"nutrition_note" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipe_nutrition_note_translations_recipe_id_locale_pk" PRIMARY KEY("recipe_id","locale")
);
--> statement-breakpoint
CREATE TABLE "recipe_pairing_translations" (
	"pairing_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"label" text NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipe_pairing_translations_pairing_id_locale_pk" PRIMARY KEY("pairing_id","locale")
);
--> statement-breakpoint
CREATE TABLE "recipe_pairings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"recipe_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"kind" "pairing_kind" NOT NULL,
	"label" text NOT NULL,
	"reason" text NOT NULL,
	"principle" "pairing_principle",
	"linked_ingredient_id" uuid,
	"linked_recipe_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipe_pairings_one_link" CHECK (num_nonnulls("recipe_pairings"."linked_ingredient_id", "recipe_pairings"."linked_recipe_id") <= 1)
);
--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "nutrition_note" text;--> statement-breakpoint
ALTER TABLE "recipe_eating_moment_translations" ADD CONSTRAINT "recipe_eating_moment_translations_recipe_eating_moment_id_recipe_eating_moments_id_fk" FOREIGN KEY ("recipe_eating_moment_id") REFERENCES "public"."recipe_eating_moments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_eating_moments" ADD CONSTRAINT "recipe_eating_moments_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_eating_moments" ADD CONSTRAINT "recipe_eating_moments_eating_moment_id_eating_moments_id_fk" FOREIGN KEY ("eating_moment_id") REFERENCES "public"."eating_moments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_nutrition_note_translations" ADD CONSTRAINT "recipe_nutrition_note_translations_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_pairing_translations" ADD CONSTRAINT "recipe_pairing_translations_pairing_id_recipe_pairings_id_fk" FOREIGN KEY ("pairing_id") REFERENCES "public"."recipe_pairings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_pairings" ADD CONSTRAINT "recipe_pairings_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_pairings" ADD CONSTRAINT "recipe_pairings_linked_ingredient_id_ingredients_id_fk" FOREIGN KEY ("linked_ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_pairings" ADD CONSTRAINT "recipe_pairings_linked_recipe_id_recipes_id_fk" FOREIGN KEY ("linked_recipe_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "eating_moments_normalized_name_idx" ON "eating_moments" USING btree ("normalized_name");--> statement-breakpoint
CREATE UNIQUE INDEX "recipe_eating_moments_recipe_moment_idx" ON "recipe_eating_moments" USING btree ("recipe_id","eating_moment_id");--> statement-breakpoint
CREATE INDEX "recipe_eating_moments_moment_idx" ON "recipe_eating_moments" USING btree ("eating_moment_id");--> statement-breakpoint
CREATE INDEX "recipe_pairings_recipe_idx" ON "recipe_pairings" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "recipe_pairings_linked_recipe_idx" ON "recipe_pairings" USING btree ("linked_recipe_id");--> statement-breakpoint
CREATE INDEX "recipe_pairings_linked_ingredient_idx" ON "recipe_pairings" USING btree ("linked_ingredient_id");