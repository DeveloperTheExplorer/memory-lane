import { memo } from 'react';
import { Card, CardContent, CardHeader } from './card';
import { Skeleton } from './skeleton';
import { SidebarMenu, SidebarMenuItem } from './sidebar';

/**
 * Skeleton loader for timeline cards on the home page
 */
const TimelineCardSkeletonComponent = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );
};

TimelineCardSkeletonComponent.displayName = 'TimelineCardSkeleton';

export const TimelineCardSkeleton = memo(TimelineCardSkeletonComponent);

/**
 * Skeleton loader for memory cards in timeline view
 */
const MemoryCardSkeletonComponent = ({ isFirst, isLast }: { isFirst?: boolean; isLast?: boolean }) => {
  return (
    <div className="relative flex gap-6 pb-8">
      {/* Timeline Line and Dot */}
      <div className="relative flex flex-col items-center">
        <Skeleton className={`w-4 h-4 rounded-full ${isFirst ? 'mt-2' : ''}`} />
        {!isLast && <div className="w-0.5 flex-1 bg-border mt-2" />}
      </div>

      {/* Memory Card Skeleton */}
      <Card className="flex-1">
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-3" />
          <Skeleton className="h-4 w-40" />
        </CardHeader>

        <CardContent className="space-y-4">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

MemoryCardSkeletonComponent.displayName = 'MemoryCardSkeleton';

export const MemoryCardSkeleton = memo(MemoryCardSkeletonComponent);

/**
 * Skeleton loader for sidebar timeline list
 */
const SidebarSkeletonComponent = () => {
  return (
    <SidebarMenu className="gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <SidebarMenuItem key={i}>
          <div className="px-2 py-1.5">
            <Skeleton className="h-5 w-32 mb-2" />
            <div className="ml-4 space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};

SidebarSkeletonComponent.displayName = 'SidebarSkeleton';

export const SidebarSkeleton = memo(SidebarSkeletonComponent);

