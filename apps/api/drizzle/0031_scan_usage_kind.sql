CREATE TYPE "public"."usage_kind" AS ENUM('scan', 'voice');--> statement-breakpoint
ALTER TABLE "scan_usage" ADD COLUMN "kind" "usage_kind" DEFAULT 'scan' NOT NULL;--> statement-breakpoint
ALTER TABLE "scan_usage" DROP CONSTRAINT "scan_usage_member_id_day_pk";--> statement-breakpoint
ALTER TABLE "scan_usage" ADD CONSTRAINT "scan_usage_member_id_day_kind_pk" PRIMARY KEY("member_id","day","kind");
