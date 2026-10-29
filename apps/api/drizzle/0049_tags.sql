-- Tags (ADR 0033, expand step; #708). The new entity types are added by swapping the enum rather
-- than ALTER TYPE ... ADD VALUE: drizzle runs every pending migration in one transaction, and a
-- value added in a transaction cannot be used in it, but a type created in it can.
ALTER TYPE "public"."catalog_entity_type" RENAME TO "catalog_entity_type_old";--> statement-breakpoint
CREATE TYPE "public"."catalog_entity_type" AS ENUM('aisle', 'parent_category', 'leaf_category', 'ingredient', 'cuisine', 'method', 'eating_moment', 'allergen', 'tag_group', 'tag');--> statement-breakpoint
ALTER TABLE "catalog_translations" ALTER COLUMN "entity_type" TYPE "public"."catalog_entity_type" USING "entity_type"::text::"public"."catalog_entity_type";--> statement-breakpoint
ALTER TABLE "family_expiry_overrides" DROP CONSTRAINT "family_expiry_overrides_category";--> statement-breakpoint
ALTER TABLE "family_expiry_overrides" ALTER COLUMN "entity_type" TYPE "public"."catalog_entity_type" USING "entity_type"::text::"public"."catalog_entity_type";--> statement-breakpoint
ALTER TABLE "family_expiry_overrides" ADD CONSTRAINT "family_expiry_overrides_category" CHECK ("family_expiry_overrides"."entity_type" IN ('parent_category', 'leaf_category'));--> statement-breakpoint
DROP TYPE "public"."catalog_entity_type_old";--> statement-breakpoint
CREATE TABLE "recipe_tags" (
	"recipe_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipe_tags_recipe_id_tag_id_pk" PRIMARY KEY("recipe_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tag_groups" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"family_id" uuid,
	"group_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_group_iff_catalog" CHECK (("tags"."family_id" IS NULL) = ("tags"."group_id" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "recipe_tags" ADD CONSTRAINT "recipe_tags_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_tags" ADD CONSTRAINT "recipe_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_family_id_family_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."family"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_group_id_tag_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."tag_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "recipe_tags_tag_idx" ON "recipe_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tag_groups_normalized_name_idx" ON "tag_groups" USING btree ("normalized_name");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_catalog_normalized_name_idx" ON "tags" USING btree ("normalized_name") WHERE "tags"."family_id" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "tags_family_normalized_name_idx" ON "tags" USING btree ("family_id","normalized_name") WHERE "tags"."family_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "tags_group_idx" ON "tags" USING btree ("group_id");--> statement-breakpoint
-- Data: every Cuisine and Method becomes a Catalog Tag with the same id (so the old columns and the
-- new links stay in step until the contract migration), in the Cuisine or Method Tag Group.
-- A Cuisine and a Method were separate lists, so one could share a normalized name (or a name in a
-- locale) with the other; as Tags they would break the unique name indexes. The Cuisine keeps its
-- name and the Method gets " (method)" after it, in its source name and in each colliding translation.
INSERT INTO "tag_groups" ("id", "name", "normalized_name", "position")
VALUES (gen_random_uuid(), 'Cuisine', 'cuisine', 3), (gen_random_uuid(), 'Method', 'method', 4);--> statement-breakpoint
INSERT INTO "catalog_translations" ("id", "entity_type", "entity_id", "locale", "kind", "value", "normalized_value")
SELECT gen_random_uuid(), 'tag_group', g."id", v."locale", 'name', v."value", v."normalized_value"
FROM "tag_groups" g
JOIN (VALUES
  ('cuisine', 'en', 'Cuisine', 'cuisine'), ('cuisine', 'ro', 'Bucătărie', 'bucatarie'), ('cuisine', 'da', 'Køkken', 'koekken'),
  ('method', 'en', 'Method', 'method'), ('method', 'ro', 'Metodă', 'metoda'), ('method', 'da', 'Metode', 'metode')
) AS v("group_name", "locale", "value", "normalized_value") ON v."group_name" = g."normalized_name";--> statement-breakpoint
INSERT INTO "tags" ("id", "name", "normalized_name", "group_id")
SELECT c."id", c."name", c."normalized_name", (SELECT "id" FROM "tag_groups" WHERE "normalized_name" = 'cuisine')
FROM "cuisines" c;--> statement-breakpoint
INSERT INTO "tags" ("id", "name", "normalized_name", "group_id")
SELECT m."id",
  CASE WHEN c."id" IS NULL THEN m."name" ELSE m."name" || ' (method)' END,
  CASE WHEN c."id" IS NULL THEN m."normalized_name" ELSE m."normalized_name" || ' (method)' END,
  (SELECT "id" FROM "tag_groups" WHERE "normalized_name" = 'method')
FROM "methods" m
LEFT JOIN "cuisines" c ON c."normalized_name" = m."normalized_name";--> statement-breakpoint
INSERT INTO "catalog_translations" ("id", "entity_type", "entity_id", "locale", "kind", "value", "normalized_value")
SELECT gen_random_uuid(), 'tag', t."entity_id", t."locale", t."kind",
  CASE WHEN clash."id" IS NULL THEN t."value" ELSE t."value" || ' (method)' END,
  CASE WHEN clash."id" IS NULL THEN t."normalized_value" ELSE t."normalized_value" || ' (method)' END
FROM "catalog_translations" t
LEFT JOIN "catalog_translations" clash ON t."entity_type" = 'method' AND t."kind" = 'name'
  AND clash."entity_type" = 'cuisine' AND clash."kind" = 'name' AND clash."owner_family_id" IS NULL
  AND clash."locale" = t."locale" AND clash."normalized_value" = t."normalized_value"
WHERE t."entity_type" IN ('cuisine', 'method') AND t."owner_family_id" IS NULL;--> statement-breakpoint
INSERT INTO "recipe_tags" ("recipe_id", "tag_id")
SELECT r."id", r."cuisine_id" FROM "recipes" r WHERE r."cuisine_id" IS NOT NULL;--> statement-breakpoint
INSERT INTO "recipe_tags" ("recipe_id", "tag_id")
SELECT r."id", r."method_id" FROM "recipes" r WHERE r."method_id" IS NOT NULL;
