CREATE TABLE "open_food_facts_cache" (
	"barcode" text PRIMARY KEY NOT NULL,
	"product" jsonb,
	"fetched_at" timestamp with time zone NOT NULL
);
