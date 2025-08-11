import EventList from '@/components/EventList';
import { getMostBookedEvents } from '@/server/actions/event';
import { auth } from '@clerk/nextjs/server';

export default async function ActiveEvents() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) throw redirectToSignIn();
  const events = await getMostBookedEvents(userId);
  return <EventList events={events} />;
}
