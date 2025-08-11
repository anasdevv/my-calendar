'use server';
import { getDbInstance } from '@/db';
import { MeetingActionData, meetingActionSchema } from '@/validations/meeting';
import { getAvailableTimeSlots } from './schedule';
import { fromZonedTime } from 'date-fns-tz';
import { createGoogleCalendarEvent } from './event';
import { eventsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

const db = getDbInstance();

export const createMeeting = async (
  unsafeMeetingActionData: MeetingActionData
) => {
  const { success, data, error } = meetingActionSchema.safeParse(
    unsafeMeetingActionData
  );
  if (!success || error) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: error?.flatten().fieldErrors,
    };
  }
  const db = getDbInstance();

  const { eventId, clerkUserId, ...meetingData } = data;
  const event = await db!.query.eventsTable.findFirst({
    where: ({ clerkUserId, isActive, id }, { and, eq }) =>
      and(eq(clerkUserId, clerkUserId), eq(isActive, true), eq(id, eventId)),
  });

  if (!event) {
    return {
      success: false,
      error: 'Event not found or inactive',
    };
  }
  const startTimeInTimezone = fromZonedTime(data.startTime, data.timezone);
  const validTimeSlots = await getAvailableTimeSlots([startTimeInTimezone], {
    clerkUserId: data.clerkUserId,
    duration: event.duration,
  });
  if (!validTimeSlots.length) {
    return {
      success: false,
      error: 'No available time slots found for the selected time',
    };
  }
  const createEventResult = await createGoogleCalendarEvent({
    userId: clerkUserId,
    guests: [
      {
        displayName: data.guestName,
        email: data.guestEmail,
      },
    ],
    notes: data.guestNotes,
    startTime: startTimeInTimezone,
    duration: event.duration,
    eventName: event.name,
  });
  await db.transaction(async tx => {
    const event = await tx
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, eventId))
      .for('update');

    await tx
      .update(eventsTable)
      .set({
        bookings: (event[0]?.bookings ?? 0) + 1,
        lastBooked: new Date(),
      })
      .where(eq(eventsTable.id, eventId));
  });
  if (!createEventResult?.success) {
    return {
      success: false,
      error:
        createEventResult?.error || 'Failed to create Google Calendar event',
    };
  }
  return {
    success: true,
    data: {
      ...meetingData,
      eventId,
      clerkUserId,
      startTime: startTimeInTimezone,
      googleEventId: createEventResult.data.id,
    },
  };
};
