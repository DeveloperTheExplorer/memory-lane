import { useRef, memo } from 'react';
import { Check, X, Upload, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import type { Tables } from '@/types/supabase';
import { fromDateObject } from '@/lib/date-utils';

type Memory = Tables<'memory'>;

export type MemoryCardEditProps = {
  memory: Memory;
  editedName: string;
  editedDescription: string;
  editedDate: string;
  imagePreview: string | null;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onImageClick: () => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
};

const MemoryCardEditComponent = ({
  memory,
  editedName,
  editedDescription,
  editedDate,
  imagePreview,
  onNameChange,
  onDescriptionChange,
  onDateChange,
  onImageClick,
  onImageChange,
  onSave,
  onCancel,
  isSaving,
}: MemoryCardEditProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="flex-1 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <Input
              value={editedName}
              onChange={(e) => onNameChange(e.target.value)}
              className="text-xl font-semibold"
              placeholder="Memory name"
            />
            <DatePicker
              label=""
              id="edit-date"
              value={editedDate}
              onChange={(date) => {
                if (date) {
                  onDateChange(fromDateObject(date));
                }
              }}
            />
          </div>
          {/* Edit mode action buttons */}
          <div className="flex gap-2">
            <Button onClick={onSave} size="sm" disabled={isSaving}>
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button onClick={onCancel} size="sm" variant="outline" disabled={isSaving}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Memory Image */}
        <div
          className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted cursor-pointer ring-2 ring-primary ring-offset-2"
          onClick={handleImageClick}
        >
          <Image
            src={imagePreview || memory.image_url}
            alt={memory.name}
            className="object-cover w-full h-full"
            fill
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
          {/* Fallback for failed images */}
          <div className="hidden absolute inset-0 items-center justify-center bg-muted">
            <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
          </div>
          {/* Upload overlay */}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="text-white text-center">
              <Upload className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Click to replace image</p>
            </div>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="hidden"
        />

        {/* Memory Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={editedDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="w-full min-h-[100px] px-3 py-2 text-base rounded-md border border-input bg-background resize-y"
            placeholder="Memory description"
          />
        </div>
      </CardContent>
    </Card>
  );
};

MemoryCardEditComponent.displayName = 'MemoryCardEdit';

export const MemoryCardEdit = memo(MemoryCardEditComponent);

