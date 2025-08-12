'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function EventCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Status dot */}
            <Skeleton className="w-4 h-4 rounded-full" />

            {/* Title + description */}
            <div>
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>

          {/* Dropdown trigger */}
          <Skeleton className="w-6 h-6 rounded" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 flex-grow">
        {/* Metadata row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" /> {/* Badge */}
        </div>

        {/* Last booked */}
        <Skeleton className="h-3 w-32" />

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
