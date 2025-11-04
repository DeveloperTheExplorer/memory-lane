import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

const BUCKET_NAME = 'memory-images';

export type UploadResult = {
  path: string;
  fullPath: string;
  publicUrl: string;
};

export type UploadOptions = {
  /** Override default file path. If not provided, will generate using timestamp and random string */
  filePath?: string;
  /** Content type of the file (e.g., 'image/jpeg', 'image/png') */
  contentType?: string;
  /** Whether to overwrite existing file at the same path */
  upsert?: boolean;
};

export type ListFilesOptions = {
  /** Limit number of files returned */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Search string to filter files */
  search?: string;
};

export class UploadService {
  private supabase;

  constructor(accessToken?: string) {
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: accessToken ? {
            Authorization: `Bearer ${accessToken}`
          } : {}
        }
      }
    );
  }

  /**
   * Upload a file to the memory-images bucket
   * @param file - File buffer or Blob to upload
   * @param fileName - Original file name
   * @param options - Upload options
   * @returns Upload result with path and public URL
   */
  async upload(
    file: Buffer | Blob | File,
    fileName: string,
    options?: UploadOptions
  ): Promise<UploadResult> {
    try {
      // Generate unique file path if not provided
      const filePath = options?.filePath || this.generateFilePath(fileName);

      // Upload to Supabase storage
      const { data, error } = await this.supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          contentType: options?.contentType,
          upsert: options?.upsert || false,
        });

      if (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
      }

      // Get public URL for the uploaded file
      const publicUrl = this.getPublicUrl(data.path);

      return {
        path: data.path,
        fullPath: data.fullPath,
        publicUrl,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred during file upload');
    }
  }

  /**
   * Delete a file from the memory-images bucket
   * @param filePath - Path of the file to delete (can be the full path or relative path)
   * @returns Success status
   */
  async delete(filePath: string): Promise<{ success: boolean; path: string }> {
    try {
      // Extract the relative path if a full path is provided
      const relativePath = this.extractRelativePath(filePath);

      const { error } = await this.supabase.storage
        .from(BUCKET_NAME)
        .remove([relativePath]);

      if (error) {
        throw new Error(`Failed to delete file: ${error.message}`);
      }

      return { success: true, path: relativePath };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred during file deletion');
    }
  }

  /**
   * Delete multiple files from the memory-images bucket
   * @param filePaths - Array of file paths to delete
   * @returns Success status with deleted paths
   */
  async deleteMany(
    filePaths: string[]
  ): Promise<{ success: boolean; paths: string[] }> {
    try {
      const relativePaths = filePaths.map((path) =>
        this.extractRelativePath(path)
      );

      const { error } = await this.supabase.storage
        .from(BUCKET_NAME)
        .remove(relativePaths);

      if (error) {
        throw new Error(`Failed to delete files: ${error.message}`);
      }

      return { success: true, paths: relativePaths };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred during bulk file deletion');
    }
  }

  /**
   * Get the public URL for a file in the bucket
   * @param filePath - Path of the file in the bucket
   * @returns Public URL of the file
   */
  getPublicUrl(filePath: string): string {
    const relativePath = this.extractRelativePath(filePath);

    const { data } = this.supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(relativePath);

    return data.publicUrl;
  }

  /**
   * List files in the memory-images bucket
   * @param options - List options for filtering and pagination
   * @returns Array of files in the bucket
   */
  async list(options?: ListFilesOptions) {
    try {
      const { data, error } = await this.supabase.storage
        .from(BUCKET_NAME)
        .list('', {
          limit: options?.limit || 100,
          offset: options?.offset || 0,
          search: options?.search,
        });

      if (error) {
        throw new Error(`Failed to list files: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred while listing files');
    }
  }

  /**
   * Replace an existing file with a new one
   * @param file - New file buffer or Blob
   * @param existingFilePath - Path of the file to replace
   * @param contentType - Content type of the new file
   * @returns Upload result with path and public URL
   */
  async replace(
    file: Buffer | Blob | File,
    existingFilePath: string,
    contentType?: string
  ): Promise<UploadResult> {
    try {
      const relativePath = this.extractRelativePath(existingFilePath);

      // Upload with upsert to replace existing file
      const { data, error } = await this.supabase.storage
        .from(BUCKET_NAME)
        .upload(relativePath, file, {
          contentType,
          upsert: true,
        });

      if (error) {
        throw new Error(`Failed to replace file: ${error.message}`);
      }

      const publicUrl = this.getPublicUrl(data.path);

      return {
        path: data.path,
        fullPath: data.fullPath,
        publicUrl,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred during file replacement');
    }
  }

  /**
   * Generate a unique file path using timestamp and random string
   * @param fileName - Original file name
   * @returns Generated unique file path
   */
  private generateFilePath(fileName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = fileName.split('.').pop();
    const baseName = fileName.replace(`.${extension}`, '').replace(/[^a-z0-9]/gi, '-').toLowerCase();

    return `${timestamp}-${randomString}-${baseName}.${extension}`;
  }

  /**
   * Extract relative path from a full URL or path
   * @param path - Full path or URL
   * @returns Relative path for bucket operations
   */
  private extractRelativePath(path: string): string {
    // If it's a full URL, extract the path after the bucket name
    if (path.includes('supabase')) {
      const parts = path.split(`${BUCKET_NAME}/`);
      return parts[1] || path;
    }

    // If it's already a relative path, return as is
    return path;
  }

  /**
   * Check if a file exists in the bucket
   * @param filePath - Path of the file to check
   * @returns True if file exists, false otherwise
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      const relativePath = this.extractRelativePath(filePath);
      const pathParts = relativePath.split('/');
      const fileName = pathParts.pop();
      const folder = pathParts.join('/') || '';

      const { data, error } = await this.supabase.storage
        .from(BUCKET_NAME)
        .list(folder, {
          search: fileName,
        });

      if (error) {
        return false;
      }

      return data.some((file) => file.name === fileName);
    } catch {
      return false;
    }
  }

  /**
   * Get file metadata
   * @param filePath - Path of the file
   * @returns File metadata including size, created date, etc.
   */
  async getMetadata(filePath: string) {
    try {
      const relativePath = this.extractRelativePath(filePath);
      const pathParts = relativePath.split('/');
      const fileName = pathParts.pop();
      const folder = pathParts.join('/') || '';

      const { data, error } = await this.supabase.storage
        .from(BUCKET_NAME)
        .list(folder, {
          search: fileName,
        });

      if (error) {
        throw new Error(`Failed to get file metadata: ${error.message}`);
      }

      const file = data.find((f) => f.name === fileName);

      if (!file) {
        throw new Error('File not found');
      }

      return file;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred while getting file metadata');
    }
  }
}

