CREATE TABLE "shopping_template_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"ingredient_id" uuid,
	"name" text,
	"normalized_name" text,
	"quantity" numeric(12, 3),
	"unit" "ingredient_unit",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shopping_template_lines_matched_or_named" CHECK (("shopping_template_lines"."ingredient_id" IS NOT NULL) <> ("shopping_template_lines"."name" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "shopping_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shopping_template_lines" ADD CONSTRAINT "shopping_template_lines_template_id_shopping_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."shopping_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_template_lines" ADD CONSTRAINT "shopping_template_lines_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_templates" ADD CONSTRAINT "shopping_templates_family_id_family_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."family"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "shopping_template_lines_template_idx" ON "shopping_template_lines" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "shopping_template_lines_ingredient_idx" ON "shopping_template_lines" USING btree ("ingredient_id");--> statement-breakpoint
CREATE INDEX "shopping_templates_family_idx" ON "shopping_templates" USING btree ("family_id");