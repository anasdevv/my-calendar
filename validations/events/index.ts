import { max } from 'drizzle-orm';
import { z } from 'zod/v4';

export const eventFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Event name is required'),
  description: z.string().min(1, 'Event description is required'),
  duration: z.number().min(1, 'Event duration must be at least 1 minute'),
  isActive: z.boolean().optional(),
  bufferBefore: z.number().min(0, 'Buffer before must be at least 0 minutes'),
  bufferAfter: z.number().min(0, 'Buffer after must be at least 0 minutes'),
  allowInviteeCancel: z.boolean(),
  allowInviteeReschedule: z.boolean(),
  requireConfirmation: z.boolean(),
  color: z.string(),
  maxAdvanceBooking: z
    .number()
    .min(0, 'Maximum advance booking must be at least 0 minutes'),
  minAdvanceBooking: z
    .number()
    .min(0, 'Minimum advance booking must be at least 0 minutes'),
});

export type EventFormData = z.infer<typeof eventFormSchema>;
