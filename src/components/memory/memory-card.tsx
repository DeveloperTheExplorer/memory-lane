import { useState, useEffect } from 'react';
import { MemoryCardSkeleton } from '@/components/ui/skeletons';
import { ActionDropdown } from '@/components/shared/action-dropdown';
import type { Tables } from '@/types/supabase';
import { useAuth } from '@/contexts/auth-context';
import { useUpdateMemory, useDeleteMemory } from '@/hooks/use-memory';
import { useImageUpload } from '@/hooks/use-image-upload';
import { MemoryCardView } from './memory-card-view';
import { MemoryCardEdit } from './memory-card-edit';
import { DeleteConfirmationDialog } from '../shared/delete-confirmation-dialog';
import { logError } from '@/lib/error-utils';
import { toast } from 'sonner';

type Memory = Tables<'memory'>;

export type MemoryCardProps = {
  memory: Memory;
  isFirst?: boolean;
  isLast?: boolean;
};

export const MemoryCard = ({ memory, isFirst, isLast }: MemoryCardProps) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editedName, setEditedName] = useState(memory.name);
  const [editedDescription, setEditedDescription] = useState(memory.description);
  const [editedDate, setEditedDate] = useState(memory.date_of_event);

  const updateMemory = useUpdateMemory();
  const deleteMemory = useDeleteMemory();
  const imageUpload = useImageUpload({
    onError: (error) => {
      toast.error(error);
      logError(error, { context: 'Image upload', memoryId: memory.id });
    },
  });

  // Reset edit state when memory changes or editing is cancelled
  useEffect(() => {
    if (!isEditing) {
      setEditedName(memory.name);
      setEditedDescription(memory.description);
      setEditedDate(memory.date_of_event);
      imageUpload.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, memory]);

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
      logError(error, { context: 'Memory update', memoryId: memory.id });
      toast.error('Failed to update memory');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMemory.mutateAsync({ id: memory.id });
      setShowDeleteDialog(false);
    } catch (error) {
      logError(error, { context: 'Memory deletion', memoryId: memory.id });
      toast.error('Failed to delete memory');
    }
  };

  const actionsMenu = user && !isEditing ? (
    <ActionDropdown
      onEdit={handleEdit}
      onDelete={() => setShowDeleteDialog(true)}
      aria-label="Memory actions"
    />
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

MemoryCard.displayName = 'MemoryCard';

export { MemoryCardSkeleton };

