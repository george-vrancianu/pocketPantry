CREATE TABLE "scan_usage" (
	"member_id" text NOT NULL,
	"day" date NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "scan_usage_member_id_day_pk" PRIMARY KEY("member_id","day"),
	CONSTRAINT "scan_usage_count_non_negative" CHECK ("scan_usage"."count" >= 0)
);
--> statement-breakpoint
ALTER TABLE "scan_usage" ADD CONSTRAINT "scan_usage_member_id_user_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;