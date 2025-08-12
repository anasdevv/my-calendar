import { EventCardSkeleton } from './EventCardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function EventsClientSkeleton() {
  return (
    <section className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-64" /> {/* Search */}
          <Skeleton className="h-10 w-32" /> {/* Dropdown */}
        </div>
        <Skeleton className="h-10 w-36" /> {/* New Event Button */}
      </div>

      {/* Event cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
