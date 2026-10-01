CREATE TYPE "public"."shopping_list_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TABLE "shopping_item_source_recipes" (
	"shopping_item_id" uuid NOT NULL,
	"recipe_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shopping_item_source_recipes_shopping_item_id_recipe_id_pk" PRIMARY KEY("shopping_item_id","recipe_id")
);
--> statement-breakpoint
CREATE TABLE "shopping_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"list_id" uuid NOT NULL,
	"ingredient_id" uuid,
	"name" text,
	"normalized_name" text,
	"quantity" numeric(12, 3),
	"unit" "ingredient_unit",
	"checked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shopping_items_matched_or_named" CHECK (("shopping_items"."ingredient_id" IS NOT NULL) <> ("shopping_items"."name" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "shopping_lists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid NOT NULL,
	"status" "shopping_list_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shopping_item_source_recipes" ADD CONSTRAINT "shopping_item_source_recipes_shopping_item_id_shopping_items_id_fk" FOREIGN KEY ("shopping_item_id") REFERENCES "public"."shopping_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_items" ADD CONSTRAINT "shopping_items_list_id_shopping_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."shopping_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_items" ADD CONSTRAINT "shopping_items_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_lists" ADD CONSTRAINT "shopping_lists_family_id_family_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."family"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "shopping_items_list_idx" ON "shopping_items" USING btree ("list_id");--> statement-breakpoint
CREATE UNIQUE INDEX "shopping_lists_active_family_idx" ON "shopping_lists" USING btree ("family_id") WHERE "shopping_lists"."status" = 'active';