DROP INDEX "ingredients_normalized_name_idx";--> statement-breakpoint
ALTER TABLE "ingredients" ADD COLUMN "owner_family_id" uuid;--> statement-breakpoint
ALTER TABLE "ingredients" ADD COLUMN "created_by_user_id" text;--> statement-breakpoint
ALTER TABLE "ingredients" ADD COLUMN "name_locale" text;--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_owner_family_id_family_id_fk" FOREIGN KEY ("owner_family_id") REFERENCES "public"."family"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ingredients_family_normalized_name_idx" ON "ingredients" USING btree ("owner_family_id","normalized_name") WHERE "ingredients"."owner_family_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "ingredients_normalized_name_idx" ON "ingredients" USING btree ("normalized_name") WHERE "ingredients"."owner_family_id" IS NULL;