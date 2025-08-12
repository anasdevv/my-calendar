import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className || 'h-4 w-full'}`}
    />
  );
}

function SkeletonSwitchRow() {
  return (
    <div className="border rounded-lg p-4 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-6 bg-gray-200 rounded-full" />
          <SkeletonLine className="h-4 w-20" />
        </div>
        <SkeletonLine className="h-5 w-24" />
      </div>
      <div className="space-y-2 ml-8">
        <SkeletonLine className="h-8 w-28" />
        <div className="flex gap-2 items-center">
          <SkeletonLine className="h-8 w-24" />
          <SkeletonLine className="h-4 w-6" />
          <SkeletonLine className="h-8 w-24" />
          <SkeletonLine className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function SkeletonOverrideRow() {
  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
      <SkeletonLine className="h-9 w-40" />
      <SkeletonLine className="h-9 w-32" />
      <SkeletonLine className="h-9 flex-1" />
      <SkeletonLine className="h-8 w-8 rounded-full" />
    </div>
  );
}

export default function ScheduleLoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Timezone */}
      <Card>
        <CardHeader>
          <SkeletonLine className="h-6 w-32" />
        </CardHeader>
        <CardContent className="lg:w-1/3 w-full">
          <SkeletonLine className="h-4 w-16 mb-2" />
          <SkeletonLine className="h-9 w-full" />
        </CardContent>
      </Card>

      {/* Weekly Hours */}
      <Card>
        <CardHeader>
          <SkeletonLine className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonSwitchRow key={i} />
          ))}
        </CardContent>
      </Card>

      {/* Date Overrides */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <SkeletonLine className="h-6 w-32" />
          <SkeletonLine className="h-8 w-28" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonOverrideRow key={i} />
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <SkeletonLine className="h-10 w-40" />
      </div>
    </div>
  );
}
