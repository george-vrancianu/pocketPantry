CREATE TABLE "running_low" (
	"family_id" uuid NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "running_low_family_id_ingredient_id_pk" PRIMARY KEY("family_id","ingredient_id")
);
--> statement-breakpoint
ALTER TABLE "running_low" ADD CONSTRAINT "running_low_family_id_family_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."family"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "running_low" ADD CONSTRAINT "running_low_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;