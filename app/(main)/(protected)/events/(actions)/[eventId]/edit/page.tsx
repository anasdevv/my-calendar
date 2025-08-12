import EventForm from '@/components/forms/EventForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getEventById } from '@/server/actions/event';
import { EventFormData } from '@/validations/events';
import { auth } from '@clerk/nextjs/server';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
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
  return <EventForm event={event as EventFormData} />;
}
