import PublicProfile from '@/components/PublicProfile';
import { getAllEvents } from '@/server/actions/event';
import { currentUser } from '@clerk/nextjs/server';

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await currentUser();
  const events = await getAllEvents(id);
  return (
    <PublicProfile
      fullName={user?.fullName ?? ''}
      userId={id}
      events={events}
    />
  );
}
