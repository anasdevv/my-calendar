import RecentBookings from '@/components/RecentBookings';
import { getRecentBookings } from '@/server/actions/meeting';
import { currentUser } from '@clerk/nextjs/server';

export default async function RecentBookingsList() {
  const user = await currentUser();
  const recentBookings = await getRecentBookings(user?.id as string);
  return <RecentBookings recentBookings={recentBookings} />;
}
