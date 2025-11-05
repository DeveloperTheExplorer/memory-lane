import { useState, useEffect } from 'react';
import { Pencil, Trash2, X, Check, Share2, Copy, CheckCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ActionDropdown } from '@/components/shared/action-dropdown';
import { TextareaField } from '@/components/shared/textarea-field';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';

export type TimelineHeaderProps = {
  name: string;
  description: string;
  isAuthenticated: boolean;
  onUpdate: (data: { name: string; description: string }) => Promise<void>;
  onDelete: () => void;
  isUpdating?: boolean;
};

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
  const [isSharePopoverOpen, setIsSharePopoverOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

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

  const handleShare = async () => {
    try {
      await navigator.share({
        title: name,
        text: description,
        url: window.location.href,
      });
    } catch (error) {
      // User cancelled or share failed
      if (error instanceof Error && error.message.includes('canceled')) {
        // User cancelled the share
        return;
      }
      toast.error("Failed to open share menu. Please copy the URL manually.");
    }
  };

  const handleCopyUrl = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
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

        {!isEditing && (
          <div className="flex items-center gap-2">
            <Popover open={isSharePopoverOpen} onOpenChange={setIsSharePopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Share timeline">
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Share Timeline</h4>
                  <div className="flex items-center gap-2">
                    <Input
                      value={typeof window !== 'undefined' ? window.location.href : ''}
                      readOnly
                      className="flex-1 text-sm"
                    />
                    <Button
                      variant={isCopied ? "default" : "outline"}
                      size="icon"
                      onClick={handleCopyUrl}
                      className="shrink-0"
                    >
                      {isCopied ? (
                        <CheckCheck className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {isCopied && (
                    <p className="text-xs text-muted-foreground">Link copied to clipboard!</p>
                  )}
                  {
                    !!navigator.share && (
                      <Button variant="outline" onClick={handleShare}>
                        More ways to share <ArrowRight className="h-4 w-4" />
                      </Button>
                    )
                  }
                </div>
              </PopoverContent>
            </Popover>

            {isAuthenticated && (
              <ActionDropdown
                onEdit={handleStartEdit}
                onDelete={onDelete}
                editLabel="Edit Timeline"
                deleteLabel="Delete Timeline"
                aria-label="Timeline actions"
              />
            )}
          </div>
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
        <TextareaField
          value={editFormData.description}
          onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
          placeholder="Timeline description"
          disabled={isUpdating}
          className="mb-6 text-lg min-h-[100px]"
        />
      ) : (
        <p className="text-muted-foreground text-lg leading-relaxed mb-6">
          {description}
        </p>
      )}
    </div>
  );
};

TimelineHeader.displayName = 'TimelineHeader';

