import { BookingsTable } from '@/db/schema';

export type BookingRow = typeof BookingsTable.$inferSelect;

export type RecentBookingRow = Partial<BookingRow> & {
  eventName: string;
};
