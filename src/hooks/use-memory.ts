import { trpc } from '@/lib/trpc';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase';

type Memory = Tables<'memory'>;

// Hook to get all memories with optional pagination
export const useMemories = (options?: { limit?: number; offset?: number }) => {
  return trpc.memory.getAll.useQuery(options);
};

// Hook to get a single memory by ID
export const useMemory = (id: string) => {
  return trpc.memory.getById.useQuery({ id });
};

// Hook to get memories by timeline ID
export const useMemoriesByTimeline = (
  timeline_id: string,
  options?: { limit?: number; offset?: number }
) => {
  return trpc.memory.getByTimelineId.useQuery({
    timeline_id,
    ...options,
  });
};

// Hook to get memory count by timeline ID
export const useMemoryCountByTimeline = (timeline_id: string) => {
  return trpc.memory.getCountByTimelineId.useQuery({ timeline_id });
};

// Hook to create a new memory
export const useCreateMemory = () => {
  const utils = trpc.useContext();

  return trpc.memory.create.useMutation({
    onSuccess: () => {
      // Invalidate and refetch all memory queries
      utils.memory.getAll.invalidate();
      utils.memory.getByTimelineId.invalidate();
      utils.memory.getCountByTimelineId.invalidate();
    },
  });
};

// Hook to update an existing memory
export const useUpdateMemory = () => {
  const utils = trpc.useContext();

  return trpc.memory.update.useMutation({
    onSuccess: (data) => {
      // Invalidate specific memory and list queries
      utils.memory.getById.invalidate({ id: data.id });
      utils.memory.getAll.invalidate();
      utils.memory.getByTimelineId.invalidate({ timeline_id: data.timeline_id });
    },
  });
};

// Hook to delete a memory
export const useDeleteMemory = () => {
  const utils = trpc.useContext();

  return trpc.memory.delete.useMutation({
    onSuccess: () => {
      // Invalidate all memory queries
      utils.memory.getAll.invalidate();
      utils.memory.getByTimelineId.invalidate();
      utils.memory.getCountByTimelineId.invalidate();
    },
  });
};

// Utility hook for optimistic updates
export const useMemoryMutations = () => {
  const createMemory = useCreateMemory();
  const updateMemory = useUpdateMemory();
  const deleteMemory = useDeleteMemory();

  return {
    createMemory,
    updateMemory,
    deleteMemory,
    isLoading:
      createMemory.isPending || updateMemory.isPending || deleteMemory.isPending,
    isError:
      createMemory.isError || updateMemory.isError || deleteMemory.isError,
    error: createMemory.error || updateMemory.error || deleteMemory.error,
  };
};

