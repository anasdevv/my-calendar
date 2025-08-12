'use server';
import { getDbInstance } from '@/db';
import { eventsTable } from '@/db/schema';
import { ActionResult } from '@/lib/types/action-result';
import { EventRow } from '@/lib/types/event';
import { EventFormData, eventFormSchema } from '@/validations/events';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { addMinutes, endOfDay, startOfDay } from 'date-fns';
import { and, eq } from 'drizzle-orm';
import { calendar_v3 } from 'googleapis';
import { revalidatePath } from 'next/cache';
import { GoogleCalendarService } from '../google/google-calendar';
export const createEvent = async (
  unsafeEventData: EventFormData
): Promise<ActionResult> => {
  try {
    const db = getDbInstance();

    const user = await auth();
    if (!user?.userId) {
      return {
        success: false,
        error: 'User must be authenticated to create an event',
      };
    }

    const { success, data, error } = eventFormSchema.safeParse(unsafeEventData);
    if (!success) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: error?.flatten().fieldErrors,
      };
    }

    await db.insert(eventsTable).values({
      ...data,
      clerkUserId: user.userId,
    });

    revalidatePath('/events');

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.log('Error creating event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export const updateEvent = async (
  id: number,
  unsafeEventData: EventFormData
): Promise<ActionResult> => {
  try {
    if (!id) {
      return {
        success: false,
        error: 'ID is required for updating an event',
      };
    }

    const user = await auth();
    if (!user?.userId) {
      return {
        success: false,
        error: 'User must be authenticated to update an event',
      };
    }

    const { success, data, error } = eventFormSchema.safeParse(unsafeEventData);
    if (!success) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: error.flatten().fieldErrors,
      };
    }
    const db = getDbInstance();
    if (data.id) {
      data.id = undefined;
    }
    const { rowCount } = await db
      .update(eventsTable)
      .set({
        ...data,
        // id: undefined,
      })
      .where(
        and(eq(eventsTable.id, id), eq(eventsTable.clerkUserId, user.userId))
      );

    if (!rowCount) {
      return {
        success: false,
        error: 'Event not found or you do not have permission to update it',
      };
    }

    revalidatePath('/events');

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.log('Error updating event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export const deleteEvent = async (id: number): Promise<ActionResult> => {
  try {
    if (!id) {
      return {
        success: false,
        error: 'ID is required for deleting an event',
      };
    }

    const user = await auth();
    if (!user?.userId) {
      return {
        success: false,
        error: 'User must be authenticated to delete an event',
      };
    }
    const db = getDbInstance();

    const { rowCount } = await db
      .delete(eventsTable)
      .where(
        and(eq(eventsTable.id, id), eq(eventsTable.clerkUserId, user.userId))
      );

    if (!rowCount) {
      return {
        success: false,
        error: 'Event not found or you do not have permission to delete it',
      };
    }

    revalidatePath('/events');

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export const getAllEvents = async (userId: string): Promise<EventRow[]> => {
  const db = getDbInstance();

  return db.query.eventsTable.findMany({
    where: (events, { eq }) => {
      return eq(events.clerkUserId, userId);
    },
    orderBy: (events, { desc }) => {
      return desc(events.createdAt);
    },
  });
};

export const getEventById = async (
  eventId: number,
  userId: string
): Promise<EventRow | undefined> => {
  const db = getDbInstance();
  try {
    return db.query.eventsTable.findFirst({
      where: (events, { and, eq }) => {
        return and(eq(events.id, eventId), eq(events.clerkUserId, userId));
      },
    });
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    return undefined;
  }
};

export const getGoogleCalendarEventsTime = async (
  userId: string,
  { end, start }: { start: Date; end: Date }
) => {
  try {
    const calendar = GoogleCalendarService.getInstance();
    const events = await calendar.listEvents({
      userId,
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
    });
    if (!events || events.length === 0) {
      console.warn('No Google Calendar events found for user:', userId);
      return [];
    }
    const formattedEventTime = events
      .map(event => {
        if (event.start?.date && event.end?.date) {
          return {
            start: startOfDay(event.start.date),
            end: endOfDay(event.end.date),
          };
        }
        if (event.start?.dateTime && event.end?.dateTime) {
          return {
            start: new Date(event.start.dateTime),
            end: new Date(event.end.dateTime),
          };
        }
        return null;
      })
      .filter(Boolean);
    return formattedEventTime;
  } catch (error: any) {
    console.error('Error fetching Google events:', error);

    if (error.message?.includes('has not connected their Google account')) {
      console.warn(
        'User has not connected Google account, returning empty events'
      );
      return [];
    }

    console.warn('Failed to fetch Google events, returning empty array');
    return [];
  }
};

export const createGoogleCalendarEvent = async ({
  userId,
  guests,
  notes,
  startTime,
  duration,
  eventName,
  ...res
}: Partial<calendar_v3.Schema$Event> & {
  userId: string;
  notes?: string;
  startTime: Date;
  duration?: number; // in minutes
  eventName?: string;
  guests:
    | {
        displayName: string;
        email: string;
      }[]
    | undefined;
}): Promise<ActionResult<calendar_v3.Schema$Event>> => {
  try {
    const _clerkClient = await clerkClient();
    const user = await _clerkClient.users.getUser(userId);
    const userPrimaryEmail = user.primaryEmailAddress?.emailAddress;
    if (!userPrimaryEmail) {
      console.error('User does not have a primary email address');
      return {
        success: false,
        error: 'User does not have a primary email address',
      };
    }
    const calendar = GoogleCalendarService.getInstance();
    const response = await calendar.createEvent({
      userId,
      requestBody: {
        ...res,
        attendees: [
          ...(guests ?? []),
          {
            email: userPrimaryEmail,
            displayName: user.fullName,
            responseStatus: 'accepted',
          },
        ],
        description: notes
          ? 'Additional details: ' + notes
          : 'No additional details',
        start: {
          dateTime: startTime.toISOString(),
        },
        end: {
          dateTime: addMinutes(startTime, duration ?? 30).toISOString(),
        },
        summary: `${user.fullName} - ${eventName ?? ''} Meeting`,
      },
    });
    return { success: true, data: response };
  } catch (error: any) {
    console.error('Error creating Google Calendar event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export const deleteGoogleCalendarEvent = async ({
  userId,
  eventId,
}: {
  userId: string;
  eventId: string;
}): Promise<void> => {
  const calendar = GoogleCalendarService.getInstance();
  return calendar.deleteEvent({
    userId,
    eventId,
  });
};

export const getMostBookedEvents = async (
  userId: string,
  limit = 3
): Promise<EventRow[]> => {
  const db = getDbInstance();
  try {
    return db.query.eventsTable.findMany({
      where: (events, { eq }) => {
        return eq(events.clerkUserId, userId);
      },
      orderBy: (events, { desc }) => {
        return desc(events.totalBookings);
      },
      limit,
    });
  } catch (error) {
    console.error('Error fetching most booked events', error);
    return [];
  }
};
