import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/formatters';
import { getEventById } from '@/server/actions/event';
import { clerkClient } from '@clerk/nextjs/server';
import { AlertTriangle, CheckCircle2, Clock, Video } from 'lucide-react';

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; eventId: string }>;
  searchParams: Promise<{ startTime: string }>;
}) {
  const { id, eventId } = await params;
  const { startTime } = await searchParams;
  const event = await getEventById(Number(eventId), id);

  if (!event) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center gap-2 text-sm max-w-md mx-auto mt-6">
        <AlertTriangle className="w-5 h-5" />
        <span>This event doesn't exist anymore.</span>
      </div>
    );
  }

  const client = await clerkClient();
  const calendarUser = await client.users.getUser(id);
  const startTimeDate = new Date(startTime);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-20 h-20 text-green-500 animate-in fade-in zoom-in duration-700" />
        </div>

        {/* Success Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Your meeting is booked!
        </h1>
        <p className="text-gray-600 mb-8">
          ✅ Successfully booked{' '}
          <span className="font-semibold">{event.name}</span> with{' '}
          <span className="font-semibold">{calendarUser.fullName}</span>.
        </p>

        {/* Event Details Card */}
        <Card className="shadow-lg border-2 border-green-100">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">
              {event.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-2 text-green-500" />
              {formatDateTime(startTimeDate)}
            </div>
            <div className="flex items-center text-gray-600">
              <Video className="w-5 h-5 mr-2 text-green-500" />
              {'Video Call'}
            </div>
          </CardContent>
        </Card>

        {/* Confirmation message */}
        <p className="mt-6 text-gray-600">
          A confirmation email has been sent with your meeting details. You can
          safely close this page.
        </p>
      </div>
    </div>
  );
}
