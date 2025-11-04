import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeft, Calendar, Image as ImageIcon, Plus } from "lucide-react";
import { useTimelineBySlug } from "@/hooks/use-timeline";
import { useMemoriesByTimeline } from "@/hooks/use-memory";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MemoryCard, MemoryCardSkeleton } from "@/components/memory-card";
import { CreateMemoryForm } from "@/components/create-memory-form";
import { useAuth } from "@/contexts/auth-context";

const TimelineDetailSkeleton = () => {

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

export default function TimelineDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { slug } = router.query;
  const [createMemoryOpen, setCreateMemoryOpen] = useState(false);

  // Fetch timeline by slug
  const {
    data: timeline,
    isLoading: timelineLoading,
    error: timelineError,
  } = useTimelineBySlug(slug as string);

  // Fetch memories for this timeline (only when timeline is loaded)
  const {
    data: memories,
    isLoading: memoriesLoading,
    error: memoriesError,
  } = useMemoriesByTimeline(timeline?.id || "", { limit: 100 }, !!timeline?.id);

  // Loading state
  if (!slug || timelineLoading || (memoriesLoading && timeline)) {
    return <TimelineDetailSkeleton />;
  }

  // Error state
  if (timelineError || memoriesError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              {timelineError?.message || memoriesError?.message || "Failed to load timeline"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not found state
  if (!timeline) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h3 className="text-xl font-semibold mb-2">Timeline not found</h3>
            <p className="text-muted-foreground text-center mb-6">
              The timeline you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/">
              <Button>Browse All Timelines</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sort memories by date (oldest to newest)
  const sortedMemories = memories
    ? [...memories].sort(
      (a, b) => new Date(a.date_of_event).getTime() - new Date(b.date_of_event).getTime()
    )
    : [];

  const formattedCreatedDate = new Date(timeline.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Link href="/">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </Link>

      {/* Timeline Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">{timeline.name}</h1>
        <p className="text-muted-foreground text-lg leading-relaxed mb-6">
          {timeline.description}
        </p>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span>
              {sortedMemories.length} {sortedMemories.length === 1 ? "memory" : "memories"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Created {formattedCreatedDate}</span>
          </div>
        </div>
      </div>

      {/* Memories Section */}
      <div>
        {user && (
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold">Memories</h2>
            <Button className="gap-2" onClick={() => setCreateMemoryOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Memory
            </Button>
          </div>
        )}

        {/* Empty State */}
        {sortedMemories.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No memories yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Start capturing your memories by adding your first one to this timeline.
              </p>
              <Button className="gap-2" onClick={() => setCreateMemoryOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Your First Memory
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Memory Timeline */}
        {sortedMemories.length > 0 && (
          <div className="relative">
            {sortedMemories.map((memory, index) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                isFirst={index === 0}
                isLast={index === sortedMemories.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Memory Form Modal/Drawer */}
      <CreateMemoryForm
        timelineId={timeline.id}
        open={createMemoryOpen}
        onOpenChange={setCreateMemoryOpen}
      />
    </div>
  );
}

