-- Tags (ADR 0033, contract step; #715). Cuisines and Methods became Catalog Tags in 0049 and every
-- Recipe and Recipe Draft was moved to Tags, so the old lists go: Recipe columns, indexes, tables,
-- their translations, the leftover Recipe Draft keys and the two enum values.
UPDATE "recipe_drafts"
SET "content" = "content" - 'cuisineId' - 'methodId'
WHERE "content" ? 'cuisineId' OR "content" ? 'methodId';--> statement-breakpoint
DELETE FROM "catalog_translations" WHERE "entity_type" IN ('cuisine', 'method');--> statement-breakpoint
DROP INDEX "recipes_cuisine_idx";--> statement-breakpoint
DROP INDEX "recipes_method_idx";--> statement-breakpoint
ALTER TABLE "recipes" DROP COLUMN "cuisine_id";--> statement-breakpoint
ALTER TABLE "recipes" DROP COLUMN "method_id";--> statement-breakpoint
DROP TABLE "cuisines" CASCADE;--> statement-breakpoint
DROP TABLE "methods" CASCADE;--> statement-breakpoint
-- The enum values are removed by swapping the type (as 0049 added values): drizzle runs every
-- pending migration in one transaction, and a swap works inside it.
ALTER TYPE "public"."catalog_entity_type" RENAME TO "catalog_entity_type_old";--> statement-breakpoint
CREATE TYPE "public"."catalog_entity_type" AS ENUM('aisle', 'parent_category', 'leaf_category', 'ingredient', 'eating_moment', 'allergen', 'tag_group', 'tag');--> statement-breakpoint
ALTER TABLE "catalog_translations" ALTER COLUMN "entity_type" TYPE "public"."catalog_entity_type" USING "entity_type"::text::"public"."catalog_entity_type";--> statement-breakpoint
ALTER TABLE "family_expiry_overrides" DROP CONSTRAINT "family_expiry_overrides_category";--> statement-breakpoint
ALTER TABLE "family_expiry_overrides" ALTER COLUMN "entity_type" TYPE "public"."catalog_entity_type" USING "entity_type"::text::"public"."catalog_entity_type";--> statement-breakpoint
ALTER TABLE "family_expiry_overrides" ADD CONSTRAINT "family_expiry_overrides_category" CHECK ("family_expiry_overrides"."entity_type" IN ('parent_category', 'leaf_category'));--> statement-breakpoint
DROP TYPE "public"."catalog_entity_type_old";
