-- Meal Plans use Family Recipes only (#572, ADR 0029). For each Family, every Catalog Recipe
-- one of its Meal Plan slots uses is copied into the Family and the slots are repointed.
--
-- This mirrors RecipeCopyService.copy (Add to Family) in SQL:
--  * one live copy per Family and source: an existing live copy (copied_from_id, not archived)
--    is reused, as the partial unique index recipes_family_copied_from_live_idx demands;
--  * the copy takes the text in ONE Catalog Language, falling back to the source text where
--    a translation is missing; there is no adding Member here, so the language is the Family
--    owner's Catalog Language, else the owner's UI language, else 'en' (the owner is the
--    earliest-created Member with family_role 'owner', or failing that the earliest Member);
--  * copied: title, servings, prep/cook minutes, difficulty, cuisine, method, ingredient lines
--    (note translated), steps (text translated, timers), the Recipe's own Tips (text
--    translated, Step Tips re-pointed at the copied Steps), hidden Tips, the Nutrition Note
--    (translated), Pairings (label/reason translated; an Ingredient link kept, a Recipe link
--    kept only when it points at a live Catalog Recipe) and Eating Moment uses (archived
--    Eating Moments dropped, reason translated); positions are renumbered from 0;
--  * a copied Variant keeps parent_id = its Catalog Base; copied_from_id = the source;
--  * not copied: source_link and source_language (Family Recipes from Link only).
-- Archived Catalog sources are copied too (the slot already uses them).
-- Idempotent: once repointed, no slot uses a Catalog Recipe, so a rerun finds nothing to do.
CREATE TEMP TABLE "mp_copy_map" AS
SELECT
  pairs."family_id",
  pairs."source_id",
  COALESCE(live."id", gen_random_uuid()) AS "copy_id",
  (live."id" IS NULL) AS "is_new",
  COALESCE(
    (
      SELECT COALESCE(u."catalog_language", u."locale")
      FROM "user" u
      WHERE u."family_id" = pairs."family_id"
      ORDER BY (u."family_role" = 'owner') DESC, u."created_at" ASC, u."id" ASC
      LIMIT 1
    ),
    'en'
  ) AS "locale"
FROM (
  SELECT DISTINCT p."family_id", s."recipe_id" AS "source_id"
  FROM "meal_plan_slots" s
  INNER JOIN "meal_plans" p ON p."id" = s."meal_plan_id"
  INNER JOIN "recipes" r ON r."id" = s."recipe_id"
  WHERE r."family_id" IS NULL
) pairs
LEFT JOIN "recipes" live
  ON live."family_id" = pairs."family_id"
  AND live."copied_from_id" = pairs."source_id"
  AND live."archived_at" IS NULL;--> statement-breakpoint
INSERT INTO "recipes" ("id", "parent_id", "family_id", "copied_from_id", "title", "servings", "prep_minutes", "cook_minutes", "difficulty", "cuisine_id", "method_id", "nutrition_note")
SELECT
  m."copy_id", r."parent_id", m."family_id", r."id",
  COALESCE(rt."title", r."title"),
  r."servings", r."prep_minutes", r."cook_minutes", r."difficulty", r."cuisine_id", r."method_id",
  CASE WHEN r."nutrition_note" IS NULL THEN NULL ELSE COALESCE(nt."nutrition_note", r."nutrition_note") END
FROM "mp_copy_map" m
INNER JOIN "recipes" r ON r."id" = m."source_id"
LEFT JOIN "recipe_translations" rt ON rt."recipe_id" = r."id" AND rt."locale" = m."locale"
LEFT JOIN "recipe_nutrition_note_translations" nt ON nt."recipe_id" = r."id" AND nt."locale" = m."locale"
WHERE m."is_new";--> statement-breakpoint
INSERT INTO "recipe_ingredient_lines" ("id", "recipe_id", "position", "ingredient_id", "raw_name", "normalized_name", "quantity", "unit", "optional", "note")
SELECT
  gen_random_uuid(), m."copy_id",
  (ROW_NUMBER() OVER (PARTITION BY m."copy_id" ORDER BY l."position", l."id") - 1)::int,
  l."ingredient_id", l."raw_name", l."normalized_name", l."quantity", l."unit", l."optional",
  CASE WHEN l."note" IS NULL THEN NULL ELSE COALESCE(lt."note", l."note") END
