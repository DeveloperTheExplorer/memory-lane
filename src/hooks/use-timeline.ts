import { trpc } from '@/lib/trpc';
import type { Tables } from '@/types/supabase';

type Timeline = Tables<'timeline'>;

// Hook to get all timelines with optional pagination
export const useTimelines = (options?: { limit?: number; offset?: number }) => {
  return trpc.timeline.getAll.useQuery(options);
};

// Hook to get a single timeline by ID
export const useTimeline = (id: string) => {
  return trpc.timeline.getById.useQuery({ id });
};

// Hook to get a single timeline by slug
export const useTimelineBySlug = (slug: string) => {
  return trpc.timeline.getBySlug.useQuery({ slug });
};

// Hook to get all timelines with memory counts
export const useTimelinesWithMemoryCounts = (options?: { limit?: number; offset?: number }) => {
  return trpc.timeline.getAllWithMemoryCounts.useQuery(options);
};

// Hook to get a single timeline with memory count
export const useTimelineWithMemoryCount = (id: string) => {
  return trpc.timeline.getWithMemoryCount.useQuery({ id });
};

// Hook to get total timeline count
export const useTimelineCount = () => {
  return trpc.timeline.getCount.useQuery();
};

// Hook to create a new timeline
export const useCreateTimeline = () => {
  const utils = trpc.useContext();

  return trpc.timeline.create.useMutation({
    onSuccess: () => {
      // Invalidate and refetch all timeline queries
      utils.timeline.getAll.invalidate();
      utils.timeline.getAllWithMemoryCounts.invalidate();
      utils.timeline.getCount.invalidate();
    },
  });
};

// Hook to update an existing timeline
export const useUpdateTimeline = () => {
  const utils = trpc.useContext();

  return trpc.timeline.update.useMutation({
    onSuccess: (data) => {
      // Invalidate specific timeline and list queries
      utils.timeline.getById.invalidate({ id: data.id });
      utils.timeline.getBySlug.invalidate({ slug: data.slug });
      utils.timeline.getAll.invalidate();
      utils.timeline.getAllWithMemoryCounts.invalidate();
      utils.timeline.getWithMemoryCount.invalidate({ id: data.id });
    },
  });
};

// Hook to delete a timeline
export const useDeleteTimeline = () => {
  const utils = trpc.useContext();

  return trpc.timeline.delete.useMutation({
    onSuccess: () => {
      // Invalidate all timeline queries
      utils.timeline.getAll.invalidate();
      utils.timeline.getAllWithMemoryCounts.invalidate();
      utils.timeline.getCount.invalidate();
    },
  });
};

// Utility hook for optimistic updates
export const useTimelineMutations = () => {
  const createTimeline = useCreateTimeline();
  const updateTimeline = useUpdateTimeline();
  const deleteTimeline = useDeleteTimeline();

  return {
    createTimeline,
    updateTimeline,
    deleteTimeline,
    isLoading:
      createTimeline.isPending || updateTimeline.isPending || deleteTimeline.isPending,
    isError:
      createTimeline.isError || updateTimeline.isError || deleteTimeline.isError,
    error: createTimeline.error || updateTimeline.error || deleteTimeline.error,
  };
};

