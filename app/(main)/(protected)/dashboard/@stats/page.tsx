import { StatsCard } from '@/components/cards/StatsCard';
import { getUserStats } from '@/server/actions/user';
import { currentUser } from '@clerk/nextjs/server';
import { BarChart3, Calendar, Clock, Users } from 'lucide-react';

export default async function Stats() {
  const user = await currentUser();
  const { totalBookings, totalHours, weeklyBookings, activeEvents } =
    await getUserStats(user?.id as string);
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatsCard
        description=""
        title="Total Bookings"
        value={totalBookings}
        icon={Calendar}
      />
      <StatsCard
        title="This Week"
        description="Upcoming meetings"
        value={weeklyBookings}
        icon={Clock}
      />
      <StatsCard
        icon={Users}
        description="Event types available"
        title="Active Events"
        value={activeEvents as number}
      />
      <StatsCard
        icon={BarChart3}
        description="Hour's scheduled"
        title="Total Hours"
        value={totalHours}
      />
    </div>
  );
}
