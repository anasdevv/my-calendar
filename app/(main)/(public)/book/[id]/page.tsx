import PublicProfile from '@/components/PublicProfile';
import { auth, currentUser } from '@clerk/nextjs/server';

export default async function BookingPage(params: Promise<{ id: string }>) {
  const { id } = await params;
  const user = await currentUser();
  return <PublicProfile fullName={user?.fullName} userId={id} events={[]} />;
}
