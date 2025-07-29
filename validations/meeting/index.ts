import { startOfDay } from 'date-fns';
import { z } from 'zod';

const meetingSchemaBase = z.object({
  startTime: z.date().min(new Date()),
  guestEmail: z.string().email().min(1, 'Required'),
  guestName: z.string().min(1, 'Required'),
  guestNotes: z.string().optional(),
  timezone: z.string().min(1, 'Required'),
});

export const meetingFormSchema = z
  .object({
    date: z.date().min(startOfDay(new Date()), 'Must be in the future'),
  })
  .merge(meetingSchemaBase);

export type MeetingFormData = z.infer<typeof meetingFormSchema>;

export const meetingActionSchema = z
  .object({
    eventId: z.number().int().min(1, 'Required'),
    clerkUserId: z.string().min(1, 'Required'),
  })
  .merge(meetingSchemaBase);

export type MeetingActionData = z.infer<typeof meetingActionSchema>;
