import { useState, useCallback } from 'react';
import { useUpload, validateImageFile } from './use-upload';

export type UseImageUploadOptions = {
  onError?: (error: string) => void;
};

export function useImageUpload(options?: UseImageUploadOptions) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { upload, uploading, error } = useUpload();

  const handleImageSelect = useCallback(
    (file: File | null) => {
      if (!file) {
        setImageFile(null);
        setImagePreview(null);
        return;
      }

      const validationError = validateImageFile(file);
      if (validationError) {
        options?.onError?.(validationError);
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [options]
  );

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      handleImageSelect(file || null);
    },
    [handleImageSelect]
  );

  const uploadImage = useCallback(async () => {
    if (!imageFile) return null;
    const result = await upload(imageFile);
    return result;
  }, [imageFile, upload]);

  const reset = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
  }, []);

  return {
    imageFile,
    imagePreview,
    uploading,
    error,
    handleImageChange,
    handleImageSelect,
    uploadImage,
    reset,
  };
}