FROM "mp_copy_map" m
INNER JOIN "recipe_ingredient_lines" l ON l."recipe_id" = m."source_id"
LEFT JOIN "recipe_ingredient_line_translations" lt ON lt."line_id" = l."id" AND lt."locale" = m."locale"
WHERE m."is_new";--> statement-breakpoint
CREATE TEMP TABLE "mp_step_map" AS
SELECT m."copy_id", st."id" AS "old_id", gen_random_uuid() AS "new_id",
  (ROW_NUMBER() OVER (PARTITION BY m."copy_id" ORDER BY st."position", st."id") - 1)::int AS "position",
  COALESCE(stt."text", st."text") AS "text", st."timer_seconds"
FROM "mp_copy_map" m
INNER JOIN "recipe_steps" st ON st."recipe_id" = m."source_id"
LEFT JOIN "recipe_step_translations" stt ON stt."step_id" = st."id" AND stt."locale" = m."locale"
WHERE m."is_new";--> statement-breakpoint
INSERT INTO "recipe_steps" ("id", "recipe_id", "position", "text", "timer_seconds")
SELECT "new_id", "copy_id", "position", "text", "timer_seconds" FROM "mp_step_map";--> statement-breakpoint
INSERT INTO "recipe_tips" ("id", "recipe_id", "step_id", "position", "text")
SELECT
  gen_random_uuid(), m."copy_id", sm."new_id",
  (ROW_NUMBER() OVER (PARTITION BY m."copy_id" ORDER BY tip."position", tip."id") - 1)::int,
  COALESCE(tt."text", tip."text")
FROM "mp_copy_map" m
INNER JOIN "recipe_tips" tip ON tip."recipe_id" = m."source_id"
LEFT JOIN "mp_step_map" sm ON sm."copy_id" = m."copy_id" AND sm."old_id" = tip."step_id"
LEFT JOIN "recipe_tip_translations" tt ON tt."tip_id" = tip."id" AND tt."locale" = m."locale"
WHERE m."is_new";--> statement-breakpoint
INSERT INTO "recipe_hidden_tips" ("recipe_id", "tip_id")
SELECT m."copy_id", h."tip_id"
FROM "mp_copy_map" m
INNER JOIN "recipe_hidden_tips" h ON h."recipe_id" = m."source_id"
WHERE m."is_new";--> statement-breakpoint
INSERT INTO "recipe_pairings" ("id", "recipe_id", "position", "kind", "label", "reason", "principle", "linked_ingredient_id", "linked_recipe_id")
SELECT
  gen_random_uuid(), m."copy_id",
  (ROW_NUMBER() OVER (PARTITION BY m."copy_id" ORDER BY p."position", p."id") - 1)::int,
  p."kind", COALESCE(pt."label", p."label"), COALESCE(pt."reason", p."reason"), p."principle",
  p."linked_ingredient_id",
  CASE
    WHEN p."linked_ingredient_id" IS NOT NULL THEN NULL
    WHEN lr."id" IS NOT NULL AND lr."family_id" IS NULL AND lr."archived_at" IS NULL THEN lr."id"
    ELSE NULL
  END
FROM "mp_copy_map" m
INNER JOIN "recipe_pairings" p ON p."recipe_id" = m."source_id"
LEFT JOIN "recipe_pairing_translations" pt ON pt."pairing_id" = p."id" AND pt."locale" = m."locale"
LEFT JOIN "recipes" lr ON lr."id" = p."linked_recipe_id"
WHERE m."is_new";--> statement-breakpoint
INSERT INTO "recipe_eating_moments" ("id", "recipe_id", "eating_moment_id", "position", "polarity", "reason")
SELECT
  gen_random_uuid(), m."copy_id", u."eating_moment_id",
  (ROW_NUMBER() OVER (PARTITION BY m."copy_id" ORDER BY u."position", u."id") - 1)::int,
  u."polarity",
  CASE WHEN u."reason" IS NULL THEN NULL ELSE COALESCE(ut."reason", u."reason") END
FROM "mp_copy_map" m
INNER JOIN "recipe_eating_moments" u ON u."recipe_id" = m."source_id"
INNER JOIN "eating_moments" em ON em."id" = u."eating_moment_id" AND em."archived_at" IS NULL
LEFT JOIN "recipe_eating_moment_translations" ut ON ut."recipe_eating_moment_id" = u."id" AND ut."locale" = m."locale"
WHERE m."is_new";--> statement-breakpoint
UPDATE "meal_plan_slots" s
SET "recipe_id" = m."copy_id", "updated_at" = now()
FROM "meal_plans" p, "mp_copy_map" m
WHERE p."id" = s."meal_plan_id"
  AND m."family_id" = p."family_id"
  AND m."source_id" = s."recipe_id";--> statement-breakpoint
DROP TABLE "mp_step_map";--> statement-breakpoint
DROP TABLE "mp_copy_map";
