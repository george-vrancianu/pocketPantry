CREATE TABLE "ingredient_stock_history" (
	"family_id" uuid NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"last_stocked_at" timestamp with time zone NOT NULL,
	"used_up_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ingredient_stock_history_family_id_ingredient_id_pk" PRIMARY KEY("family_id","ingredient_id")
);
--> statement-breakpoint
ALTER TABLE "ingredient_stock_history" ADD CONSTRAINT "ingredient_stock_history_family_id_family_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."family"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredient_stock_history" ADD CONSTRAINT "ingredient_stock_history_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
INSERT INTO "ingredient_stock_history" ("family_id", "ingredient_id", "last_stocked_at")
SELECT "family_id", "ingredient_id", max("created_at")
FROM "batches"
WHERE "ingredient_id" IS NOT NULL
GROUP BY "family_id", "ingredient_id";
