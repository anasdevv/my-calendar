ALTER TABLE "events" ADD COLUMN "maxAdvanceBooking" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "minAdvanceBooking" integer DEFAULT 1 NOT NULL;