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
import {
  CalendarIcon,
  Clock,
  Globe,
  User,
  Mail,
  MessageSquare,
  Loader2,
  Check,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
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
import { Virtuoso } from 'react-virtuoso';

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
  const [currentStep, setCurrentStep] = useState(0);
  const [isTimezoneLoading, setIsTimezoneLoading] = useState(false);

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
  const startTime = form.watch('startTime');

  const validTimeSlotsInTimezone = useMemo(() => {
    if (!timezone) return [];
    setIsTimezoneLoading(true);
    const result = validTimeSlots.map(date => toZonedTime(date, timezone));
    setTimeout(() => setIsTimezoneLoading(false), 100);
    return result;
  }, [validTimeSlots, timezone]);

  const steps = [
    { number: 1, title: 'Time' },
    { number: 2, title: 'Details' },
    { number: 3, title: 'Confirm' },
  ];

  const canProceedToStep2 = timezone && date && startTime;
  const canProceedToStep3 = form.watch('guestName') && form.watch('guestEmail');

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
      console.error('Error creating meeting:', error);
      form.setError('root', {
        message: `There was an unknown error saving your event ${error.message}`,
      });
    }
  }

  if (form.formState.isSubmitting) return <BookingLoading />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto">
        {' '}
        {/* Max-width focused for single column */}
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Schedule Your Meeting
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            A few quick steps to book your time.
          </p>
        </div>
        {/* Progress Bar (Minimalist) */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300 ease-in-out"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {steps.map(step => (
              <span
                key={step.number}
                className={cn(
                  'text-xs font-medium',
                  currentStep >= step.number
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                {step.number}. {step.title}
              </span>
            ))}
          </div>
        </div>
        {/* Main Form Card */}
        <div className="bg-white dark:bg-gray-850 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Error Message */}
              {form.formState.errors.root && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm">
                  <span className="font-medium">
                    {form.formState.errors.root.message}
                  </span>
                </div>
              )}

              <div className="p-8 min-h-[450px]">
                {' '}
                {/* Refined padding and min-height */}
                {/* Step 1: Time Selection */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    {' '}
                    {/* Consistent spacing */}
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                      Select Time & Date
                    </h2>
                    {/* Timezone */}
                    <FormField
                      control={form.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Globe className="w-4 h-4 text-gray-500" />
                            Timezone
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ''}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 text-base border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 rounded-lg">
                                <SelectValue asChild>
                                  <span className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                    {field.value ? (
                                      <>
                                        <Globe className="w-4 h-4 text-gray-400" />
                                        <span className="truncate">
                                          {field.value} (
                                          {formatTimezoneOffset(field.value)})
                                        </span>
                                      </>
                                    ) : (
                                      'Select timezone'
                                    )}
                                  </span>
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="border border-gray-200 dark:border-gray-700 shadow-md rounded-lg">
                              <Virtuoso
                                style={{
                                  height: '250px',
                                  width: '100%',
                                  overflowX: 'hidden',
                                }}
                                totalCount={
                                  Intl.supportedValuesOf('timeZone').length
                                }
                                itemContent={index => {
                                  const timezone =
                                    Intl.supportedValuesOf('timeZone')[index];
                                  return (
                                    <SelectItem
                                      key={timezone}
                                      value={timezone}
                                      className="py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                      {timezone} (
                                      {formatTimezoneOffset(timezone)})
                                    </SelectItem>
                                  );
                                }}
                              />
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Date and Time (Single Column) */}
                    <div className="space-y-6">
                      {/* Date Picker */}
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                              <CalendarIcon className="w-4 h-4 text-gray-500" />
                              Choose Date
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      'w-full h-11 text-base border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 justify-start rounded-lg',
                                      !field.value && 'text-muted-foreground'
                                    )}
                                  >
                                    <CalendarIcon className="mr-3 h-4 w-4 text-gray-400" />
                                    {field.value
                                      ? formatDate(field.value)
                                      : 'Select date'}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0 border border-gray-200 dark:border-gray-700 shadow-md rounded-lg"
                                align="center"
                              >
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
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Time Slots */}
                      <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => {
                          const filteredTimes = validTimeSlotsInTimezone.filter(
                            time => (date ? isSameDay(time, date) : false)
                          );

                          return (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Clock className="w-4 h-4 text-gray-500" />
                                Available Times
                              </FormLabel>
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[150px] border border-gray-200 dark:border-gray-700">
                                {isTimezoneLoading ? (
                                  <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                  </div>
                                ) : !date || !timezone ? (
                                  <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 text-sm">
                                    Select date and timezone to see times.
                                  </div>
                                ) : filteredTimes.length === 0 ? (
                                  <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 text-sm">
                                    No available times for this date.
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto custom-scrollbar">
                                    {filteredTimes.map(time => {
                                      const isSelected =
                                        field.value?.toISOString() ===
                                        time.toISOString();
                                      return (
                                        <button
                                          key={time.toISOString()}
                                          type="button"
                                          className={cn(
                                            'h-10 rounded-md text-sm font-medium transition-colors duration-200 border',
                                            isSelected
                                              ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                              : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-750'
                                          )}
                                          onClick={() => field.onChange(time)}
                                        >
                                          {formatTimeString(time)}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                    </div>
                  </div>
                )}
                {/* Step 2: User Details */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                      Your Contact Details
                    </h2>

                    <FormField
                      control={form.control}
                      name="guestName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <User className="w-4 h-4 text-gray-500" />
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-11 text-base border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 rounded-lg"
                              placeholder="John Doe"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="guestEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Mail className="w-4 h-4 text-gray-500" />
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              {...field}
                              className="h-11 text-base border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 rounded-lg"
                              placeholder="john@example.com"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="guestNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <MessageSquare className="w-4 h-4 text-gray-500" />
                            Additional Notes (Optional)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              className="resize-none min-h-[100px] text-base border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 rounded-lg"
                              {...field}
                              placeholder="Anything you'd like to discuss or prepare for the meeting..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                {/* Step 3: Confirmation */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                      Review & Confirm
                    </h2>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-4 border border-gray-200 dark:border-gray-600">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                          <CalendarIcon className="w-4 h-4 text-blue-600" />
                          Date & Time
                        </h3>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {date && formatDate(date)} @{' '}
                          {startTime && formatTimeString(startTime)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {timezone &&
                            `${timezone} (${formatTimezoneOffset(timezone)})`}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-green-600" />
                          Contact Information
                        </h3>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {form.watch('guestName')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {form.watch('guestEmail')}
                        </p>
                      </div>

                      {form.watch('guestNotes') && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-purple-600" />
                            Notes
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {form.watch('guestNotes')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                <div>
                  {currentStep > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      className="h-11 px-5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-750 rounded-lg"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    className="h-11 px-5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-750 rounded-lg"
                  >
                    <Link href={`/book/${clerkUserId}`}>Cancel</Link>
                  </Button>

                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(prev => prev + 1)}
                      disabled={
                        (currentStep === 1 && !canProceedToStep2) ||
                        (currentStep === 2 && !canProceedToStep3)
                      }
                      className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-lg"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="h-11 px-6 bg-green-600 hover:bg-green-700 text-white shadow-md rounded-lg"
                    >
                      {form.formState.isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Booking...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Confirm Booking
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
      {/* Custom Scrollbar CSS (add to your global CSS or a dedicated component CSS file) */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(
            156,
            163,
            175,
            0.5
          ); /* gray-400 with opacity */
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(
            107,
            114,
            128,
            0.7
          ); /* gray-500 with opacity */
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(75, 85, 99, 0.5); /* gray-600 with opacity */
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(55, 65, 81, 0.7); /* gray-700 with opacity */
        }
      `}</style>
    </div>
  );
}
