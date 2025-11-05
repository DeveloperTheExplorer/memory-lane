import Link from "next/link";
import { Calendar, Image, Plus } from "lucide-react";
import { useTimelinesWithMemoryCounts } from "@/hooks/use-timeline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { formatDateShort } from "@/lib/date-utils";

const TimelineCardSkeleton = () => {
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

const Home = () => {
  const { user } = useAuth();
  const { data: timelines, isLoading, error } = useTimelinesWithMemoryCounts();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Memory Lane</h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Your personal collection of timelines and cherished memories
          </p>
        </div>
        {user && (
          <Link href="/timeline/create" className="self-start sm:self-auto">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Create Timeline</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <TimelineCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              Failed to load timelines: {error.message}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && timelines && timelines.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No timelines yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              Get started by creating your first timeline to capture and organize your memories.
            </p>
            {user && (
              <Link href="/timeline/create">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Timeline
                </Button>
              </Link>
            )}
            {!user && (
              <Link href="/login">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Login to Create Timeline
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Timeline Cards */}
      {!isLoading && !error && timelines && timelines.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {timelines.map((timeline) => (
            <Link
              key={timeline.id}
              href={`/timeline/${timeline.slug}`}
              className="transition-transform hover:scale-[1.02]"
            >
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{timeline.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {timeline.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Image className="h-4 w-4" />
                      <span>
                        {timeline.memory_count} {timeline.memory_count === 1 ? 'memory' : 'memories'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDateShort(timeline.created_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;