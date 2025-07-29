'use server';
import { db } from '@/db';
import { eventsTable } from '@/db/schema';
import { EventFormData, eventFormSchema } from '@/validations/events';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { ActionResult } from '@/lib/types/action-result';
import { EventRow } from '@/lib/types/event';
import { GoogleCalendarService } from '../google/google-calendar';
import { eachMinuteOfInterval, endOfDay, startOfDay } from 'date-fns';

export const createEvent = async (
  unsafeEventData: EventFormData
): Promise<ActionResult> => {
  try {
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

    const { rowCount } = await db
      .update(eventsTable)
      .set({
        ...data,
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
    console.log('Error deleting event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export const getAllEvents = async (userId: string): Promise<EventRow[]> => {
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
  return db.query.eventsTable.findFirst({
    where: (events, { and, eq }) => {
      return and(eq(events.id, eventId), eq(events.clerkUserId, userId));
    },
  });
};

export const getGoogleCalendarEventsTime = async (
  userId: string,
  { end, start }: { start: Date; end: Date }
) => {
  try {
    const calendar = GoogleCalendarService.getInstance();
    const events = await calendar.listEvents({
      userId,
      timeMax: start.toISOString(),
      timeMin: end.toISOString(),
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
