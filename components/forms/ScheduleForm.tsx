'use client';

import { DAYS_OF_WEEK } from '@/constants';
import { timeToFloat } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Virtuoso } from 'react-virtuoso';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { extractTimeFromISO, formatTimezoneOffset } from '@/lib/formatters';
import { Fragment, useState } from 'react';
import { Plus, X, Clock, Calendar, Trash2 } from 'lucide-react';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { ScheduleFormData, scheduleFormSchema } from '@/validations/schedule';
import { saveUserSchedule } from '@/server/actions/schedule';

const daysOfWeekDisplay = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

type Availability = {
  startTime: string;
  endTime: string;
  dayOfWeek: (typeof DAYS_OF_WEEK)[number];
};

export function ScheduleForm({
  schedule,
}: {
  schedule?: {
    timezone: string;
    availabilities: Availability[];
  };
}) {
  // Buffer time state
  const [bufferTime, setBufferTime] = useState({
    before: '15',
    after: '15',
  });

  // Date overrides state
  const [dateOverrides, setDateOverrides] = useState([
    { date: '2024-12-25', available: false, reason: 'Christmas Day' },
    { date: '2024-12-31', available: false, reason: "New Year's Eve" },
  ]);

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      timezone:
        schedule?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      availabilities:
        schedule?.availabilities
          ?.map(availability => ({
            ...availability,
            startTime: extractTimeFromISO(availability.startTime),
            endTime: extractTimeFromISO(availability.endTime),
          }))
          .toSorted((a, b) => {
            return timeToFloat(a.startTime) - timeToFloat(b.startTime);
          }) ?? [],
    },
  });

  const {
    append: addAvailability,
    remove: removeAvailability,
    fields: availabilityFields,
  } = useFieldArray({ name: 'availabilities', control: form.control });

  const groupedAvailabilityFields = Object.groupBy(
    availabilityFields.map((field, index) => ({ ...field, index })),
    availability => availability.dayOfWeek
  );

  const isDayEnabled = (day: string) => {
    const dayKey = day.toLowerCase() as (typeof DAYS_OF_WEEK)[number];
    return (groupedAvailabilityFields[dayKey]?.length ?? 0) > 0;
  };

  const toggleDay = (day: string, enabled: boolean) => {
    const dayKey = day.toLowerCase() as (typeof DAYS_OF_WEEK)[number];
    const dayAvailabilities = groupedAvailabilityFields[dayKey] || [];

    if (!enabled) {
      dayAvailabilities.forEach((field: (typeof dayAvailabilities)[number]) => {
        removeAvailability(field.index);
      });
    } else {
      addAvailability({
        dayOfWeek: dayKey,
        startTime: '9:00',
        endTime: '17:00',
      });
    }
  };

  const addDateOverride = () => {
    const newOverride = {
      date: '',
      available: false,
      reason: '',
    };
    setDateOverrides([...dateOverrides, newOverride]);
  };

  const updateDateOverride = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    const updated = dateOverrides.map((override, i) =>
      i === index ? { ...override, [field]: value } : override
    );
    setDateOverrides(updated);
  };

  const removeDateOverride = (index: number) => {
    setDateOverrides(dateOverrides.filter((_, i) => i !== index));
  };

  async function onSubmit(values: ScheduleFormData) {
    try {
      await saveUserSchedule(values);
      toast('Schedule saved successfully.', {
        duration: 5000,
        className:
          '!rounded-3xl !py-8 !px-5 !justify-center !text-green-400 !font-black',
      });
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      form.setError('root', {
        message: `There was an error saving your schedule: ${error.message}`,
      });
    }
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <div className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
          {form.formState.errors.root && (
            <div className="text-destructive text-sm p-4 bg-destructive/10 rounded-lg mb-6">
              {form.formState.errors.root.message}
            </div>
          )}

          {/* Timezone Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Timezone</CardTitle>
            </CardHeader>
            <CardContent className="lg:w-1/3   w-full">
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue asChild>
                            <span>
                              {field.value
                                ? `${field.value} (${formatTimezoneOffset(field.value)})`
                                : 'Select a timezone'}
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent
                        className="w-full"
                        style={{
                          minWidth: 'var(--radix-select-trigger-width)',
                        }}
                      >
                        <Virtuoso
                          style={{
                            height: '300px',
                            width: '100%',
                            overflowX: 'hidden',
                          }}
                          totalCount={Intl.supportedValuesOf('timeZone').length}
                          itemContent={index => {
                            const option =
                              Intl.supportedValuesOf('timeZone')[index];
                            return (
                              <div style={{ width: '100%' }}>
                                <SelectItem key={option} value={option}>
                                  {option} ({formatTimezoneOffset(option)})
                                </SelectItem>
                              </div>
                            );
                          }}
                        />
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Weekly Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Weekly Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {daysOfWeekDisplay.map(day => {
                const dayKey =
                  day.toLowerCase() as (typeof DAYS_OF_WEEK)[number];
                const dayAvailabilities =
                  groupedAvailabilityFields[dayKey] || [];
                const enabled = isDayEnabled(day);

                return (
                  <div key={day} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Switch
                          checked={enabled}
                          onCheckedChange={checked => toggleDay(day, checked)}
                        />
                        <Label className="w-20 font-medium">{day}</Label>
                      </div>

                      {!enabled && (
                        <Badge variant="secondary">Unavailable</Badge>
                      )}
                    </div>

                    {enabled && (
                      <div className="space-y-2 ml-8">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            addAvailability({
                              dayOfWeek: dayKey,
                              startTime: '9:00',
                              endTime: '17:00',
                            });
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Time Slot
                        </Button>

                        {dayAvailabilities.map(
                          (
                            field: (typeof dayAvailabilities)[number],
                            labelIndex: number
                          ) => (
                            <div className="space-y-2" key={field.id}>
                              <div className="flex gap-2 items-center">
                                <FormField
                                  control={form.control}
                                  name={`availabilities.${field.index}.startTime`}
                                  render={({ field: timeField }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          className="w-24"
                                          aria-label={`${day} Start Time ${labelIndex + 1}`}
                                          {...timeField}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <span className="text-gray-500">to</span>
                                <FormField
                                  control={form.control}
                                  name={`availabilities.${field.index}.endTime`}
                                  render={({ field: timeField }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          className="w-24"
                                          aria-label={`${day} End Time ${labelIndex + 1}`}
                                          {...timeField}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  // className="ml-auto"
                                  onClick={() =>
                                    removeAvailability(field.index)
                                  }
                                >
                                  <Trash2 className="w-4 h-4" />
                                  {/* <X className="w-4 h-4" /> */}
                                </Button>
                              </div>

                              <div className="ml-2">
                                <FormMessage>
                                  {
                                    form.formState.errors.availabilities?.at?.(
                                      field.index
                                    )?.root?.message
                                  }
                                </FormMessage>
                                <FormMessage>
                                  {
                                    form.formState.errors.availabilities?.at?.(
                                      field.index
                                    )?.startTime?.message
                                  }
                                </FormMessage>
                                <FormMessage>
                                  {
                                    form.formState.errors.availabilities?.at?.(
                                      field.index
                                    )?.endTime?.message
                                  }
                                </FormMessage>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Buffer Time */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Buffer Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="buffer-before">Buffer before meetings</Label>
                  <Select
                    value={bufferTime.before}
                    onValueChange={value =>
                      setBufferTime({ ...bufferTime, before: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No buffer</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="buffer-after">Buffer after meetings</Label>
                  <Select
                    value={bufferTime.after}
                    onValueChange={value =>
                      setBufferTime({ ...bufferTime, after: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No buffer</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* Date Overrides */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Date Overrides</CardTitle>
              <Button onClick={addDateOverride} size="sm" type="button">
                <Plus className="w-4 h-4 mr-2" />
                Add Override
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dateOverrides.map((override, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 border rounded-lg"
                  >
                    <Input
                      type="date"
                      value={override.date}
                      onChange={e =>
                        updateDateOverride(index, 'date', e.target.value)
                      }
                      className="w-40"
                    />

                    <Select
                      value={override.available.toString()}
                      onValueChange={value =>
                        updateDateOverride(index, 'available', value === 'true')
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Unavailable</SelectItem>
                        <SelectItem value="true">Available</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Reason (optional)"
                      value={override.reason}
                      onChange={e =>
                        updateDateOverride(index, 'reason', e.target.value)
                      }
                      className="flex-1"
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDateOverride(index)}
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {dateOverrides.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No date overrides configured. Add specific dates when you're
                    unavailable.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              size="lg"
              disabled={form.formState.isSubmitting}
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
            >
              Save Schedule
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
