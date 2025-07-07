import { z } from 'zod/v4';

export const eventFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Event name is required'),
  description: z.string().min(1, 'Event description is required'),
  duration: z.number().min(1, 'Event duration must be at least 1 minute'),
  isActive: z.boolean().optional(),
});

export type EventFormData = z.infer<typeof eventFormSchema>;
