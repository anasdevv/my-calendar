import EventFormSkeleton from '@/components/skeletons/EventFormSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section Skeleton */}
      <div className="mb-8">
        {/* Back link */}
        <div className="flex items-center mb-4">
          <Skeleton className="h-4 w-4 mr-2 rounded" /> {/* Icon */}
          <Skeleton className="h-4 w-32" /> {/* "Back to Events" */}
        </div>
        {/* Heading */}
        <Skeleton className="h-8 w-64 mb-2" /> {/* Title */}
        {/* Description */}
        <Skeleton className="h-4 w-80" />
      </div>

      <EventFormSkeleton />
    </div>
  );
}
