-- #415: barcodes are stored in one canonical form (GTIN-13: UPC-A gets a leading 0,
-- UPC-E is expanded to UPC-A first; an EAN-8 keeps its 8 digits). Rows already stored
-- under another form are moved to it. The rules are copied from apps/api/src/barcode/gtin.ts.
--
-- Stored codes with an invalid check digit are left untouched: they are user data, and
-- nothing can say which form they were meant to be in.
-- Known Barcodes: when several rows of one Family collapse onto one code, the most recently
-- updated row survives (ties: the later id); the others are deleted.
-- Open Food Facts cache: the same for the most recently fetched row; it is only a cache.
CREATE FUNCTION pg_temp.pp_has_check_digit(digits text) RETURNS boolean
LANGUAGE sql IMMUTABLE AS $$
  SELECT (10 - (
    SELECT coalesce(sum(substr(digits, i, 1)::int
      * CASE WHEN (length(digits) - i) % 2 = 1 THEN 3 ELSE 1 END), 0)
    FROM generate_series(1, length(digits) - 1) AS i
  ) % 10) % 10 = right(digits, 1)::int
$$;--> statement-breakpoint
CREATE FUNCTION pg_temp.pp_gtin13(code text) RETURNS text
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  upc_a text;
  last_digit text;
BEGIN
  IF code !~ '^([0-9]{8}|[0-9]{12}|[0-9]{13})$' THEN
    RETURN NULL;
  END IF;
  IF length(code) = 8 THEN
    IF left(code, 1) = '0' THEN
      last_digit := substr(code, 7, 1);
      upc_a := CASE
        WHEN last_digit IN ('0', '1', '2') THEN
          substr(code, 1, 3) || last_digit || '0000' || substr(code, 4, 3)
        WHEN last_digit = '3' THEN substr(code, 1, 4) || '00000' || substr(code, 5, 2)
        WHEN last_digit = '4' THEN substr(code, 1, 5) || '00000' || substr(code, 6, 1)
        ELSE substr(code, 1, 6) || '0000' || last_digit
      END || right(code, 1);
      IF pg_temp.pp_has_check_digit(upc_a) THEN
        RETURN '0' || upc_a;
      END IF;
    END IF;
    IF pg_temp.pp_has_check_digit(code) THEN
      RETURN code;
    END IF;
    RETURN NULL;
  END IF;
  code := lpad(code, 13, '0');
  IF pg_temp.pp_has_check_digit(code) THEN
    RETURN code;
  END IF;
  RETURN NULL;
END
$$;--> statement-breakpoint
DELETE FROM known_barcodes WHERE id IN (
  SELECT id FROM (
    SELECT id, row_number() OVER (
      PARTITION BY family_id, coalesce(pg_temp.pp_gtin13(barcode), barcode)
      ORDER BY updated_at DESC, id DESC
    ) AS rank
    FROM known_barcodes
  ) AS ranked WHERE rank > 1
);--> statement-breakpoint
UPDATE known_barcodes SET barcode = pg_temp.pp_gtin13(barcode)
WHERE pg_temp.pp_gtin13(barcode) IS NOT NULL AND pg_temp.pp_gtin13(barcode) <> barcode;--> statement-breakpoint
DELETE FROM open_food_facts_cache WHERE barcode IN (
  SELECT barcode FROM (
    SELECT barcode, row_number() OVER (
      PARTITION BY coalesce(pg_temp.pp_gtin13(barcode), barcode)
      ORDER BY fetched_at DESC, barcode DESC
    ) AS rank
    FROM open_food_facts_cache
  ) AS ranked WHERE rank > 1
);--> statement-breakpoint
UPDATE open_food_facts_cache SET barcode = pg_temp.pp_gtin13(barcode)
WHERE pg_temp.pp_gtin13(barcode) IS NOT NULL AND pg_temp.pp_gtin13(barcode) <> barcode;
