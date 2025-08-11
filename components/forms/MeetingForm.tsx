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
  Video,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useCallback, memo } from 'react';
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
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MeetingFormData, meetingFormSchema } from '@/validations/meeting';
import BookingLoading from '../BookingLoading';
import { createMeeting } from '@/server/actions/meeting';

// Pre-calculate timezone list to avoid recalculation
const TIMEZONE_LIST = Intl.supportedValuesOf('timeZone');

const eventConfig = {
  name: 'Meeting',
  duration: 30,
  color: '#7C3AED',
  description: 'Standard meeting session',
};

// Memoized timezone option component
const TimezoneOption = memo(
  ({ timezone, onClick }: { timezone: string; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 text-sm"
    >
      {timezone} ({formatTimezoneOffset(timezone)})
    </button>
  )
);

TimezoneOption.displayName = 'TimezoneOption';

// Memoized date button component
const DateButton = memo(
  ({ dateItem, onClick }: { dateItem: Date; onClick: () => void }) => (
    <Button
      variant="outline"
      onClick={onClick}
      className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-primary hover:text-white border-2 hover:border-primary"
    >
      <span className="text-xs font-medium">
        {dateItem.toLocaleDateString('en-US', { weekday: 'short' })}
      </span>
      <span className="text-lg font-bold">{dateItem.getDate()}</span>
      <span className="text-xs">
        {dateItem.toLocaleDateString('en-US', { month: 'short' })}
      </span>
    </Button>
  )
);

DateButton.displayName = 'DateButton';

// Memoized time button component
const TimeButton = memo(
  ({ time, onClick }: { time: Date; onClick: () => void }) => (
    <Button
      variant="outline"
      onClick={onClick}
      className="h-12 border-2 hover:bg-primary hover:text-white hover:border-primary"
    >
      <Clock className="w-4 h-4 mr-2" />
      {formatTimeString(time)}
    </Button>
  )
);

TimeButton.displayName = 'TimeButton';

interface MeetingFormProps {
  validTimeSlots: Date[];
  eventId: number;
  clerkUserId: string;
}

export default function MeetingForm({
  validTimeSlots,
  eventId,
  clerkUserId,
}: MeetingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<
    'date' | 'time' | 'details' | 'confirmation'
  >('date');
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);

  const form = useForm<MeetingFormData>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      guestName: '',
      guestEmail: '',
      guestNotes: '',
    },
  });

  // Get form values once to avoid multiple watches
  const formValues = form.getValues();
  const [currentTimezone, setCurrentTimezone] = useState(formValues.timezone);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    formValues.date
  );
  const [selectedTime, setSelectedTime] = useState<Date | undefined>(
    formValues.startTime
  );

  // Optimized timezone conversion with memoization
  const validTimeSlotsInTimezone = useMemo(() => {
    if (!currentTimezone || !validTimeSlots.length) return [];

    try {
      return validTimeSlots.map(date => toZonedTime(date, currentTimezone));
    } catch (error) {
      console.error('Error converting timezone:', error);
      return validTimeSlots; // fallback to original times
    }
  }, [validTimeSlots, currentTimezone]);

  // Memoized unique dates
  const uniqueDates = useMemo(() => {
    const seen = new Set<string>();
    return validTimeSlotsInTimezone.filter(dateItem => {
      const dateString = dateItem.toDateString();
      if (seen.has(dateString)) return false;
      seen.add(dateString);
      return true;
    });
  }, [validTimeSlotsInTimezone]);

  // Memoized time slots for selected date
  const availableTimes = useMemo(() => {
    if (!selectedDate) return [];
    return validTimeSlotsInTimezone.filter(time =>
      isSameDay(time, selectedDate)
    );
  }, [validTimeSlotsInTimezone, selectedDate]);

  // Optimized callbacks
  const handleTimezoneChange = useCallback(
    (timezone: string) => {
      setCurrentTimezone(timezone);
      form.setValue('timezone', timezone);
      setShowTimezoneDropdown(false);
    },
    [form]
  );

  const handleDateSelect = useCallback(
    (selectedDate: Date) => {
      setSelectedDate(selectedDate);
      form.setValue('date', selectedDate);
      setStep('time');
    },
    [form]
  );

  const handleTimeSelect = useCallback(
    (time: Date) => {
      setSelectedTime(time);
      form.setValue('startTime', time);
      setStep('details');
    },
    [form]
  );

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirmation');
  }, []);

  const onSubmit = useCallback(
    async (values: MeetingFormData) => {
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
    },
    [eventId, clerkUserId, form, router]
  );

  if (form.formState.isSubmitting) return <BookingLoading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Event Header */}
          <div className="text-center mb-8">
            <Link
              href={`/book/${clerkUserId}`}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Event Selection
            </Link>
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: eventConfig.color }}
              >
                <Video className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900">
                  {eventConfig.name}
                </h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {eventConfig.duration} min
                  </div>
                  <div className="flex items-center">
                    <Video className="w-4 h-4 mr-1" />
                    Video Call
                  </div>
                </div>
              </div>
            </div>
            <p className="text-gray-600">{eventConfig.description}</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 'date'
                    ? 'bg-primary text-white'
                    : step === 'time' ||
                        step === 'details' ||
                        step === 'confirmation'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                }`}
              >
                1
              </div>
              <div
                className={`w-16 h-0.5 ${
                  step === 'time' ||
                  step === 'details' ||
                  step === 'confirmation'
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`}
              />
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 'time'
                    ? 'bg-primary text-white'
                    : step === 'details' || step === 'confirmation'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                }`}
              >
                2
              </div>
              <div
                className={`w-16 h-0.5 ${
                  step === 'details' || step === 'confirmation'
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`}
              />
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 'details'
                    ? 'bg-primary text-white'
                    : step === 'confirmation'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                }`}
              >
                3
              </div>
            </div>
          </div>

          {/* Error Message */}
          {form.formState.errors.root && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              <span className="font-medium">
                {form.formState.errors.root.message}
              </span>
            </div>
          )}

          {step === 'date' && (
            <Card className="shadow-xl border-0">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  Select a Date
                </CardTitle>
                <p className="text-gray-600">
                  Choose from available dates below
                </p>
              </CardHeader>
              <CardContent>
                {/* Timezone Selector */}
                <div className="mb-8">
                  <Label className="flex items-center gap-2 text-base font-medium text-gray-700 mb-3">
                    <Globe className="w-5 h-5 text-gray-500" />
                    Timezone
                  </Label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setShowTimezoneDropdown(!showTimezoneDropdown)
                      }
                      className="w-full h-12 px-3 py-2 text-left border-2 rounded-lg bg-white flex items-center justify-between hover:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <span className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="truncate">
                          {currentTimezone} (
                          {formatTimezoneOffset(currentTimezone)})
                        </span>
                      </span>
                    </button>
                    {showTimezoneDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {TIMEZONE_LIST.slice(0, 50).map(timezone => (
                          <TimezoneOption
                            key={timezone}
                            timezone={timezone}
                            onClick={() => handleTimezoneChange(timezone)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Available Dates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-7 gap-3 max-w-3xl mx-auto">
                  {uniqueDates.map((dateItem, index) => (
                    <DateButton
                      key={`${dateItem.toISOString()}-${index}`}
                      dateItem={dateItem}
                      onClick={() => handleDateSelect(dateItem)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'time' && selectedDate && (
            <Card className="shadow-xl border-0">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  Select a Time
                </CardTitle>
                <Badge variant="outline" className="px-4 py-2">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {formatDate(selectedDate)}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
                  {availableTimes.map(time => (
                    <TimeButton
                      key={time.toISOString()}
                      time={time}
                      onClick={() => handleTimeSelect(time)}
                    />
                  ))}
                </div>
                <div className="flex justify-center mt-6">
                  <Button variant="ghost" onClick={() => setStep('date')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Date Selection
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'details' && (
            <Card className="shadow-xl border-0">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  Your Details
                </CardTitle>
                <div className="flex justify-center space-x-4">
                  <Badge variant="outline" className="px-4 py-2">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {selectedDate && formatDate(selectedDate)}
                  </Badge>
                  <Badge variant="outline" className="px-4 py-2">
                    <Clock className="w-4 h-4 mr-2" />
                    {selectedTime && formatTimeString(selectedTime)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleFormSubmit}
                  className="max-w-md mx-auto space-y-6"
                >
                  <div>
                    <Label htmlFor="name" className="flex items-center mb-2">
                      <User className="w-4 h-4 mr-2" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      required
                      {...form.register('guestName')}
                      className="h-12"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="flex items-center mb-2">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      {...form.register('guestEmail')}
                      className="h-12"
                      placeholder="Enter your email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message" className="flex items-center mb-2">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message (Optional)
                    </Label>
                    <Textarea
                      id="message"
                      {...form.register('guestNotes')}
                      className="min-h-24"
                      placeholder="Tell us what you'd like to discuss..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep('time')}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button type="submit" className="flex-1">
                      Confirm Booking
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 'confirmation' && (
            <Card className="shadow-xl border-0">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Meeting Confirmed!
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Your meeting has been successfully scheduled. You'll receive a
                  confirmation email shortly.
                </p>
                <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto mb-8">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Meeting Details
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {selectedDate && formatDate(selectedDate)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {selectedTime && formatTimeString(selectedTime)}
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {formValues.guestName}
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {formValues.guestEmail}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => {
                      setStep('date');
                      setSelectedDate(undefined);
                      setSelectedTime(undefined);
                      form.reset();
                    }}
                    variant="outline"
                  >
                    Book Another Meeting
                  </Button>
                  <Button onClick={() => onSubmit(form.getValues())}>
                    Confirm & Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
