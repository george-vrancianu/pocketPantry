CREATE TYPE "public"."amount_scale" AS ENUM('low', 'medium', 'large');--> statement-breakpoint
ALTER TABLE "ingredients" ADD COLUMN "amount_scale" "amount_scale";--> statement-breakpoint
-- Backfill from the Parent Category (keyed by its stable seed id, see
-- src/catalog/amount-scale.ts for the same mapping). Parents not listed here,
-- including the top-level "other" Parent, get medium.
UPDATE "ingredients" SET "amount_scale" = COALESCE(m.scale, 'medium'::"amount_scale")
FROM "leaf_categories" l
LEFT JOIN (VALUES
  ('eab183b2-4e52-5029-834a-8644e0c41287'::uuid, 'low'::"amount_scale"),
  ('ae3e9ca9-66ec-5851-866c-d02db67ff80d'::uuid, 'medium'::"amount_scale"),
  ('8ca62a61-594a-573a-adae-7ee9bfe348ac'::uuid, 'medium'::"amount_scale"),
  ('3b584f98-e39f-507e-81f7-e917a01d701b'::uuid, 'medium'::"amount_scale"),
  ('961e58d1-6d05-5805-a896-6db3732692b1'::uuid, 'medium'::"amount_scale"),
  ('f1fae3e7-c7ac-5f12-a576-9b3b1cdc5677'::uuid, 'medium'::"amount_scale"),
  ('747eece6-bb96-58c2-bdca-c11c70e39f6c'::uuid, 'medium'::"amount_scale"),
  ('771fa28f-c0cb-5ab6-9dd5-302e3798fbc0'::uuid, 'large'::"amount_scale"),
  ('e061e927-656c-5c23-a38d-1c59c1126679'::uuid, 'large'::"amount_scale")
) AS m(parent_id, scale) ON m.parent_id = l.parent_id
WHERE l.id = "ingredients"."leaf_category_id";
