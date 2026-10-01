CREATE TYPE "public"."catalog_entity_type" AS ENUM('aisle', 'parent_category', 'leaf_category', 'ingredient');--> statement-breakpoint
CREATE TYPE "public"."ingredient_unit" AS ENUM('g', 'kg', 'ml', 'l', 'pcs');--> statement-breakpoint
CREATE TYPE "public"."storage_location" AS ENUM('fridge', 'freezer', 'cupboard', 'spices');--> statement-breakpoint
CREATE TYPE "public"."translation_kind" AS ENUM('name', 'synonym');--> statement-breakpoint
CREATE TABLE "aisles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalog_translations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"entity_type" "catalog_entity_type" NOT NULL,
	"entity_id" uuid NOT NULL,
	"locale" text NOT NULL,
	"kind" "translation_kind" NOT NULL,
	"value" text NOT NULL,
	"normalized_value" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leaf_categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"parent_id" uuid NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"default_expiry_days" integer,
	"default_location" "storage_location",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parent_categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"aisle_id" uuid NOT NULL,
	"default_expiry_days" integer,
	"default_location" "storage_location",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- The #1 placeholder catalog tables were never populated; clear them so the new NOT NULL column applies.
DELETE FROM "ingredients";--> statement-breakpoint
ALTER TABLE "ingredients" DROP CONSTRAINT "ingredients_category_id_ingredient_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "ingredient_categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "ingredient_categories" CASCADE;--> statement-breakpoint
DROP INDEX "ingredients_category_idx";--> statement-breakpoint
ALTER TABLE "ingredients" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ingredients" ALTER COLUMN "default_unit" SET DATA TYPE "public"."ingredient_unit" USING "default_unit"::"public"."ingredient_unit";--> statement-breakpoint
ALTER TABLE "ingredients" ADD COLUMN "leaf_category_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "leaf_categories" ADD CONSTRAINT "leaf_categories_parent_id_parent_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parent_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_categories" ADD CONSTRAINT "parent_categories_aisle_id_aisles_id_fk" FOREIGN KEY ("aisle_id") REFERENCES "public"."aisles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "aisles_normalized_name_idx" ON "aisles" USING btree ("normalized_name");--> statement-breakpoint
CREATE UNIQUE INDEX "aisles_sort_order_idx" ON "aisles" USING btree ("sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "catalog_translations_display_entity_idx" ON "catalog_translations" USING btree ("entity_type","entity_id","locale") WHERE "catalog_translations"."kind" = 'name';--> statement-breakpoint
CREATE UNIQUE INDEX "catalog_translations_display_value_idx" ON "catalog_translations" USING btree ("entity_type","locale","normalized_value") WHERE "catalog_translations"."kind" = 'name';--> statement-breakpoint
CREATE UNIQUE INDEX "catalog_translations_synonym_idx" ON "catalog_translations" USING btree ("entity_type","entity_id","locale","normalized_value") WHERE "catalog_translations"."kind" = 'synonym';--> statement-breakpoint
CREATE INDEX "catalog_translations_lookup_idx" ON "catalog_translations" USING btree ("normalized_value");--> statement-breakpoint
CREATE UNIQUE INDEX "leaf_categories_normalized_name_idx" ON "leaf_categories" USING btree ("normalized_name");--> statement-breakpoint
CREATE INDEX "leaf_categories_parent_idx" ON "leaf_categories" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "parent_categories_normalized_name_idx" ON "parent_categories" USING btree ("normalized_name");--> statement-breakpoint
CREATE INDEX "parent_categories_aisle_idx" ON "parent_categories" USING btree ("aisle_id");--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_leaf_category_id_leaf_categories_id_fk" FOREIGN KEY ("leaf_category_id") REFERENCES "public"."leaf_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ingredients_leaf_category_idx" ON "ingredients" USING btree ("leaf_category_id");--> statement-breakpoint
ALTER TABLE "ingredients" DROP COLUMN "category_id";