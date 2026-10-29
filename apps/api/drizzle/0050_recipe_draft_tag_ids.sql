-- ADR 0033, expand step: a stored Recipe Draft keeps its Tags in `tagIds`. The Cuisine and Method of
-- a draft become that list (each is a Catalog Tag with the same id, made by 0049); ids whose Tag is
-- gone are dropped. The old `cuisineId` and `methodId` keys stay in place until the contract ticket.
UPDATE "recipe_drafts"
SET "content" = "content" || jsonb_build_object(
  'tagIds',
  COALESCE(
    (
      SELECT jsonb_agg(v.id ORDER BY v.ord)
      FROM (VALUES (1, "content"->>'cuisineId'), (2, "content"->>'methodId')) AS v(ord, id)
      WHERE v.id IN (SELECT t.id::text FROM "tags" t)
    ),
    '[]'::jsonb
  )
)
WHERE NOT ("content" ? 'tagIds');
