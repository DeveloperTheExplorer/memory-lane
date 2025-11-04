# File Upload System Documentation

## Overview

This document describes the complete file upload system for the Memory Lane application, including the service layer, API endpoints, and client-side utilities.

## Architecture

```
┌─────────────────┐
│  Client/Browser │
│   (React Hook)  │
└────────┬────────┘
         │
         │ POST /api/upload
         ▼
┌─────────────────┐
│  API Route      │
│  upload.ts      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  UploadService  │
│  (Service Layer)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Supabase       │
│  Storage Bucket │
│  memory-images  │
└─────────────────┘
```

## Components

### 1. UploadService (`src/server/services/upload.service.ts`)

A comprehensive service class for managing file operations in the Supabase "memory-images" bucket.

#### Methods

##### `upload(file, fileName, options?)`
Uploads a file to the bucket with automatic unique path generation.

**Parameters:**
- `file`: Buffer | Blob | File - The file to upload
- `fileName`: string - Original filename
- `options`: UploadOptions (optional)
  - `filePath?`: Custom file path (auto-generated if not provided)
  - `contentType?`: MIME type (e.g., 'image/jpeg')
  - `upsert?`: Whether to overwrite existing file

**Returns:** `UploadResult`
```typescript
{
  path: string;        // Relative path in bucket
  fullPath: string;    // Full storage path
  publicUrl: string;   // Public URL to access the file
}
```

**Example:**
```typescript
const uploadService = new UploadService();
const result = await uploadService.upload(
  fileBuffer,
  'vacation.jpg',
  { contentType: 'image/jpeg' }
);
// result.publicUrl: "https://...supabase.co/storage/v1/object/public/memory-images/..."
```

##### `delete(filePath)`
Deletes a single file from the bucket.

**Parameters:**
- `filePath`: string - Path or URL of the file to delete

**Returns:**
```typescript
{
  success: boolean;
  path: string;
}
```

##### `deleteMany(filePaths[])`
Deletes multiple files in a single operation.

**Parameters:**
- `filePaths`: string[] - Array of file paths/URLs to delete

**Returns:**
```typescript
{
  success: boolean;
  paths: string[];
}
```

##### `replace(file, existingFilePath, contentType?)`
Replaces an existing file with a new one (keeps the same path).

**Parameters:**
- `file`: Buffer | Blob | File - New file content
- `existingFilePath`: string - Path of file to replace
- `contentType?`: string - MIME type

##### `getPublicUrl(filePath)`
Gets the public URL for a file without uploading.

**Parameters:**
- `filePath`: string - Path of the file

**Returns:** `string` - Public URL

##### `list(options?)`
Lists files in the bucket with pagination and search.

**Parameters:**
- `options`: ListFilesOptions (optional)
  - `limit?`: number - Max files to return (default: 100)
  - `offset?`: number - Pagination offset
  - `search?`: string - Search filter

##### `exists(filePath)`
Checks if a file exists in the bucket.

**Returns:** `boolean`

##### `getMetadata(filePath)`
Gets file metadata (size, created date, etc.).

### 2. API Endpoint (`src/pages/api/upload.ts`)

A Next.js API route that handles multipart file uploads.

#### Endpoint Details

- **URL:** `/api/upload`
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`
- **Max File Size:** 10MB (configurable)

#### Request Format

```typescript
// Using FormData
const formData = new FormData();
formData.append('file', fileObject);

fetch('/api/upload', {
  method: 'POST',
  body: formData,
});
```

#### Response Format

**Success (200):**
```json
{
  "success": true,
  "data": {
    "path": "1699123456789-abc123-vacation.jpg",
    "fullPath": "memory-images/1699123456789-abc123-vacation.jpg",
    "publicUrl": "https://...supabase.co/storage/v1/object/public/memory-images/..."
  }
}
```

**Error (4xx/5xx):**
```json
{
  "success": false,
  "error": "Error message"
}
```

#### Implementation Notes

The current implementation includes a custom multipart parser. For production use, consider using the formidable library for better reliability:

1. Install formidable:
```bash
npm install formidable
npm install -D @types/formidable
```

2. Use the alternative implementation in `src/pages/api/upload-formidable.ts`

### 3. Client-Side Hook (`src/hooks/use-upload.ts`)

A React hook for easy file uploads with progress tracking.

#### `useUpload()`

**Returns:**
```typescript
{
  upload: (file: File) => Promise<UploadResult>;
  uploading: boolean;
  progress: number;      // 0-100
  error: string | null;
  result: UploadResult | null;
  reset: () => void;
}
```

**Example:**
```typescript
function MyComponent() {
  const { upload, uploading, progress, error, result } = useUpload();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadResult = await upload(file);
      console.log('Uploaded:', uploadResult.publicUrl);
      // Now save to memory table...
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileSelect} disabled={uploading} />
      {uploading && <div>Progress: {progress}%</div>}
      {error && <div>Error: {error}</div>}
      {result && <div>Success! URL: {result.publicUrl}</div>}
    </div>
  );
}
```

#### `uploadFile(file)`

Utility function for one-off uploads without the hook.

**Example:**
```typescript
const result = await uploadFile(fileObject);
console.log(result.publicUrl);
```

#### `validateImageFile(file, maxSizeMB?)`

Validates image files before upload.

**Returns:** `string | null` - Error message if invalid, null if valid

**Example:**
```typescript
const error = validateImageFile(file, 10);
if (error) {
  alert(error);
  return;
}
// File is valid, proceed with upload
```

## Complete Usage Flow

### Step 1: User Selects File

```typescript
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  // Validate first
  const error = validateImageFile(file, 10);
  if (error) {
    alert(error);
    return;
  }
  
  // Proceed to upload
  uploadAndCreateMemory(file);
};
```

### Step 2: Upload File

```typescript
const { upload } = useUpload();

