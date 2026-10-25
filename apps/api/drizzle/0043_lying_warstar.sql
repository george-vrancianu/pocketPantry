CREATE TYPE "public"."recipe_draft_kind" AS ENUM('new_recipe', 'variant');--> statement-breakpoint
CREATE TABLE "recipe_drafts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"family_id" uuid NOT NULL,
	"kind" "recipe_draft_kind" NOT NULL,
	"base_recipe_id" uuid,
	"content" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recipe_drafts" ADD CONSTRAINT "recipe_drafts_member_id_user_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_drafts" ADD CONSTRAINT "recipe_drafts_family_id_family_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."family"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_drafts" ADD CONSTRAINT "recipe_drafts_base_recipe_id_recipes_id_fk" FOREIGN KEY ("base_recipe_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "recipe_drafts_member_updated_idx" ON "recipe_drafts" USING btree ("member_id","updated_at");