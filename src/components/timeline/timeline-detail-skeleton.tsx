import { Skeleton } from "@/components/ui/skeleton";
import { MemoryCardSkeleton } from "@/components/memory/memory-card";

export const TimelineDetailSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-5 w-20 mb-6" />
        <Skeleton className="h-10 w-3/4 mb-3" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-2/3" />
        <div className="flex items-center gap-6 mt-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Memories Skeleton */}
      <div className="mt-12">
        <Skeleton className="h-8 w-48 mb-8" />
        {Array.from({ length: 3 }).map((_, i) => (
          <MemoryCardSkeleton key={i} isFirst={i === 0} isLast={i === 2} />
        ))}
      </div>
    </div>
  );
};

