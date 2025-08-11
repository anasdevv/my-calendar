'use server';
import { getDbInstance } from '@/db';
import { MeetingActionData, meetingActionSchema } from '@/validations/meeting';
import { getAvailableTimeSlots } from './schedule';
import { fromZonedTime } from 'date-fns-tz';
import { createGoogleCalendarEvent, deleteGoogleCalendarEvent } from './event';
import { BookingsTable, eventsTable } from '@/db/schema';
import { and, desc, eq, sql } from 'drizzle-orm';
import { addMinutes } from 'date-fns';
import { RecentBookingRow } from '@/lib/types/booking';

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
    where: ({ clerkUserId: userClerkId, isActive, id }, { and, eq }) =>
      and(eq(userClerkId, clerkUserId), eq(isActive, true), eq(id, eventId)),
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

  if (!createEventResult?.success) {
    return {
      success: false,
      error:
        createEventResult?.error || 'Failed to create Google Calendar event',
    };
  }

  const endTime = addMinutes(startTimeInTimezone, event.duration);

  try {
    const result = await db.transaction(async tx => {
      const [booking] = await tx
        .insert(BookingsTable)
        .values({
          eventId: eventId!,
          userClerkId: clerkUserId!,
          calendarEventId: createEventResult.data.id!,
          calendarId: 'primary', // todo set this dynamically if needed
          status: 'confirmed',
          startTime: startTimeInTimezone,
          endTime: endTime,
          duration: event.duration,
          timezone: data.timezone!,
          attendeeEmail: data.guestEmail!,
          attendeeName: data.guestName ?? '',
          notes: data.guestNotes ?? '',
          syncedAt: new Date(),
        })
        .returning();

      await tx
        .update(eventsTable)
        .set({
          totalBookings: sql`${eventsTable.totalBookings} + 1`,
          totalHours: sql`${eventsTable.totalHours} + ${event.duration / 60}`,
          lastBooked: new Date(),
        })
        .where(eq(eventsTable.id, eventId));

      return booking;
    });

    return {
      success: true,
      data: {
        ...meetingData,
        eventId,
        clerkUserId,
        startTime: startTimeInTimezone,
        endTime: endTime,
        googleEventId: createEventResult.data.id,
        bookingId: result.id,
        duration: event.duration,
      },
    };
  } catch (dbError) {
    try {
      await deleteGoogleCalendarEvent({
        userId: clerkUserId,
        eventId: createEventResult?.data?.id as string,
      });
    } catch (cleanupError) {
      console.error('Failed to cleanup Google Calendar event:', cleanupError);
    }

    console.error('Database transaction failed:', dbError);
    return {
      success: false,
      error: 'Failed to save booking to database',
    };
  }
};

// export const cancelMeeting = async (bookingId: number, clerkUserId: string) => {
//   const db = getDbInstance();

//   try {
//     const result = await db.transaction(async tx => {
//       const booking = await tx.query.BookingsTable.findFirst({
//         where: ({ id, userClerkId }, { and, eq }) =>
//           and(eq(id, bookingId), eq(userClerkId, clerkUserId)),
//       });

//       if (!booking || booking.status === 'cancelled') {
//         throw new Error('Booking not found or already cancelled');
//       }

//       const cancelResult = await deleteGoogleCalendarEvent({
//         userId: clerkUserId,
//         eventId: booking.calendarEventId,
//       });

//       if (!cancelResult?.success) {
//         throw new Error('Failed to cancel Google Calendar event');
//       }

//       // 3. Update booking status
//       const [updatedBooking] = await tx
//         .update(BookingsTable)
//         .set({
//           status: 'cancelled',
//           cancelledAt: new Date(),
//           syncedAt: new Date(),
//         })
//         .where(eq(BookingsTable.id, bookingId))
//         .returning();

//       // 4. Update events table stats
//       await tx
//         .update(eventsTable)
//         .set({
//           totalBookings: sql`${eventsTable.totalBookings} - 1`,
//           totalHours: sql`${eventsTable.totalHours} - ${booking.durationMinutes / 60}`,
//         })
//         .where(eq(eventsTable.id, booking.eventId));

//       return updatedBooking;
//     });

//     return {
//       success: true,
//       data: result,
//     };
//   } catch (error) {
//     console.error('Failed to cancel meeting:', error);
//     return {
//       success: false,
//       error:
//         error instanceof Error ? error.message : 'Failed to cancel meeting',
//     };
//   }
// };

export async function getRecentBookings(
  clerkUserId: string,
  limit: number = 5
): Promise<RecentBookingRow[]> {
  const db = getDbInstance();

  try {
    const recentBookings = await db
      .select({
        id: BookingsTable.id,
        eventId: BookingsTable.eventId,
        calendarEventId: BookingsTable.calendarEventId,
        status: BookingsTable.status,

        startTime: BookingsTable.startTime,
        endTime: BookingsTable.endTime,
        durationMinutes: BookingsTable.duration,
        timezone: BookingsTable.timezone,
        attendeeEmail: BookingsTable.attendeeEmail,
        attendeeName: BookingsTable.attendeeName,
        notes: BookingsTable.notes,
        bookedAt: BookingsTable.updatedAt || BookingsTable.createdAt,
        eventName: eventsTable.name,
      })
      .from(BookingsTable)
      .innerJoin(eventsTable, eq(BookingsTable.eventId, eventsTable.id))
      .where(and(eq(BookingsTable.userClerkId, clerkUserId)))
      .orderBy(desc(BookingsTable.updatedAt || BookingsTable.createdAt))
      .limit(limit);

    return recentBookings;
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    return [];
  }
}
