import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Settings,
  Eye,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import DashboardQuickActions from '@/components/DashboardQuickActions';

const recentBookings = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    event: '30 Min Meeting',
    date: 'Today',
    time: '2:00 PM',
    status: 'confirmed',
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael@example.com',
    event: 'Discovery Call',
    date: 'Tomorrow',
    time: '10:30 AM',
    status: 'confirmed',
  },
  {
    id: 3,
    name: 'Emily Davis',
    email: 'emily@example.com',
    event: '30 Min Meeting',
    date: 'Dec 20',
    time: '3:00 PM',
    status: 'pending',
  },
];

const events = [
  {
    id: 1,
    name: '30 Min Meeting',
    duration: '30 min',
    bookings: 12,
    status: 'active',
  },
  {
    id: 2,
    name: 'Discovery Call',
    duration: '45 min',
    bookings: 8,
    status: 'active',
  },
  {
    id: 3,
    name: 'Strategy Session',
    duration: '60 min',
    bookings: 3,
    status: 'draft',
  },
];

export default function Dashboard() {
  return (
    <DashboardQuickActions />
    // <>
    //   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"></div>
    // </>
  );
}
