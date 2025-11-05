import { useState, useEffect } from "react";
import { Pencil, Trash2, MoreVertical, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TimelineHeaderProps {
  name: string;
  description: string;
  isAuthenticated: boolean;
  onUpdate: (data: { name: string; description: string }) => Promise<void>;
  onDelete: () => void;
  isUpdating?: boolean;
}

export const TimelineHeader = ({
  name,
  description,
  isAuthenticated,
  onUpdate,
  onDelete,
  isUpdating = false,
}: TimelineHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ name, description });

  // Sync form data when props change
  useEffect(() => {
    setEditFormData({ name, description });
  }, [name, description]);

  const handleStartEdit = () => {
    setEditFormData({ name, description });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData({ name, description });
  };

  const handleSaveEdit = async () => {
    try {
      await onUpdate(editFormData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update timeline:", error);
    }
  };

  return (
    <div className="mb-12">
      <div className="flex items-start justify-between mb-4">
        {isEditing ? (
          <div className="flex-1 mr-4">
            <Input
              type="text"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              className="text-4xl font-bold tracking-tight h-auto py-2 px-3"
              placeholder="Timeline name"
              disabled={isUpdating}
            />
          </div>
        ) : (
          <h1 className="text-4xl font-bold tracking-tight">{name}</h1>
        )}

        {isAuthenticated && !isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleStartEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Timeline
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Timeline
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {isAuthenticated && isEditing && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancelEdit}
              disabled={isUpdating}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={handleSaveEdit}
              disabled={isUpdating || !editFormData.name.trim() || !editFormData.description.trim()}
              className="h-8 w-8"
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <textarea
          value={editFormData.description}
          onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
          className={cn(
            "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-y mb-6 text-lg",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          )}
          placeholder="Timeline description"
          disabled={isUpdating}
        />
      ) : (
        <p className="text-muted-foreground text-lg leading-relaxed mb-6">
          {description}
        </p>
      )}
    </div>
  );
};

