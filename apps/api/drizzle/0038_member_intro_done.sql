ALTER TABLE "user" ADD COLUMN "intro_done_at" timestamp with time zone;
--> statement-breakpoint
-- Every Member that exists now has already seen the app: they never get the Intro. New Members start NULL.
UPDATE "user" SET "intro_done_at" = "created_at" WHERE "intro_done_at" IS NULL;
