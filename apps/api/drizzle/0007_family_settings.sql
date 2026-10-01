CREATE TABLE "family_expiry_overrides" (
	"family_id" uuid NOT NULL,
	"entity_type" "catalog_entity_type" NOT NULL,
	"entity_id" uuid NOT NULL,
	"days" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "family_expiry_overrides_family_id_entity_type_entity_id_pk" PRIMARY KEY("family_id","entity_type","entity_id"),
	CONSTRAINT "family_expiry_overrides_category" CHECK ("family_expiry_overrides"."entity_type" IN ('parent_category', 'leaf_category')),
	CONSTRAINT "family_expiry_overrides_days" CHECK ("family_expiry_overrides"."days" BETWEEN 1 AND 3650)
);
--> statement-breakpoint
ALTER TABLE "family" ADD COLUMN "stale_threshold_days" integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "locale" text;--> statement-breakpoint
ALTER TABLE "family_expiry_overrides" ADD CONSTRAINT "family_expiry_overrides_family_id_family_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."family"("id") ON DELETE cascade ON UPDATE no action;