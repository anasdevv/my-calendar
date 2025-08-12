ALTER TABLE "events" ADD COLUMN "totalBookings" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "lastBooked" timestamp DEFAULT now();