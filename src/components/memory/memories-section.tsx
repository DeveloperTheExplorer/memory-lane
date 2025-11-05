import { Plus, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemoryCard } from "@/components/memory/memory-card";
import { EmptyMemoriesState } from "@/components/memory/empty-memories-state";
import type { Tables } from "@/types/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type SortOrder = "old-to-new" | "new-to-old";

interface MemoriesSectionProps {
  memories: Tables<'memory'>[];
  isAuthenticated: boolean;
  onAddMemory: () => void;
  sortOrder: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;
}

export const MemoriesSection = ({
  memories,
  isAuthenticated,
  onAddMemory,
  sortOrder,
  onSortOrderChange,
}: MemoriesSectionProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold">Memories</h2>
        <div className="flex items-center gap-4">
          {memories.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  {sortOrder === "old-to-new" ? "Old to New" : "New to Old"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Sort Order</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortOrder} onValueChange={(value) => onSortOrderChange(value as SortOrder)}>
                  <DropdownMenuRadioItem value="old-to-new">
                    Old to New
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="new-to-old">
                    New to Old
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {isAuthenticated && (
            <Button className="gap-2" onClick={onAddMemory}>
              <Plus className="h-4 w-4" />
              Add Memory
            </Button>
          )}
        </div>
      </div>

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

