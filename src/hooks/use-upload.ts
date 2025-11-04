import { useState } from 'react';
import { getSupabaseAccessToken } from '@/lib/auth-utils';

type UploadResult = {
  path: string;
  fullPath: string;
  publicUrl: string;
};

type UploadState = {
  uploading: boolean;
  progress: number;
  error: string | null;
  result: UploadResult | null;
};

type UseUploadReturn = {
  upload: (file: File) => Promise<UploadResult>;
  uploading: boolean;
  progress: number;
  error: string | null;
  result: UploadResult | null;
  reset: () => void;
};

/**
 * Hook for uploading files to the server
 * 
 * @example
 * ```tsx
 * const { upload, uploading, error, result } = useUpload();
 * 
 * const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
 *   const file = e.target.files?.[0];
 *   if (file) {
 *     try {
 *       const result = await upload(file);
 *       console.log('Uploaded:', result.publicUrl);
 *     } catch (err) {
 *       console.error('Upload failed:', err);
 *     }
 *   }
 * };
 * ```
 */
export function useUpload(): UseUploadReturn {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
    result: null,
  });

  const upload = async (file: File): Promise<UploadResult> => {
    setState({
      uploading: true,
      progress: 0,
      error: null,
      result: null,
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setState((prev) => ({ ...prev, progress }));
        }
      });

      // Return a promise that resolves when upload is complete
      const result = await new Promise<UploadResult>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.success && response.data) {
                resolve(response.data);
              } else {
                reject(new Error(response.error || 'Upload failed'));
              }
            } catch (e) {
              reject(new Error('Invalid response from server'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });

        xhr.open('POST', '/api/upload');

        // Add Authorization header with Supabase access token
        const accessToken = getSupabaseAccessToken();
        if (accessToken) {
          xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
        }

        xhr.send(formData);
      });

      setState({
        uploading: false,
        progress: 100,
        error: null,
        result,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        uploading: false,
        progress: 0,
        error: errorMessage,
        result: null,
      });
      throw error;
    }
  };

  const reset = () => {
    setState({
      uploading: false,
      progress: 0,
      error: null,
      result: null,
    });
  };

  return {
    upload,
    uploading: state.uploading,
    progress: state.progress,
    error: state.error,
    result: state.result,
    reset,
  };
}

/**
 * Utility function for one-off file uploads without using the hook
 * 
 * @example
 * ```tsx
 * const result = await uploadFile(file);
 * console.log('Uploaded:', result.publicUrl);
 * ```
 */
export async function uploadFile(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  // Get access token for authorization
  const accessToken = getSupabaseAccessToken();
  const headers: HeadersInit = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || 'Upload failed');
  }

  const data = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Upload failed');
  }

  return data.data;
}

/**
 * Validate if a file is an image and within size limits
 * 
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in megabytes (default: 10)
 * @returns Error message if invalid, null if valid
 */
export function validateImageFile(file: File, maxSizeMB = 10): string | null {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return 'File must be an image';
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File size must be less than ${maxSizeMB}MB`;
  }

  // Check for valid image extensions
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (!extension || !validExtensions.includes(extension)) {
    return 'Invalid image format. Supported formats: JPG, PNG, GIF, WebP';
  }

  return null;
}

