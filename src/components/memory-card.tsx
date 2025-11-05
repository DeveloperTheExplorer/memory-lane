import * as React from "react";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Tables } from "@/types/supabase";
import { useAuth } from "@/contexts/auth-context";
import { useUpdateMemory, useDeleteMemory } from "@/hooks/use-memory";
import { useImageUpload } from "@/hooks/use-image-upload";
import { MemoryCardView } from "./memory-card-view";
import { MemoryCardEdit } from "./memory-card-edit";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";

type Memory = Tables<"memory">;

interface MemoryCardProps {
  memory: Memory;
  isFirst?: boolean;
  isLast?: boolean;
}

export const MemoryCard = ({ memory, isFirst, isLast }: MemoryCardProps) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [editedName, setEditedName] = React.useState(memory.name);
  const [editedDescription, setEditedDescription] = React.useState(memory.description);
  const [editedDate, setEditedDate] = React.useState(memory.date_of_event);

  const updateMemory = useUpdateMemory();
  const deleteMemory = useDeleteMemory();
  const imageUpload = useImageUpload({
    onError: (error) => alert(error),
  });

  // Reset edit state when memory changes or editing is cancelled
  React.useEffect(() => {
    if (!isEditing) {
      setEditedName(memory.name);
      setEditedDescription(memory.description);
      setEditedDate(memory.date_of_event);
      imageUpload.reset();
    }
  }, [isEditing, memory, imageUpload.reset]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      let finalImageUrl = memory.image_url;
      let finalImageKey = memory.image_key;

      // Upload new image if one was selected
      if (imageUpload.imageFile) {
        const uploadResult = await imageUpload.uploadImage();
        if (uploadResult) {
          finalImageUrl = uploadResult.publicUrl;
          finalImageKey = uploadResult.path;
        }
      }

      await updateMemory.mutateAsync({
        id: memory.id,
        name: editedName,
        description: editedDescription,
        date_of_event: editedDate,
        image_url: finalImageUrl,
        image_key: finalImageKey,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update memory:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMemory.mutateAsync({ id: memory.id });
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete memory:", error);
    }
  };

  const actionsMenu = user && !isEditing ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleEdit}>
          <Edit2 className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setShowDeleteDialog(true)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null;

  return (
    <div className="relative flex gap-6 pb-8">
      {/* Timeline Line and Dot */}
      <div className="relative flex flex-col items-center">
        <div
          className={`w-4 h-4 rounded-full bg-primary ring-4 ring-background ${isFirst ? "mt-2" : ""
            }`}
        />
        {!isLast && <div className="w-0.5 flex-1 bg-border mt-2" />}
      </div>

      {/* Memory Card - View or Edit Mode */}
      {isEditing ? (
        <MemoryCardEdit
          memory={memory}
          editedName={editedName}
          editedDescription={editedDescription}
          editedDate={editedDate}
          imagePreview={imageUpload.imagePreview}
          onNameChange={setEditedName}
          onDescriptionChange={setEditedDescription}
          onDateChange={setEditedDate}
          onImageClick={() => { }}
          onImageChange={imageUpload.handleImageChange}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={updateMemory.isPending || imageUpload.uploading}
        />
      ) : (
        <MemoryCardView memory={memory} actions={actionsMenu} />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Memory"
        description="Are you sure you want to delete this memory? This action cannot be undone."
        isDeleting={deleteMemory.isPending}
      />
    </div>
  );
};

export const MemoryCardSkeleton = ({ isFirst, isLast }: { isFirst?: boolean; isLast?: boolean }) => {
  return (
    <div className="relative flex gap-6 pb-8">
      {/* Timeline Line and Dot */}
      <div className="relative flex flex-col items-center">
        <Skeleton className={`w-4 h-4 rounded-full ${isFirst ? "mt-2" : ""}`} />
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

