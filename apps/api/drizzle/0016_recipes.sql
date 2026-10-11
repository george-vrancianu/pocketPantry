CREATE TYPE "public"."recipe_difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
ALTER TYPE "public"."catalog_entity_type" ADD VALUE 'cuisine';--> statement-breakpoint
ALTER TYPE "public"."catalog_entity_type" ADD VALUE 'method';--> statement-breakpoint
ALTER TYPE "public"."unmatched_source" ADD VALUE 'recipe';--> statement-breakpoint
CREATE TABLE "cuisines" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "methods" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_hidden_tips" (
	"recipe_id" uuid NOT NULL,
	"tip_id" uuid NOT NULL,
	CONSTRAINT "recipe_hidden_tips_recipe_id_tip_id_pk" PRIMARY KEY("recipe_id","tip_id")
);
--> statement-breakpoint
CREATE TABLE "recipe_ingredient_line_translations" (
	"line_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"note" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipe_ingredient_line_translations_line_id_locale_pk" PRIMARY KEY("line_id","locale")
);
--> statement-breakpoint
CREATE TABLE "recipe_ingredient_lines" (
	"id" uuid PRIMARY KEY NOT NULL,
	"recipe_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"ingredient_id" uuid,
	"raw_name" text,
	"normalized_name" text,
	"quantity" numeric(10, 3),
	"unit" "ingredient_unit",
	"optional" boolean DEFAULT false NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipe_ingredient_lines_quantity_with_unit" CHECK (("recipe_ingredient_lines"."quantity" IS NULL) = ("recipe_ingredient_lines"."unit" IS NULL)),
	CONSTRAINT "recipe_ingredient_lines_quantity_positive" CHECK ("recipe_ingredient_lines"."quantity" IS NULL OR "recipe_ingredient_lines"."quantity" > 0),
	CONSTRAINT "recipe_ingredient_lines_matched_or_named" CHECK (("recipe_ingredient_lines"."ingredient_id" IS NOT NULL) <> ("recipe_ingredient_lines"."raw_name" IS NOT NULL AND "recipe_ingredient_lines"."normalized_name" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "recipe_step_translations" (
	"step_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipe_step_translations_step_id_locale_pk" PRIMARY KEY("step_id","locale")
);
--> statement-breakpoint
CREATE TABLE "recipe_steps" (
	"id" uuid PRIMARY KEY NOT NULL,
	"recipe_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"text" text NOT NULL,
	"timer_seconds" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipe_steps_timer_non_negative" CHECK ("recipe_steps"."timer_seconds" IS NULL OR "recipe_steps"."timer_seconds" >= 0)
);
--> statement-breakpoint
CREATE TABLE "recipe_tip_translations" (
	"tip_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipe_tip_translations_tip_id_locale_pk" PRIMARY KEY("tip_id","locale")
);
--> statement-breakpoint
CREATE TABLE "recipe_tips" (
	"id" uuid PRIMARY KEY NOT NULL,
	"recipe_id" uuid NOT NULL,
	"step_id" uuid,
	"position" integer NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_translations" (
	"recipe_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipe_translations_recipe_id_locale_pk" PRIMARY KEY("recipe_id","locale")
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"parent_id" uuid,
	"family_id" uuid,
	"title" text NOT NULL,
	"servings" integer NOT NULL,
	"prep_minutes" integer,
	"cook_minutes" integer,
	"difficulty" "recipe_difficulty",
	"cuisine_id" uuid,
	"method_id" uuid,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipes_servings_positive" CHECK ("recipes"."servings" > 0),
	CONSTRAINT "recipes_minutes_non_negative" CHECK (("recipes"."prep_minutes" IS NULL OR "recipes"."prep_minutes" >= 0) AND ("recipes"."cook_minutes" IS NULL OR "recipes"."cook_minutes" >= 0))
);
--> statement-breakpoint
ALTER TABLE "unmatched_entries" DROP CONSTRAINT "unmatched_entries_one_target";--> statement-breakpoint
ALTER TABLE "unmatched_entries" ADD COLUMN "ingredient_line_id" uuid;--> statement-breakpoint
ALTER TABLE "recipe_hidden_tips" ADD CONSTRAINT "recipe_hidden_tips_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_hidden_tips" ADD CONSTRAINT "recipe_hidden_tips_tip_id_recipe_tips_id_fk" FOREIGN KEY ("tip_id") REFERENCES "public"."recipe_tips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_ingredient_line_translations" ADD CONSTRAINT "recipe_ingredient_line_translations_line_id_recipe_ingredient_lines_id_fk" FOREIGN KEY ("line_id") REFERENCES "public"."recipe_ingredient_lines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_ingredient_lines" ADD CONSTRAINT "recipe_ingredient_lines_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_ingredient_lines" ADD CONSTRAINT "recipe_ingredient_lines_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_step_translations" ADD CONSTRAINT "recipe_step_translations_step_id_recipe_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."recipe_steps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_steps" ADD CONSTRAINT "recipe_steps_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_tip_translations" ADD CONSTRAINT "recipe_tip_translations_tip_id_recipe_tips_id_fk" FOREIGN KEY ("tip_id") REFERENCES "public"."recipe_tips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_tips" ADD CONSTRAINT "recipe_tips_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_tips" ADD CONSTRAINT "recipe_tips_step_id_recipe_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."recipe_steps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_translations" ADD CONSTRAINT "recipe_translations_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_parent_id_recipes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."recipes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_family_id_family_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."family"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_cuisine_id_cuisines_id_fk" FOREIGN KEY ("cuisine_id") REFERENCES "public"."cuisines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_method_id_methods_id_fk" FOREIGN KEY ("method_id") REFERENCES "public"."methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cuisines_normalized_name_idx" ON "cuisines" USING btree ("normalized_name");--> statement-breakpoint
CREATE UNIQUE INDEX "methods_normalized_name_idx" ON "methods" USING btree ("normalized_name");--> statement-breakpoint
CREATE INDEX "recipe_ingredient_lines_recipe_idx" ON "recipe_ingredient_lines" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "recipe_ingredient_lines_ingredient_idx" ON "recipe_ingredient_lines" USING btree ("ingredient_id");--> statement-breakpoint
CREATE INDEX "recipe_ingredient_lines_name_idx" ON "recipe_ingredient_lines" USING btree ("normalized_name");--> statement-breakpoint
CREATE INDEX "recipe_steps_recipe_idx" ON "recipe_steps" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "recipe_tips_recipe_idx" ON "recipe_tips" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "recipe_tips_step_idx" ON "recipe_tips" USING btree ("step_id");--> statement-breakpoint
CREATE INDEX "recipes_parent_idx" ON "recipes" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "recipes_family_idx" ON "recipes" USING btree ("family_id");--> statement-breakpoint
CREATE INDEX "recipes_cuisine_idx" ON "recipes" USING btree ("cuisine_id");--> statement-breakpoint
CREATE INDEX "recipes_method_idx" ON "recipes" USING btree ("method_id");--> statement-breakpoint
ALTER TABLE "shopping_item_source_recipes" ADD CONSTRAINT "shopping_item_source_recipes_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unmatched_entries" ADD CONSTRAINT "unmatched_entries_ingredient_line_id_recipe_ingredient_lines_id_fk" FOREIGN KEY ("ingredient_line_id") REFERENCES "public"."recipe_ingredient_lines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unmatched_entries_ingredient_line_idx" ON "unmatched_entries" USING btree ("ingredient_line_id") WHERE "unmatched_entries"."ingredient_line_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "unmatched_entries" ADD CONSTRAINT "unmatched_entries_one_target" CHECK (num_nonnulls("unmatched_entries"."batch_id", "unmatched_entries"."shopping_item_id", "unmatched_entries"."ingredient_line_id") = 1);