'use client';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import Link from 'next/link';
import { EventFormData } from '@/validations/events';
import { formatEventDescription } from '@/lib/formatters';
import { CopyEventButton } from '../CopyEventButton';
import { Badge } from '../ui/badge';
import {
  Clock,
  Users,
  Settings,
  Copy,
  Eye,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { EventRow } from '@/lib/types/event';
import { useState, useTransition } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { deleteEvent } from '@/server/actions/event';

type EventCardProps = EventRow;

export default function EventCard({
  id,
  isActive,
  name,
  description,
  duration,
  clerkUserId,
  totalBookings = 0,
  lastBooked,
  color,
  ...res
}: EventCardProps) {
  const router = useRouter();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const copyEventUrl = () => {
    navigator.clipboard.writeText(`${window.location.origin}/book/${id}`);
  };
  const formatLastBooked = lastBooked
    ? new Date(lastBooked).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;
  const handleDelete = () => {
    if (!selectedEvent) return;
    startDeleteTransition(async () => {
      try {
        const result = await deleteEvent(selectedEvent);
        if (result) {
          router.refresh();
          setSelectedEvent(null);
        } else {
          console.error('Failed to delete event');
          throw new Error('Failed to delete event');
        }
      } catch (error) {
        // todo add toast notification
        setSelectedEvent(null);
        console.error('Unexpected error deleting event:', error);
      }
    });
  };

  return (
    <>
      <Card
        className={cn(
          'hover:shadow-lg transition-shadow flex flex-col',
          !isActive && 'bg-accent'
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {/* Status dot */}
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: isActive && color ? color : '#D1D5DB',
                }}
              />
              <div>
                <CardTitle className="text-lg">{name}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {description || formatEventDescription(duration)}
                </p>
              </div>
            </div>

            {/* Dropdown menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={copyEventUrl}>
                  <Copy className="w-4 h-4 mr-2" /> Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/book/${clerkUserId}/${id}`}>
                    <Eye className="w-4 h-4 mr-2" /> Preview
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`/events/${id}/edit`)}
                >
                  <Settings className="w-4 h-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => setSelectedEvent(id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 flex-grow">
          {/* Metadata row */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" /> {duration} min
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" /> {totalBookings} bookings
              </div>
            </div>
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? 'active' : 'draft'}
            </Badge>
          </div>

          {/* Last booked */}
          {formatLastBooked && (
            <div className="text-xs text-gray-500">
              Last booked: {formatLastBooked}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex space-x-2 mt-auto">
            {isActive && (
              <CopyEventButton
                variant="outline"
                eventId={id as unknown as number}
                clerkUserId={clerkUserId}
              />
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/book/${clerkUserId}/${id}`}>
                <Eye className="w-4 h-4 mr-2" /> Preview
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/events/${id}/edit`)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      {selectedEvent && (
        <AlertDialog
          open={Boolean(selectedEvent)}
          onOpenChange={() => setSelectedEvent(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this
                event and all its associated bookings.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction disabled={isDeleting} onClick={handleDelete}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
