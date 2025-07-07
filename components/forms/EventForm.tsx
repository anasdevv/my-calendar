'use client';

import { EventFormData, eventFormSchema } from '@/validations/events';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertDialogTitle } from '@radix-ui/react-alert-dialog';
import Link from 'next/link';
import { createEvent, deleteEvent, updateEvent } from '@/server/actions/events';
import { useServerActionHandler } from '@/lib/hooks/useServerActionHandler';

export default function EventForm({ event }: { event?: EventFormData }) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const router = useRouter();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: event?.name ?? '',
      description: event?.description ?? '',
      duration: event?.duration ?? 30,
      isActive: event?.isActive ?? true,
      id: event?.id ?? undefined,
    },
  });

  const { handleServerActionResult, clearFormErrors } =
    useServerActionHandler(form);

  const onSubmit = (data: EventFormData) => {
    clearFormErrors();

    startTransition(async () => {
      try {
        const result = event?.id
          ? await updateEvent(event.id as number, data)
          : await createEvent(data);

        if (handleServerActionResult(result)) {
          // Success! Navigate to events page
          router.push('/events');
        }
      } catch (error) {
        console.error('Unexpected error submitting event:', error);
        form.setError('root', {
          message: 'An unexpected error occurred. Please try again.',
        });
      }
    });
  };

  const handleDelete = () => {
    if (!event?.id) return;

    startDeleteTransition(async () => {
      try {
        const result = await deleteEvent(event.id as number);

        if (handleServerActionResult(result)) {
          // Success! Navigate to events page
          router.push('/events');
        }
      } catch (error) {
        console.error('Unexpected error deleting event:', error);
        form.setError('root', {
          message:
            'An unexpected error occurred while deleting. Please try again.',
        });
      }
    });
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-6 flex-col"
      >
        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertDescription>
              {form.formState.errors.root.message}
            </AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                The name users will see when booking
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormDescription>in minutes</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea className="resize-none h-32" {...field} />
              </FormControl>
              <FormDescription>
                A brief description of your event
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem>
              <div className="flex cursor-pointer items-center gap-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Active</FormLabel>
              </div>
              <FormDescription>
                Inactive events will not be shown to users
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          {event && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="hover:scale-105"
                  variant="destructive"
                  disabled={isPending || isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    this event and all its associated bookings.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isDeleting}
                    onClick={handleDelete}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            variant="outline"
            type="button"
            disabled={isPending || isDeleting}
            asChild
          >
            <Link href="/events">Cancel</Link>
          </Button>
          <Button
            className="cursor-pointer hover:scale-105 bg-blue-400 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 shadow-2xl"
            type="submit"
            disabled={isPending || isDeleting}
          >
            {isPending ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
