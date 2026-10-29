import type pg from 'pg';

/**
 * Migration 0051 (ADR 0033, contract step) dropped the Cuisine and Method tables, the Recipe
 * columns and indexes, and the two `catalog_entity_type` values. The migration tests of 0049 and
 * 0051 play a migration on the old shape, so this puts it back inside the transaction the test has
 * open (the test rolls it back). The type is swapped, as the migrations do, because a value added
 * in a transaction cannot be used in it.
 */
export async function restorePre0051Shape(client: pg.Client): Promise<void> {
  const statements = [
    `ALTER TYPE "public"."catalog_entity_type" RENAME TO "catalog_entity_type_old"`,
    `CREATE TYPE "public"."catalog_entity_type" AS ENUM('aisle', 'parent_category', 'leaf_category', 'ingredient', 'cuisine', 'method', 'eating_moment', 'allergen', 'tag_group', 'tag')`,
    `ALTER TABLE "catalog_translations" ALTER COLUMN "entity_type" TYPE "public"."catalog_entity_type" USING "entity_type"::text::"public"."catalog_entity_type"`,
    `ALTER TABLE "family_expiry_overrides" DROP CONSTRAINT "family_expiry_overrides_category"`,
    `ALTER TABLE "family_expiry_overrides" ALTER COLUMN "entity_type" TYPE "public"."catalog_entity_type" USING "entity_type"::text::"public"."catalog_entity_type"`,
    `ALTER TABLE "family_expiry_overrides" ADD CONSTRAINT "family_expiry_overrides_category" CHECK ("family_expiry_overrides"."entity_type" IN ('parent_category', 'leaf_category'))`,
    `DROP TYPE "public"."catalog_entity_type_old"`,
    ...['cuisines', 'methods'].flatMap((table) => [
      `CREATE TABLE "${table}" (
         "id" uuid PRIMARY KEY NOT NULL,
         "name" text NOT NULL,
         "normalized_name" text NOT NULL,
         "created_at" timestamp with time zone DEFAULT now() NOT NULL,
         "updated_at" timestamp with time zone DEFAULT now() NOT NULL
       )`,
      `CREATE UNIQUE INDEX "${table}_normalized_name_idx" ON "${table}" USING btree ("normalized_name")`,
    ]),
    `ALTER TABLE "recipes" ADD COLUMN "cuisine_id" uuid REFERENCES "cuisines"("id")`,
    `ALTER TABLE "recipes" ADD COLUMN "method_id" uuid REFERENCES "methods"("id")`,
    `CREATE INDEX "recipes_cuisine_idx" ON "recipes" USING btree ("cuisine_id")`,
    `CREATE INDEX "recipes_method_idx" ON "recipes" USING btree ("method_id")`,
  ];
  for (const statement of statements) await client.query(statement);
}
