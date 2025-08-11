import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Eye, Plus } from 'lucide-react';
import Link from 'next/link';
export default function DashboardQuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Link href="/events/new">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-dashed border-2 border-gray-300 hover:border-primary">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Plus className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Create New Event
            </h3>
            <p className="text-sm text-gray-600">
              Set up a new meeting type for bookings
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/schedule">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-12 w-12 text-primary mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Manage Schedule
            </h3>
            <p className="text-sm text-gray-600">
              Set your availability and working hours
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/book">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Eye className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Preview Booking
            </h3>
            <p className="text-sm text-gray-600">
              See how your booking page looks
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
