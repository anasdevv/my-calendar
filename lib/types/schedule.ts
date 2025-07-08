import { scheduleAvailabilitiesTable, schedulesTable } from '@/db/schema';

export type ScheduleRow = typeof schedulesTable.$inferSelect;

export type AvailabilityRow = typeof scheduleAvailabilitiesTable.$inferSelect;
export type ScheduleWithAvailabilities = ScheduleRow & {
  availabilities: AvailabilityRow[];
};
