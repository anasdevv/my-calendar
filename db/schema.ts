import { DAYS_OF_WEEK } from '@/constants';
import { max, relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';

const createdAt = timestamp('createdAt').defaultNow().notNull();

const updatedAt = timestamp('updatedAt')
  .defaultNow()
  .notNull()
  .$onUpdate(() => new Date());

export const eventsTable = pgTable(
  'events',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    description: text().notNull(),
    duration: integer().notNull(),
    clerkUserId: varchar({ length: 255 }).notNull(),
    isActive: boolean().default(true),
    bufferBefore: integer().default(0),
    bufferAfter: integer().default(0),
    allowInviteeCancel: boolean().default(true),
    allowInviteeReschedule: boolean().default(true),
    requireConfirmation: boolean().default(false),
    color: text().default('#3B82F6'),
    totalBookings: integer().default(0),
    lastBooked: timestamp().defaultNow(),
    maxAdvanceBooking: integer().default(30).notNull(),
    minAdvanceBooking: integer().default(1).notNull(),
    bookings: integer().default(0),
    createdAt,
    updatedAt,
  },
  table => [
    index('clerkUserId_index').on(table.clerkUserId),
    index('createdAt_index').on(table.createdAt),
    index('isActive_index').on(table.isActive),
  ]
);

export const schedulesTable = pgTable('schedules', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  timezone: varchar({ length: 255 }).notNull(),
  clerkUserId: varchar({ length: 255 }).notNull().unique(),
  createdAt,
  updatedAt,
});

export const scheduleDayOfWeekEnum = pgEnum('day', DAYS_OF_WEEK);

export const scheduleAvailabilitiesTable = pgTable(
  'scheduleAvailabilities',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    scheduleId: integer()
      .notNull()
      .references(() => schedulesTable.id, {
        onDelete: 'cascade',
      }),
    startTime: timestamp().notNull(),
    endTime: timestamp().notNull(),
    dayOfWeek: scheduleDayOfWeekEnum().notNull(),
  },
  table => [
    index('scheduleId_index').on(table.scheduleId),
    index('dayOfWeek_index').on(table.dayOfWeek),
  ]
);

// Relations
export const schedulesRelations = relations(schedulesTable, ({ many }) => ({
  availabilities: many(scheduleAvailabilitiesTable),
}));

export const scheduleAvailabilitiesRelations = relations(
  scheduleAvailabilitiesTable,
  ({ one }) => ({
    schedule: one(schedulesTable, {
      fields: [scheduleAvailabilitiesTable.scheduleId],
      references: [schedulesTable.id],
    }),
  })
);

export const schema = {
  // Tables
  eventsTable,
  schedulesTable,
  scheduleAvailabilitiesTable,

  // Relations
  schedulesRelations,
  scheduleAvailabilitiesRelations,

  // Enums
  scheduleDayOfWeekEnum,
};
