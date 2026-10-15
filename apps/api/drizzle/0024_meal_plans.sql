CREATE TYPE "public"."mealtime" AS ENUM('breakfast', 'lunch', 'dinner');--> statement-breakpoint
CREATE TABLE "meal_plan_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meal_plan_id" uuid NOT NULL,
	"day_index" integer NOT NULL,
	"mealtime" "mealtime" NOT NULL,
	"recipe_id" uuid NOT NULL,
	"servings" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "meal_plan_slots_day_range" CHECK ("meal_plan_slots"."day_index" BETWEEN 0 AND 6),
	CONSTRAINT "meal_plan_slots_servings_range" CHECK ("meal_plan_slots"."servings" BETWEEN 1 AND 1000)
);
--> statement-breakpoint
CREATE TABLE "meal_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid NOT NULL,
	"name" text,
	"start_date" date NOT NULL,
	"days" integer NOT NULL,
	"servings" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "meal_plans_days_range" CHECK ("meal_plans"."days" BETWEEN 1 AND 7),
	CONSTRAINT "meal_plans_servings_range" CHECK ("meal_plans"."servings" BETWEEN 1 AND 1000)
);
--> statement-breakpoint
ALTER TABLE "meal_plan_slots" ADD CONSTRAINT "meal_plan_slots_meal_plan_id_meal_plans_id_fk" FOREIGN KEY ("meal_plan_id") REFERENCES "public"."meal_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plan_slots" ADD CONSTRAINT "meal_plan_slots_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_family_id_family_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."family"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "meal_plan_slots_plan_day_mealtime_idx" ON "meal_plan_slots" USING btree ("meal_plan_id","day_index","mealtime");--> statement-breakpoint
CREATE INDEX "meal_plan_slots_recipe_idx" ON "meal_plan_slots" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "meal_plans_family_start_idx" ON "meal_plans" USING btree ("family_id","start_date");