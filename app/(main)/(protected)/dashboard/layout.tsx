import DashboardQuickActions from '@/components/DashboardQuickActions';
import { ReactNode } from 'react';

export default function Layout({
  children,
  stats,
  recentBookings,
  activeEvents,
}: {
  children: ReactNode;
  stats: ReactNode;
  recentBookings: ReactNode;
  activeEvents?: ReactNode;
}) {
  return (
    <div className="container mx-auto">
      {stats}
      {children}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {recentBookings}
        {activeEvents}
      </div>
    </div>
  );
}
