'use client';

import { useState } from 'react';
import EventCard from '@/components/cards/EventCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarPlus, CalendarRange, Search } from 'lucide-react';
import Link from 'next/link';
import { EventRow } from '@/lib/types/event';
import { EventFormData } from '@/validations/events';

interface EventsClientProps {
  events: EventRow[];
}

export default function EventsClient({ events }: EventsClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && event.isActive) ||
      (filterStatus === 'draft' && !event.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <section className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <Button className=" text-white" asChild>
          <Link href="/events/new">
            <CalendarPlus className="mr-2" /> New Event
          </Link>
        </Button>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map(event => (
            <EventCard
              key={event.id}
              {...event}
              isActive={event?.isActive ?? false}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center text-center py-12">
          <CalendarRange className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No events found' : 'No event types yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first event type to start accepting bookings'}
          </p>
          {!searchTerm && (
            <Button
              className="bg-blue-500 hover:bg-blue-400 text-white"
              asChild
            >
              <Link href="/events/new">
                <CalendarPlus className="mr-2" /> Create Event Type
              </Link>
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
