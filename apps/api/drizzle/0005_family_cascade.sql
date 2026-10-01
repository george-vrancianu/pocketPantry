ALTER TABLE "shopping_lists" DROP CONSTRAINT "shopping_lists_family_id_family_id_fk";
--> statement-breakpoint
ALTER TABLE "shopping_lists" ADD CONSTRAINT "shopping_lists_family_id_family_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."family"("id") ON DELETE cascade ON UPDATE no action;