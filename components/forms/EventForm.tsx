'use client';

import { EventFormData, eventFormSchema } from '@/validations/events';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useTransition } from 'react';
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
import { createEvent, deleteEvent, updateEvent } from '@/server/actions/event';
import { useServerActionHandler } from '@/lib/hooks/useServerActionHandler';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const colorOptions = [
  { value: '#7C3AED', name: 'Purple' },
  { value: '#059669', name: 'Green' },
  { value: '#DC2626', name: 'Red' },
  { value: '#F59E0B', name: 'Orange' },
  { value: '#3B82F6', name: 'Blue' },
  { value: '#EF4444', name: 'Pink' },
];

const bufferOptions = [
  { value: 0, label: 'No buffer' },
  { value: 5, label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
];

export default function EventForm({ event }: { event?: EventFormData }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: event?.name ?? '',
      description: event?.description ?? '',
      duration: event?.duration ?? 30,
      color: event?.color ?? '#7C3AED',
      bufferBefore: event?.bufferBefore ?? 15,
      bufferAfter: event?.bufferAfter ?? 15,
      allowInviteeCancel: event?.allowInviteeCancel ?? true,
      allowInviteeReschedule: event?.allowInviteeReschedule ?? true,
      requireConfirmation: event?.requireConfirmation ?? false,
      isActive: event?.isActive ?? true,
      id: event?.id,
      maxAdvanceBooking: event?.maxAdvanceBooking ?? 30,
      minAdvanceBooking: event?.minAdvanceBooking ?? 0,
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
              <FormLabel>Duration (minutes)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
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

        {/* Color Selection */}
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <div className="flex space-x-3 mt-2">
                {colorOptions.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => field.onChange(color.value)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      field.value === color.value
                        ? 'border-gray-900 scale-110'
                        : 'border-gray-200'
                    } transition-all`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between gap-x-8">
          {/* Buffer Before */}
          <FormField
            control={form.control}
            name="bufferBefore"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Buffer before meeting</FormLabel>
                <Select
                  onValueChange={val => field.onChange(Number(val))}
                  value={String(field.value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bufferOptions.map(opt => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Buffer After */}
          <FormField
            control={form.control}
            name="bufferAfter"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Buffer after meeting</FormLabel>
                <Select
                  onValueChange={val => field.onChange(Number(val))}
                  value={String(field.value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bufferOptions.map(opt => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* ss */}
        <div className="flex items-center justify-between gap-x-8">
          {/* Buffer Before */}
          <FormField
            control={form.control}
            name="maxAdvanceBooking"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Maximum advance booking</FormLabel>
                <Select
                  onValueChange={val => field.onChange(Number(val))}
                  value={String(field.value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">1 week</SelectItem>
                    <SelectItem value="14">2 weeks</SelectItem>
                    <SelectItem value="30">1 month</SelectItem>
                    <SelectItem value="60">2 months</SelectItem>
                    <SelectItem value="90">3 months</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Buffer After */}
          <FormField
            control={form.control}
            name="minAdvanceBooking"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Minimum advance booking</FormLabel>
                <Select
                  onValueChange={val => field.onChange(Number(val))}
                  value={String(field.value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                    <SelectItem value="24">1 day</SelectItem>
                    <SelectItem value="48">2 days</SelectItem>
                    <SelectItem value="168">1 week</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Switches */}
        <FormField
          control={form.control}
          name="allowInviteeCancel"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <div>
                  <FormLabel>Allow invitees to cancel</FormLabel>
                  <FormDescription>
                    Let invitees cancel their bookings
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="allowInviteeReschedule"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <div>
                  <FormLabel>Allow invitees to reschedule</FormLabel>
                  <FormDescription>
                    Let invitees reschedule their bookings
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requireConfirmation"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <div>
                  <FormLabel>Require confirmation</FormLabel>
                  <FormDescription>
                    Manually approve each booking
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </div>
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

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" type="button" disabled={isPending} asChild>
            <Link href="/events">Cancel</Link>
          </Button>
          <Button
            className="cursor-pointer hover:scale-105  text-white font-bold py-2 px-4 border shadow-2xl"
            type="submit"
            disabled={isPending}
          >
            {isPending ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// 'use client';

// import { EventFormData, eventFormSchema } from '@/validations/events';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useTransition } from 'react';
// import { useRouter } from 'next/navigation';
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '../ui/form';
// import { Input } from '../ui/input';
// import { Textarea } from '../ui/textarea';
// import { Switch } from '../ui/switch';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTrigger,
// } from '../ui/alert-dialog';
// import { Button } from '../ui/button';
// import { Alert, AlertDescription } from '../ui/alert';
// import { AlertDialogTitle } from '@radix-ui/react-alert-dialog';
// import Link from 'next/link';
// import { createEvent, deleteEvent, updateEvent } from '@/server/actions/event';
// import { useServerActionHandler } from '@/lib/hooks/useServerActionHandler';

// export default function EventForm({ event }: { event?: EventFormData }) {
//   const [isPending, startTransition] = useTransition();
//   const [isDeleting, startDeleteTransition] = useTransition();
//   const router = useRouter();

//   const form = useForm<EventFormData>({
//     resolver: zodResolver(eventFormSchema),
//     defaultValues: {
//       name: event?.name ?? '',
//       description: event?.description ?? '',
//       duration: event?.duration ?? 30,
//       isActive: event?.isActive ?? true,
//       id: event?.id ?? undefined,
//     },
//   });

//   const { handleServerActionResult, clearFormErrors } =
//     useServerActionHandler(form);

//   const onSubmit = (data: EventFormData) => {
//     clearFormErrors();

//     startTransition(async () => {
//       try {
//         const result = event?.id
//           ? await updateEvent(event.id as number, data)
//           : await createEvent(data);

//         if (handleServerActionResult(result)) {
//           // Success! Navigate to events page
//           router.push('/events');
//         }
//       } catch (error) {
//         console.error('Unexpected error submitting event:', error);
//         form.setError('root', {
//           message: 'An unexpected error occurred. Please try again.',
//         });
//       }
//     });
//   };

//   const handleDelete = () => {
//     if (!event?.id) return;

//     startDeleteTransition(async () => {
//       try {
//         const result = await deleteEvent(event.id as number);

//         if (handleServerActionResult(result)) {
//           // Success! Navigate to events page
//           router.push('/events');
//         }
//       } catch (error) {
//         console.error('Unexpected error deleting event:', error);
//         form.setError('root', {
//           message:
//             'An unexpected error occurred while deleting. Please try again.',
//         });
//       }
//     });
//   };
//   return (
//     <Form {...form}>
//       <form
//         onSubmit={form.handleSubmit(onSubmit)}
//         className="flex gap-6 flex-col"
//       >
//         {form.formState.errors.root && (
//           <Alert variant="destructive">
//             <AlertDescription>
//               {form.formState.errors.root.message}
//             </AlertDescription>
//           </Alert>
//         )}
//         <FormField
//           control={form.control}
//           name="name"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Event Name</FormLabel>
//               <FormControl>
//                 <Input {...field} />
//               </FormControl>
//               <FormDescription>
//                 The name users will see when booking
//               </FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name="duration"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Duration</FormLabel>
//               <FormControl>
//                 <Input type="number" {...field} />
//               </FormControl>
//               <FormDescription>in minutes</FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name="description"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Description</FormLabel>
//               <FormControl>
//                 <Textarea className="resize-none h-32" {...field} />
//               </FormControl>
//               <FormDescription>
//                 A brief description of your event
//               </FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name="isActive"
//           render={({ field }) => (
//             <FormItem>
//               <div className="flex cursor-pointer items-center gap-2">
//                 <FormControl>
//                   <Switch
//                     checked={field.value}
//                     onCheckedChange={field.onChange}
//                   />
//                 </FormControl>
//                 <FormLabel>Active</FormLabel>
//               </div>
//               <FormDescription>
//                 Inactive events will not be shown to users
//               </FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <div className="flex gap-2 justify-end">
//           {event && (
//             <AlertDialog>
//               <AlertDialogTrigger asChild>
//                 <Button
//                   className="hover:scale-105"
//                   variant="destructive"
//                   disabled={isPending || isDeleting}
//                 >
//                   {isDeleting ? 'Deleting...' : 'Delete'}
//                 </Button>
//               </AlertDialogTrigger>
//               <AlertDialogContent>
//                 <AlertDialogHeader>
//                   <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//                   <AlertDialogDescription>
//                     This action cannot be undone. This will permanently delete
//                     this event and all its associated bookings.
//                   </AlertDialogDescription>
//                 </AlertDialogHeader>
//                 <AlertDialogFooter>
//                   <AlertDialogCancel disabled={isDeleting}>
//                     Cancel
//                   </AlertDialogCancel>
//                   <AlertDialogAction
//                     disabled={isDeleting}
//                     onClick={handleDelete}
//                   >
//                     {isDeleting ? 'Deleting...' : 'Delete'}
//                   </AlertDialogAction>
//                 </AlertDialogFooter>
//               </AlertDialogContent>
//             </AlertDialog>
//           )}
//           <Button
//             variant="outline"
//             type="button"
//             disabled={isPending || isDeleting}
//             asChild
//           >
//             <Link href="/events">Cancel</Link>
//           </Button>
//           <Button
//             className="cursor-pointer hover:scale-105 bg-blue-400 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 shadow-2xl"
//             type="submit"
//             disabled={isPending || isDeleting}
//           >
//             {isPending ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
//           </Button>
//         </div>
//       </form>
//     </Form>
//   );
// }
