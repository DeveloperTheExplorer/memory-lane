import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTimelineBySlug, useDeleteTimeline, useUpdateTimeline } from "@/hooks/use-timeline";
import { useMemoriesByTimeline } from "@/hooks/use-memory";
import { Button } from "@/components/ui/button";
import { CreateMemoryForm } from "@/components/create-memory-form";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { TimelineDetailSkeleton } from "@/components/timeline-detail-skeleton";
import { TimelineHeader } from "@/components/timeline-header";
import { TimelineStats } from "@/components/timeline-stats";
import { MemoriesSection } from "@/components/memories-section";
import { TimelineErrorState } from "@/components/timeline-error-state";
import { useAuth } from "@/contexts/auth-context";
import { compareDates, formatDate } from "@/lib/date-utils";

export default function TimelineDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { slug } = router.query;
  const [createMemoryOpen, setCreateMemoryOpen] = useState(false);
  const [deleteTimelineOpen, setDeleteTimelineOpen] = useState(false);

  const deleteTimeline = useDeleteTimeline();
  const updateTimeline = useUpdateTimeline();

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

  // Handle timeline update
  const handleUpdateTimeline = async (data: { name: string; description: string }) => {
    if (!timeline) return;

    await updateTimeline.mutateAsync({
      id: timeline.id,
      name: data.name,
      description: data.description,
    });
  };

  // Handle timeline deletion
  const handleDeleteTimeline = async () => {
    if (!timeline) return;

    try {
      await deleteTimeline.mutateAsync({ id: timeline.id });
      router.push("/");
    } catch (error) {
      console.error("Failed to delete timeline:", error);
    }
  };

  // Loading state
  if (!slug || timelineLoading || (memoriesLoading && timeline)) {
    return <TimelineDetailSkeleton />;
  }

  // Error state
  if (timelineError || memoriesError) {
    return (
      <TimelineErrorState
        type="error"
        errorMessage={timelineError?.message || memoriesError?.message}
      />
    );
  }

  // Not found state
  if (!timeline) {
    return <TimelineErrorState type="not-found" />;
  }

  // Sort memories by date (oldest to newest)
  const sortedMemories = memories
    ? [...memories].sort((a, b) => compareDates(a.date_of_event, b.date_of_event))
    : [];

  const formattedCreatedDate = formatDate(timeline.created_at);

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
      <TimelineHeader
        name={timeline.name}
        description={timeline.description || ""}
        isAuthenticated={!!user}
        onUpdate={handleUpdateTimeline}
        onDelete={() => setDeleteTimelineOpen(true)}
        isUpdating={updateTimeline.isPending}
      />

      {/* Timeline Stats */}
      <TimelineStats
        memoryCount={sortedMemories.length}
        createdDate={formattedCreatedDate}
      />

      {/* Memories Section */}
      <div className="mt-12">
        <MemoriesSection
          memories={sortedMemories}
          isAuthenticated={!!user}
          onAddMemory={() => setCreateMemoryOpen(true)}
        />
      </div>

      {/* Create Memory Form Modal/Drawer */}
      <CreateMemoryForm
        timelineId={timeline.id}
        open={createMemoryOpen}
        onOpenChange={setCreateMemoryOpen}
      />

      {/* Delete Timeline Confirmation */}
      <DeleteConfirmationDialog
        open={deleteTimelineOpen}
        onOpenChange={setDeleteTimelineOpen}
        onConfirm={handleDeleteTimeline}
        title="Delete Timeline"
        description={`Are you sure you want to delete "${timeline.name}"? This will also delete all memories in this timeline. This action cannot be undone.`}
        isDeleting={deleteTimeline.isPending}
      />
    </div>
  );
}

