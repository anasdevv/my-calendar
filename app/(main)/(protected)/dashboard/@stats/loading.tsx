import { StatsCardSkeleton } from '@/components/cards/StatsCard';

export default function Loading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: 4 }).map((_, index) => (
        <StatsCardSkeleton />
      ))}
    </div>
  );
}
