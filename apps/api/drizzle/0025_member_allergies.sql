CREATE TABLE "member_allergies" (
	"user_id" text NOT NULL,
	"allergen_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "member_allergies_user_id_allergen_id_pk" PRIMARY KEY("user_id","allergen_id")
);
--> statement-breakpoint
ALTER TABLE "member_allergies" ADD CONSTRAINT "member_allergies_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_allergies" ADD CONSTRAINT "member_allergies_allergen_id_allergens_id_fk" FOREIGN KEY ("allergen_id") REFERENCES "public"."allergens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "member_allergies_allergen_idx" ON "member_allergies" USING btree ("allergen_id");