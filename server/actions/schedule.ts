'use server';
import { db } from '@/db';
import { scheduleAvailabilitiesTable, schedulesTable } from '@/db/schema';
import { EventRow } from '@/lib/types/event';
import { ScheduleWithAvailabilities } from '@/lib/types/schedule';
import { ScheduleFormData, scheduleFormSchema } from '@/validations/schedule';
import { auth } from '@clerk/nextjs/server';
import { fromZonedTime } from 'date-fns-tz';
import { eq } from 'drizzle-orm';
import { getGoogleCalendarEventsTime } from './event';
import {
  addMinutes,
  areIntervalsOverlapping,
  getDay,
  isWithinInterval,
  setHours,
  setMinutes,
} from 'date-fns';
import { DAYS_OF_WEEK_MAP, DAYS_OF_WEEK } from '@/constants';

export const getAvailableTimeSlots = async (
  allTimesSlot: Date[],
  { clerkUserId: userId, duration }: Partial<EventRow>
) => {
  if (allTimesSlot.length === 0) return [];
  const start = allTimesSlot[0];
  const end = allTimesSlot[allTimesSlot.length - 1];
  const schedule = await getUserSchedule(userId as string);
  if (!schedule) return [];
  // now lets group the schedule availabilities by day of week
  const grouped = Object.groupBy(
    schedule.availabilities,
    availability => availability.dayOfWeek
  );
  // ensure all days are present with empty arrays if missing
  const availabilitiesByDayOfWeek: Record<
    (typeof DAYS_OF_WEEK)[number],
    ScheduleWithAvailabilities['availabilities']
  > = DAYS_OF_WEEK.reduce(
    (acc, day) => {
      acc[day] = grouped[day] ?? [];
      return acc;
    },
    {} as Record<
      (typeof DAYS_OF_WEEK)[number],
      ScheduleWithAvailabilities['availabilities']
    >
  );
  if (!availabilitiesByDayOfWeek) return [];

  const existingEventsTimeSlots = await getGoogleCalendarEventsTime(
    userId as string,
    {
      end,
      start,
    }
  );

  return allTimesSlot.filter(interval => {
    const dayAvailabilites = getDayAvailability(
      availabilitiesByDayOfWeek,
      interval,
      schedule.timezone
    );
    const eventInterval = {
      start: interval,
      end: addMinutes(interval, duration || 30),
    };
    const isAvailableForEvent = existingEventsTimeSlots.every(slot => {
      if (!slot?.start || !slot?.end) return true;
      return !areIntervalsOverlapping(slot, eventInterval);
    });
    if (!isAvailableForEvent) return false;
    // event fits atleast one availability slot

    return dayAvailabilites.some(
      (availability: { start: Date; end: Date }) =>
        isWithinInterval(availability.start, eventInterval) &&
        isWithinInterval(availability.end, eventInterval)
    );
  });
};

export const getUserSchedule = async (
  userId: string
): Promise<ScheduleWithAvailabilities | undefined> => {
  return db.query.schedulesTable.findFirst({
    where({ clerkUserId }, { eq }) {
      return eq(clerkUserId, userId);
    },
    with: {
      availabilities: true,
    },
    orderBy: (schedules, { desc }) => {
      return desc(schedules.createdAt);
    },
  });
};

export const saveUserSchedule = async (
  unsafeScheduleData: ScheduleFormData
) => {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn();
  }
  const { success, data, error } =
    scheduleFormSchema.safeParse(unsafeScheduleData);
  if (!success || error) {
    return {
      success: false,
      error: error ? error.message : 'Invalid schedule data',
      fieldErrors: error?.flatten().fieldErrors,
    };
  }
  const { availabilities, ...scheduleData } = data;

  await db.transaction(async tx => {
    const [schedule] = await tx
      .insert(schedulesTable)
      .values({
        ...scheduleData,
        clerkUserId: userId,
      })
      .onConflictDoUpdate({
        target: schedulesTable.clerkUserId,
        set: {
          ...scheduleData,
          updatedAt: new Date(),
        },
      })
      .returning({
        id: schedulesTable.id,
      });

    if (availabilities && availabilities.length > 0) {
      await tx
        .delete(scheduleAvailabilitiesTable)
        .where(eq(scheduleAvailabilitiesTable.scheduleId, schedule.id));

      const availabilityValues = availabilities.map(availability => {
        const today = new Date();
        const [startHour, startMinute] = availability.startTime
          .split(':')
          .map(Number);
        const [endHour, endMinute] = availability.endTime
          .split(':')
          .map(Number);

        const startTime = new Date(today);
        startTime.setHours(startHour, startMinute, 0, 0);

        const endTime = new Date(today);
        endTime.setHours(endHour, endMinute, 0, 0);

        return {
          scheduleId: schedule.id,
          dayOfWeek: availability.dayOfWeek,
          startTime,
          endTime,
        };
      });

      await tx.insert(scheduleAvailabilitiesTable).values(availabilityValues);
    }
  });
  return {
    success: true,
    message: 'User schedule saved successfully',
  };
};

const getDayAvailability = (
  availabilitiesByDayOfWeek: Record<
    (typeof DAYS_OF_WEEK)[number],
    ScheduleWithAvailabilities['availabilities']
  >,
  date: Date,
  timezone: string
): { start: Date; end: Date }[] => {
  const day = DAYS_OF_WEEK_MAP[getDay(date) as keyof typeof DAYS_OF_WEEK_MAP];
  if (!day) {
    return [];
  }
  const availabilities = availabilitiesByDayOfWeek[day];
  if (!availabilities || availabilities.length === 0) {
    return [];
  }
  // convert availabilities to the same timezone as the schedule
  return availabilities.map(availabilitiy => {
    const [startHour, startMinute] = (
      availabilitiy.startTime as unknown as string
    )
      .split(':')
      .map(Number);
    const [endHour, endMinute] = (availabilitiy.endTime as unknown as string)
      .split(':')
      .map(Number);
    const start = fromZonedTime(
      setMinutes(setHours(date, startHour), startMinute),
      timezone
    );
    const end = fromZonedTime(
      setMinutes(setHours(date, endHour), endMinute),
      timezone
    );
    return {
      start,
      end,
    };
  });
};