const uploadAndCreateMemory = async (file: File) => {
  try {
    // Upload to Supabase storage
    const uploadResult = await upload(file);
    
    // uploadResult.publicUrl is now ready to be saved
    createMemory(uploadResult.publicUrl);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Step 3: Save to Memory Table

```typescript
const createMemory = async (imageUrl: string) => {
  // Use your existing tRPC mutation
  await memoryMutation.mutateAsync({
    name: formData.name,
    description: formData.description,
    image_url: imageUrl,  // Use the uploaded file URL
    date_of_event: formData.date,
    timeline_id: timelineId,
  });
};
```

## Integration with Memory CRUD

When creating or updating a memory, use the uploaded file's public URL:

```typescript
import { useUpload } from '@/hooks/use-upload';
import { trpc } from '@/lib/trpc';

function CreateMemoryForm({ timelineId }: { timelineId: string }) {
  const { upload, uploading } = useUpload();
  const createMutation = trpc.memory.create.useMutation();
  const [imageUrl, setImageUrl] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await upload(file);
    setImageUrl(result.publicUrl);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await createMutation.mutateAsync({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      image_url: imageUrl,  // From upload
      date_of_event: formData.get('date') as string,
      timeline_id: timelineId,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="description" required />
      <input name="date" type="date" required />
      <input type="file" onChange={handleImageUpload} required />
      
      <button type="submit" disabled={uploading || !imageUrl}>
        {uploading ? 'Uploading...' : 'Create Memory'}
      </button>
    </form>
  );
}
```

## File Path Generation

Files are automatically saved with unique paths:
```
{timestamp}-{random}-{sanitized-filename}.{extension}
```

Example:
```
1699123456789-abc123xyz-my-vacation-photo.jpg
```

This prevents:
- Filename collisions
- Path injection attacks
- Issues with special characters

## Security Considerations

1. **File Validation:** Always validate files on the client before upload
2. **Size Limits:** Current limit is 10MB (configurable in API route)
3. **File Types:** Recommend restricting to images only
4. **Authentication:** Consider adding auth checks to the API route
5. **Rate Limiting:** Consider adding rate limiting for production

## Error Handling

All methods throw descriptive errors that can be caught:

```typescript
try {
  const result = await upload(file);
} catch (error) {
  if (error.message.includes('Failed to upload')) {
    // Handle upload failure
  } else if (error.message.includes('Network')) {
    // Handle network error
  }
}
```

## Cleanup Strategy

When deleting a memory, also delete the associated image:

```typescript
// Before deleting the memory
const memory = await memoryService.getById(memoryId);

// Delete the image from storage
const uploadService = new UploadService();
await uploadService.delete(memory.image_url);

// Then delete the memory record
await memoryService.delete(memoryId);
```

## Testing

### Manual Testing

1. **Upload Test:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@./test-image.jpg"
```

2. **Browser Test:**
See `src/components/upload-example.tsx` for complete test components

### Automated Testing

Consider adding tests for:
- Valid image uploads
- Invalid file types
- File size limits
- Missing files
- Concurrent uploads

## Production Checklist

- [ ] Install formidable for robust file parsing
- [ ] Add authentication to `/api/upload` endpoint
- [ ] Configure appropriate file size limits
- [ ] Set up rate limiting
- [ ] Add monitoring/logging for uploads
- [ ] Configure CORS if needed
- [ ] Test with large files
- [ ] Implement cleanup for orphaned files
- [ ] Add retry logic for failed uploads
- [ ] Configure CDN if needed

## Troubleshooting

### Upload fails with "No file provided"
- Ensure Content-Type is `multipart/form-data`
- Check that field name is `file`
- Verify file is not empty

### "Failed to upload file" error
- Check Supabase credentials
- Verify bucket name is correct ("memory-images")
- Check bucket permissions in Supabase dashboard

### File uploads but URL returns 404
- Check bucket is public in Supabase
- Verify public URL format is correct
- Check CORS settings in Supabase

## Next Steps

1. Add authentication to protect upload endpoint
2. Implement image optimization/resizing
3. Add support for multiple file uploads
4. Create drag-and-drop upload UI
5. Add image cropping before upload
6. Implement progressive image loading

