-- #104: normalizeName now folds the Danish letters to the ASCII spellings
-- receipts print: æ->ae, ø->oe, å->aa (å used to lose its ring and become "a").
-- Every stored matching key whose text holds one of them is recomputed.
--
-- The rules are copied from apps/api/src/catalog/normalize.ts. As a guard, each
-- row is first re-keyed with the OLD rules and must reproduce its stored key
-- (or already hold the new one); otherwise the SQL copy disagrees with the app
-- on that text and the migration stops rather than writing a wrong key.
-- A new key that collides on a unique index also stops it, naming the rows.
-- Rows without æ, ø or å keep their key: the new rules leave them unchanged.
CREATE FUNCTION pg_temp.pp_strip_marks(t text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT regexp_replace(t, '[̀-ͯ᪰-᫿᷀-᷿⃐-⃿︠-︯]', '', 'g')
$$;--> statement-breakpoint
CREATE FUNCTION pg_temp.pp_words(t text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT btrim(regexp_replace(t, '[^[:alnum:]]+', ' ', 'g'), ' ')
$$;--> statement-breakpoint
CREATE FUNCTION pg_temp.pp_old_key(t text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT pg_temp.pp_words(lower(pg_temp.pp_strip_marks(normalize(t, NFD))))
$$;--> statement-breakpoint
CREATE FUNCTION pg_temp.pp_new_key(t text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT pg_temp.pp_words(pg_temp.pp_strip_marks(
    replace(replace(replace(
      lower(replace(replace(normalize(t, NFD), 'Æ', 'ae'), 'Ø', 'oe')),
      'a' || chr(778), 'aa'), 'æ', 'ae'), 'ø', 'oe')))
$$;--> statement-breakpoint
CREATE TEMP TABLE pp_rekey ON COMMIT DROP AS
  SELECT tbl, id, source, old_key, pg_temp.pp_new_key(source) AS new_key
  FROM (
    SELECT 'aisles' AS tbl, id::text, name AS source, normalized_name AS old_key FROM aisles
    UNION ALL SELECT 'parent_categories', id::text, name, normalized_name FROM parent_categories
    UNION ALL SELECT 'leaf_categories', id::text, name, normalized_name FROM leaf_categories
    UNION ALL SELECT 'ingredients', id::text, name, normalized_name FROM ingredients
    UNION ALL SELECT 'catalog_translations', id::text, value, normalized_value FROM catalog_translations
    UNION ALL SELECT 'shopping_items', id::text, name, normalized_name FROM shopping_items WHERE name IS NOT NULL
    UNION ALL SELECT 'unmatched_entries', id::text, raw_name, normalized_name FROM unmatched_entries
  ) stored
  WHERE source ~ '[æøÆØ]' OR strpos(normalize(source, NFD), chr(778)) > 0;--> statement-breakpoint
DO $$
DECLARE
  problems text;
BEGIN
  SELECT string_agg(format('%s %s: %L is stored as %L', tbl, id, source, old_key), E'\n')
    INTO problems
    FROM pp_rekey
    WHERE old_key IS DISTINCT FROM pg_temp.pp_old_key(source)
      AND old_key IS DISTINCT FROM new_key;
  IF problems IS NOT NULL THEN
    RAISE EXCEPTION E'0012_fold_danish_letters: cannot re-key these rows, their stored key is not the one their text gives:\n%', problems;
  END IF;
END $$;--> statement-breakpoint
DO $$
DECLARE
  problems text;
BEGIN
  WITH keyed AS (
    SELECT 'aisles' AS tbl, ''::text AS scope, t.name AS source, coalesce(r.new_key, t.normalized_name) AS key
      FROM aisles t LEFT JOIN pp_rekey r ON r.tbl = 'aisles' AND r.id = t.id::text
    UNION ALL
    SELECT 'parent_categories', '', t.name, coalesce(r.new_key, t.normalized_name)
      FROM parent_categories t LEFT JOIN pp_rekey r ON r.tbl = 'parent_categories' AND r.id = t.id::text
    UNION ALL
    SELECT 'leaf_categories', '', t.name, coalesce(r.new_key, t.normalized_name)
      FROM leaf_categories t LEFT JOIN pp_rekey r ON r.tbl = 'leaf_categories' AND r.id = t.id::text
    UNION ALL
    SELECT 'ingredients', '', t.name, coalesce(r.new_key, t.normalized_name)
      FROM ingredients t LEFT JOIN pp_rekey r ON r.tbl = 'ingredients' AND r.id = t.id::text
    UNION ALL
    -- Display names are unique per entity type and locale; Synonyms per entity and locale.
    SELECT 'catalog_translations',
           CASE WHEN t.kind = 'name'
             THEN format('%s name, locale %s', t.entity_type, t.locale)
             ELSE format('%s %s synonym, locale %s', t.entity_type, t.entity_id, t.locale)
           END,
           t.value, coalesce(r.new_key, t.normalized_value)
      FROM catalog_translations t LEFT JOIN pp_rekey r ON r.tbl = 'catalog_translations' AND r.id = t.id::text
  )
  SELECT string_agg(format('%s%s %L: %s', tbl, CASE WHEN scope = '' THEN '' ELSE ' (' || scope || ')' END, key, sources), E'\n')
    INTO problems
    FROM (
      SELECT tbl, scope, key, string_agg(format('%L', source), ', ' ORDER BY source) AS sources
        FROM keyed
        GROUP BY tbl, scope, key
        HAVING count(*) > 1
    ) collisions;
  IF problems IS NOT NULL THEN
    RAISE EXCEPTION E'0012_fold_danish_letters: folding æ, ø and å makes these keys collide; rename or delete one of each before migrating:\n%', problems;
  END IF;
END $$;--> statement-breakpoint
UPDATE aisles t SET normalized_name = r.new_key
  FROM pp_rekey r WHERE r.tbl = 'aisles' AND r.id = t.id::text AND t.normalized_name <> r.new_key;--> statement-breakpoint
UPDATE parent_categories t SET normalized_name = r.new_key
  FROM pp_rekey r WHERE r.tbl = 'parent_categories' AND r.id = t.id::text AND t.normalized_name <> r.new_key;--> statement-breakpoint
UPDATE leaf_categories t SET normalized_name = r.new_key
  FROM pp_rekey r WHERE r.tbl = 'leaf_categories' AND r.id = t.id::text AND t.normalized_name <> r.new_key;--> statement-breakpoint
UPDATE ingredients t SET normalized_name = r.new_key
  FROM pp_rekey r WHERE r.tbl = 'ingredients' AND r.id = t.id::text AND t.normalized_name <> r.new_key;--> statement-breakpoint
UPDATE catalog_translations t SET normalized_value = r.new_key
  FROM pp_rekey r WHERE r.tbl = 'catalog_translations' AND r.id = t.id::text AND t.normalized_value <> r.new_key;--> statement-breakpoint
UPDATE shopping_items t SET normalized_name = r.new_key
  FROM pp_rekey r WHERE r.tbl = 'shopping_items' AND r.id = t.id::text AND t.normalized_name IS DISTINCT FROM r.new_key;--> statement-breakpoint
UPDATE unmatched_entries t SET normalized_name = r.new_key
  FROM pp_rekey r WHERE r.tbl = 'unmatched_entries' AND r.id = t.id::text AND t.normalized_name <> r.new_key;--> statement-breakpoint
DROP TABLE pp_rekey;--> statement-breakpoint
DROP FUNCTION pg_temp.pp_new_key(text);--> statement-breakpoint
DROP FUNCTION pg_temp.pp_old_key(text);--> statement-breakpoint
DROP FUNCTION pg_temp.pp_words(text);--> statement-breakpoint
DROP FUNCTION pg_temp.pp_strip_marks(text);
