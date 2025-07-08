import { Card, CardContent, CardHeader } from '@/components/ui/card';

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className || 'h-4 w-full'}`}
    />
  );
}

function SkeletonAvailabilityItem() {
  return (
    <div className="flex flex-col space-y-3 p-4 border rounded-lg">
      {/* Day selector skeleton */}
      <div className="flex items-center space-x-3">
        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
        <SkeletonLine className="h-4 w-20" />
      </div>

      {/* Time inputs skeleton */}
      <div className="flex space-x-3">
        <div className="flex-1">
          <SkeletonLine className="h-3 w-16 mb-2" />
          <SkeletonLine className="h-9 w-full" />
        </div>
        <div className="flex-1">
          <SkeletonLine className="h-3 w-16 mb-2" />
          <SkeletonLine className="h-9 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function ScheduleLoadingSkeleton() {
  return (
    <Card className="max-w-md mx-auto border-8 border-blue-200 shadow-2xl shadow-accent-foreground">
      <CardHeader>
        {/* Title skeleton */}
        <SkeletonLine className="h-6 w-24" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Timezone selector skeleton */}
          <div className="space-y-2">
            <SkeletonLine className="h-4 w-16" />
            <SkeletonLine className="h-9 w-full" />
          </div>

          {/* Availability section skeleton */}
          <div className="space-y-4">
            <SkeletonLine className="h-5 w-32" />

            {/* Multiple availability items */}
            <SkeletonAvailabilityItem />
            <SkeletonAvailabilityItem />
            <SkeletonAvailabilityItem />

            {/* Add button skeleton */}
            <SkeletonLine className="h-9 w-full" />
          </div>

          {/* Save button skeleton */}
          <SkeletonLine className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
