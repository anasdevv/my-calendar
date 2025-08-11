ALTER TABLE "events" ADD COLUMN "bufferBefore" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "bufferAfter" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "allowInviteeCancel" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "allowInviteeReschedule" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "requireConfirmation" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "color" text DEFAULT '#3B82F6';