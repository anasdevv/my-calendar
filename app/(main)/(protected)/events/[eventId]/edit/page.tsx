import EventForm from '@/components/forms/EventForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getEventById } from '@/server/actions/event';
import { auth } from '@clerk/nextjs/server';
import invariant from 'tiny-invariant';

export default async function Page({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn();
  }
  const { eventId } = await params;
  invariant(eventId, 'Event ID is required');
  const event = await getEventById(Number(eventId), userId);
  if (!event) {
    return {
      notFound: true,
    };
  }
  return (
    <Card className="max-w-md mx-auto border-8 border-blue-200 shadow-2xl shadow-accent-foreground">
      <CardHeader>
        <CardTitle>Edit Event</CardTitle>
      </CardHeader>
      <CardContent>
        <EventForm
          event={{
            ...event,
            isActive: event.isActive ?? false,
          }}
        />
      </CardContent>
    </Card>
  );
}
