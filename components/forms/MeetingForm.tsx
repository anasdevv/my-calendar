// This React component, `MeetingForm`, is a client-side form built with `react-hook-form` and `zod` validation, allowing users to schedule a meeting by selecting a timezone, date, and time, and providing their name, email, and optional notes. It uses various custom UI components (like `Select`, `Calendar`, and `Popover`) for a smooth user experience. The form filters available meeting times (`validTimes`) based on the user's selected timezone and date, ensuring only valid options are shown. Upon submission, it sends the form data along with the `eventId` and `clerkUserId` to a backend function (`createMeeting`) to create the meeting, and handles any server-side errors by displaying them in the UI.

'use client';
import {
  formatDate,
  formatTimeString,
  formatTimezoneOffset,
} from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { isSameDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { MeetingFormData, meetingFormSchema } from '@/validations/meeting';
import BookingLoading from '../BookingLoading';
import { createMeeting } from '@/server/actions/meeting';

export default function MeetingForm({
  validTimeSlots,
  eventId,
  clerkUserId,
}: {
  validTimeSlots: Date[];
  eventId: number;
  clerkUserId: string;
}) {
  const router = useRouter();

  const form = useForm<MeetingFormData>({
    resolver: zodResolver(meetingFormSchema),

    defaultValues: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      guestName: '',
      guestEmail: '',
      guestNotes: '',
    },
  });

  const timezone = form.watch('timezone');
  const date = form.watch('date');
  const validTimeSlotsInTimezone = useMemo(() => {
    return validTimeSlots.map(date => toZonedTime(date, timezone));
  }, [validTimeSlots, timezone]);

  async function onSubmit(values: MeetingFormData) {
    try {
      const createMeetingResponse = await createMeeting({
        ...values,
        eventId,
        clerkUserId,
      });
      if (!createMeetingResponse?.success) {
        form.setError('root', {
          message: createMeetingResponse?.error,
        });
        return;
      }
      const path = `/book/${clerkUserId}/${eventId}/success?startTime=${values.startTime.toISOString()}`;
      router.push(path);
    } catch (error: any) {
      form.setError('root', {
        message: `There was an unknown error saving your event ${error.message}`,
      });
    }
  }

  //   todo Add Skeleton loading state
  if (form.formState.isSubmitting) return <BookingLoading />;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-6 flex-col"
      >
        {form.formState.errors.root && (
          <div className="text-destructive text-sm">
            {form.formState.errors.root.message}
          </div>
        )}

        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Intl.supportedValuesOf('timeZone').map(timezone => (
                    <SelectItem key={timezone} value={timezone}>
                      {timezone}
                      {` (${formatTimezoneOffset(timezone)})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 flex-col md:flex-row">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <Popover>
                <FormItem className="flex-1">
                  <FormLabel>Date</FormLabel>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'pl-3 text-left font-normal flex w-full',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          formatDate(field.value)
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date: string | Date) =>
                        !validTimeSlotsInTimezone.some(time =>
                          isSameDay(date, time)
                        )
                      }
                      autoFocus
                    />
                  </PopoverContent>
                  <FormMessage />
                </FormItem>
              </Popover>
            )}
          />

          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Time</FormLabel>
                <Select
                  disabled={date == null || timezone == null}
                  onValueChange={value =>
                    field.onChange(new Date(Date.parse(value)))
                  }
                  defaultValue={field.value?.toISOString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          date == null || timezone == null
                            ? 'Select a date/timezone first'
                            : 'Select a meeting time'
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {validTimeSlotsInTimezone
                      .filter(time => isSameDay(time, date))
                      .map(time => (
                        <SelectItem
                          key={time.toISOString()}
                          value={time.toISOString()}
                        >
                          {formatTimeString(time)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4 flex-col md:flex-row">
          <FormField
            control={form.control}
            name="guestName"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Your Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="guestEmail"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Your Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="guestNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          <Button
            disabled={form.formState.isSubmitting}
            type="button"
            asChild
            variant="outline"
          >
            <Link href={`/book/${clerkUserId}`}>Cancel</Link>
          </Button>
          <Button
            className="cursor-pointer hover:scale-105 bg-blue-400 hover:bg-blue-600"
            disabled={form.formState.isSubmitting}
            type="submit"
          >
            Book Event
          </Button>
        </div>
      </form>
    </Form>
  );
}
