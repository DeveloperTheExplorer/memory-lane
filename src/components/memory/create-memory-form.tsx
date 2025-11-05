import { useState } from 'react';
import { X, Loader2, Upload as UploadIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUpload, validateImageFile } from '@/hooks/use-upload';
import { useCreateMemory } from '@/hooks/use-memory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { TextareaField } from '@/components/shared/textarea-field';
import { getCurrentDate, fromDateObject } from '@/lib/date-utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";

export type CreateMemoryFormProps = {
  timelineId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type FormData = {
  name: string;
  description: string;
  date_of_event: string;
  image: File | null;
};

const MemoryFormContent = ({
  timelineId,
  onSuccess,
}: {
  timelineId: string;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    date_of_event: getCurrentDate(),
    image: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { upload, uploading, progress, error: uploadError } = useUpload();
  const createMemory = useCreateMemory();

  const handleImageDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate image
    const validationError = validateImageFile(file);
    if (validationError) {
      setErrors((prev) => ({ ...prev, image: validationError }));
      return;
    }

    setErrors((prev) => ({ ...prev, image: "" }));
    setFormData((prev) => ({ ...prev, image: file }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDropzoneError = (error: Error) => {
    setErrors((prev) => ({ ...prev, image: error.message }));
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.date_of_event) {
      newErrors.date_of_event = "Date is required";
    }
    if (!formData.image) {
      newErrors.image = "Image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Upload image first
      const uploadResult = await upload(formData.image!);

      // Create memory with uploaded image URL and key
      await createMemory.mutateAsync({
        timeline_id: timelineId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        date_of_event: formData.date_of_event,
        image_url: uploadResult.publicUrl,
        image_key: uploadResult.path,
      });

      // Reset form and close
      setFormData({
        name: "",
        description: "",
        date_of_event: getCurrentDate(),
        image: null,
      });
      setImagePreview(null);
      setErrors({});
      onSuccess();
    } catch (error) {
      console.error("Failed to create memory:", error);
      setErrors((prev) => ({
        ...prev,
        submit:
          error instanceof Error ? error.message : "Failed to create memory",
      }));
    }
  };

  const isSubmitting = uploading || createMemory.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Memory Image *</Label>
        {!imagePreview ? (
          <Dropzone
            onDrop={handleImageDrop}
            onError={handleDropzoneError}
            accept={{
              "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
            }}
            maxSize={10 * 1024 * 1024} // 10MB
            maxFiles={1}
            multiple={false}
            disabled={isSubmitting}
            className={`h-48 ${errors.image ? "border-destructive" : ""}`}
          >
            <DropzoneEmptyState>
              <div className="flex flex-col items-center justify-center">
                <div className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground mb-3">
                  <UploadIcon className="h-6 w-6" />
                </div>
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF or WebP (MAX. 10MB)
                </p>
              </div>
            </DropzoneEmptyState>
          </Dropzone>
        ) : (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemoveImage}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {errors.image && (
          <p className="text-sm text-destructive">{errors.image}</p>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="name">Memory Title *</Label>
        <Input
          id="name"
          placeholder="e.g., Summer Vacation 2023"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      {/* Date */}
      <div>
        <DatePicker
          label="Date of Event *"
          id="date_of_event"
          value={formData.date_of_event}
          onChange={(date) => {
            if (date) {
              setFormData((prev) => ({
                ...prev,
                date_of_event: fromDateObject(date),
              }));
            }
          }}
        />
        {errors.date_of_event && (
          <p className="text-sm text-destructive mt-2">{errors.date_of_event}</p>
        )}
      </div>

      {/* Description */}
      <TextareaField
        id="description"
        label="Description"
        placeholder="Share the story behind this memory..."
        value={formData.description}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, description: e.target.value }))
        }
        disabled={isSubmitting}
        error={errors.description}
        rows={5}
        required
      />

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uploading image...</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Messages */}
      {(uploadError || errors.submit) && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive">
          <p className="text-sm text-destructive">
            {uploadError || errors.submit}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-2 justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {uploading
            ? "Uploading..."
            : createMemory.isPending
              ? "Creating..."
              : "Create Memory"}
        </Button>
      </div>
    </form>
  );
};

export function CreateMemoryForm({
  timelineId,
  open,
  onOpenChange,
}: CreateMemoryFormProps) {
  const isMobile = useIsMobile();

  const handleSuccess = () => {
    onOpenChange(false);
  };

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create New Memory</SheetTitle>
            <SheetDescription>
              Add a new memory to your timeline. Upload an image and share the
              story.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <MemoryFormContent
              timelineId={timelineId}
              onSuccess={handleSuccess}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Memory</DialogTitle>
          <DialogDescription>
            Add a new memory to your timeline. Upload an image and share the
            story.
          </DialogDescription>
        </DialogHeader>
        <MemoryFormContent timelineId={timelineId} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}

CreateMemoryForm.displayName = 'CreateMemoryForm';

