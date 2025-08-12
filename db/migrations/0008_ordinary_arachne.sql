CREATE TABLE "bookings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bookings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"eventId" integer NOT NULL,
	"userClerkId" varchar(255) NOT NULL,
	"calendarEventId" varchar(255) NOT NULL,
	"calendarId" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'confirmed' NOT NULL,
	"cancelledAt" timestamp,
	"syncedAt" timestamp,
	"startTime" timestamp NOT NULL,
	"endTime" timestamp NOT NULL,
	"duration" integer NOT NULL,
	"timezone" varchar(255) NOT NULL,
	"attendeeEmail" varchar,
	"attendeeName" varchar,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "totalHours" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_eventId_events_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "eventId_index" ON "bookings" USING btree ("eventId");--> statement-breakpoint
CREATE INDEX "userClerkId_index" ON "bookings" USING btree ("userClerkId");--> statement-breakpoint
CREATE INDEX "status_index" ON "bookings" USING btree ("status");--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "bookings";