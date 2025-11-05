import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemoryCard } from "@/components/memory-card";
import { EmptyMemoriesState } from "@/components/empty-memories-state";
import type { Tables } from "@/types/supabase";

interface MemoriesSectionProps {
  memories: Tables<'memory'>[];
  isAuthenticated: boolean;
  onAddMemory: () => void;
}

export const MemoriesSection = ({
  memories,
  isAuthenticated,
  onAddMemory,
}: MemoriesSectionProps) => {
  return (
    <div>
      {isAuthenticated && (
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">Memories</h2>
          <Button className="gap-2" onClick={onAddMemory}>
            <Plus className="h-4 w-4" />
            Add Memory
          </Button>
        </div>
      )}

      {/* Empty State */}
      {memories.length === 0 && <EmptyMemoriesState onAddMemory={onAddMemory} />}

      {/* Memory Timeline */}
      {memories.length > 0 && (
        <div className="relative">
          {memories.map((memory, index) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              isFirst={index === 0}
              isLast={index === memories.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

