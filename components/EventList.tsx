import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EventRow } from '@/lib/types/event';
import { Calendar, Settings } from 'lucide-react';
import Link from 'next/link';
export default function EventList({ events }: { events: EventRow[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Event Types</CardTitle>
        <Link href="/events">
          <Button variant="outline" size="sm">
            Manage All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map(event => (
            <div
              key={event.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{event.name}</p>
                  <p className="text-sm text-gray-600">
                    {event.duration} • {event.totalBookings} bookings
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={'default'}>active</Badge>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
