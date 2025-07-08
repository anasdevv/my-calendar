import { eventsTable } from '@/db/schema';

export type EventRow = typeof eventsTable.$inferSelect;
