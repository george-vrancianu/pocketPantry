CREATE TABLE "staples" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"quantity" numeric(12, 3),
	"unit" "ingredient_unit",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "staples_unit_with_quantity" CHECK ("staples"."quantity" IS NULL OR "staples"."unit" IS NOT NULL),
	CONSTRAINT "staples_quantity_positive" CHECK ("staples"."quantity" IS NULL OR "staples"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "suggestion_dismissals" (
	"family_id" uuid NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "suggestion_dismissals_family_id_ingredient_id_pk" PRIMARY KEY("family_id","ingredient_id")
);
--> statement-breakpoint
ALTER TABLE "staples" ADD CONSTRAINT "staples_family_id_family_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."family"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staples" ADD CONSTRAINT "staples_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suggestion_dismissals" ADD CONSTRAINT "suggestion_dismissals_family_id_family_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."family"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suggestion_dismissals" ADD CONSTRAINT "suggestion_dismissals_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "staples_family_ingredient_idx" ON "staples" USING btree ("family_id","ingredient_id");