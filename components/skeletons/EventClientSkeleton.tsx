'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function EventsClientSkeleton() {
  return (
    <section className="flex flex-col gap-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Search bar */}
          <Skeleton className="h-10 w-64" />

          {/* Status dropdown */}
          <Skeleton className="h-10 w-32" />
        </div>

        {/* New Event button */}
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Events Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-4 shadow-sm">
            {/* Event title */}
            <Skeleton className="h-5 w-2/3" />

            {/* Event description */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />

            {/* Meta info */}
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
