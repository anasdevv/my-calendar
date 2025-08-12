import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, User, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { BookingRow, RecentBookingRow } from '@/lib/types/booking';

interface RecentBookingsProps {
  recentBookings: RecentBookingRow[];
}

export default function RecentBookings({
  recentBookings,
}: RecentBookingsProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'rescheduled':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      case 'rescheduled':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatBookingTime = (
    startTime: Date,
    endTime: Date,
    timezone: string
  ) => {
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);

      const timeString = `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
      const dateString = format(start, 'MMM dd, yyyy');

      return { timeString, dateString };
    } catch (error) {
      return { timeString: 'Invalid time', dateString: 'Invalid date' };
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!recentBookings?.length) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Recent Bookings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No recent bookings</p>
            <p className="text-sm text-gray-400">
              Your recent bookings will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Recent Bookings</span>
          <Badge variant="secondary" className="ml-2">
            {recentBookings.length}
          </Badge>
        </CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link
            href="/dashboard/bookings"
            className="flex items-center space-x-1"
          >
            <span>View All</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentBookings.slice(0, 5).map(booking => {
            const { timeString, dateString } = formatBookingTime(
              booking?.startTime ?? new Date(0),
              booking?.endTime ?? new Date(0),
              booking?.timezone ?? ''
            );

            return (
              <div
                key={booking.id}
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {getInitials(booking.attendeeName || 'Unknown')}
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          booking.status === 'confirmed'
                            ? 'bg-green-500'
                            : booking.status === 'cancelled'
                              ? 'bg-red-500'
                              : 'bg-yellow-500'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 truncate">
                          {booking.attendeeName || 'Unknown Attendee'}
                        </p>
                        <User className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-gray-600 truncate">
                          {booking.eventName}
                        </p>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{booking.duration}m</span>
                        </div>
                      </div>
                      {booking.attendeeEmail && (
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {booking.attendeeEmail}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-1 ml-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {dateString}
                    </p>
                    <p className="text-sm text-gray-600">{timeString}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={getStatusVariant(booking?.status as string)}
                      className="text-xs capitalize"
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </div>

                <div className="text-xs text-gray-400 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatDistanceToNow(
                    new Date(
                      booking?.updatedAt || (booking?.createdAt as Date)
                    ),
                    {
                      addSuffix: true,
                    }
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {recentBookings.length > 5 && (
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/bookings">
                +{recentBookings.length - 5} more bookings
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
