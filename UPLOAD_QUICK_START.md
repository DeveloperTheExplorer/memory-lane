# File Upload - Quick Start Guide

## 🚀 Quick Setup (3 Steps)

### 1. Import the hook
```typescript
import { useUpload, validateImageFile } from '@/hooks/use-upload';
```

### 2. Use in your component
```typescript
const { upload, uploading, progress, error } = useUpload();
```

### 3. Upload on file select
```typescript
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate (optional but recommended)
  const validationError = validateImageFile(file, 10);
  if (validationError) {
    alert(validationError);
    return;
  }

  // Upload
  try {
    const result = await upload(file);
    console.log('URL:', result.publicUrl);
    // Now save result.publicUrl to your memory!
  } catch (err) {
    console.error('Upload failed:', err);
  }
};
```

## 📦 Complete Example - Memory Form

```typescript
import { useState } from 'react';
import { useUpload, validateImageFile } from '@/hooks/use-upload';
import { trpc } from '@/lib/trpc';

function CreateMemory({ timelineId }: { timelineId: string }) {
  const { upload, uploading } = useUpload();
  const createMemory = trpc.memory.create.useMutation();
  const [imageUrl, setImageUrl] = useState('');

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      alert(error);
      return;
    }

    const result = await upload(file);
    setImageUrl(result.publicUrl);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await createMemory.mutateAsync({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      date_of_event: formData.get('date') as string,
      image_url: imageUrl,
      timeline_id: timelineId,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Memory name" required />
      <input name="description" placeholder="Description" required />
      <input name="date" type="date" required />
      <input type="file" accept="image/*" onChange={handleImageSelect} required />
      
      <button type="submit" disabled={uploading || !imageUrl}>
        {uploading ? 'Uploading...' : 'Create Memory'}
      </button>
    </form>
  );
}
```

## 🎯 Common Patterns

### With Progress Bar
```typescript
const { upload, uploading, progress } = useUpload();

return (
  <>
    <input type="file" onChange={handleUpload} disabled={uploading} />
    {uploading && (
      <div className="w-full bg-gray-200 rounded">
        <div 
          className="bg-blue-500 h-2 rounded"
          style={{ width: `${progress}%` }}
        />
      </div>
    )}
  </>
);
```

### With Image Preview
```typescript
const [preview, setPreview] = useState<string | null>(null);

const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Show preview
  const reader = new FileReader();
  reader.onloadend = () => setPreview(reader.result as string);
  reader.readAsDataURL(file);

  // Upload
  upload(file);
};

return (
  <>
    <input type="file" onChange={handleFileSelect} />
    {preview && <img src={preview} alt="Preview" />}
  </>
);
```

### One-Off Upload (Without Hook)
```typescript
import { uploadFile } from '@/hooks/use-upload';

const handleUpload = async (file: File) => {
  const result = await uploadFile(file);
  console.log(result.publicUrl);
};
```

## 🛠️ Service Layer (Direct Usage)

If you need to use the service directly (e.g., in API routes):

```typescript
import { UploadService } from '@/server/services/upload.service';

const uploadService = new UploadService();

// Upload
const result = await uploadService.upload(buffer, 'photo.jpg', {
  contentType: 'image/jpeg'
});

// Delete
await uploadService.delete(result.publicUrl);

// Replace
await uploadService.replace(newBuffer, result.path);

// Check if exists
const exists = await uploadService.exists(result.path);
```

## 🚨 Error Handling

```typescript
try {
  const result = await upload(file);
  // Success!
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('size')) {
      alert('File too large!');
    } else if (error.message.includes('type')) {
      alert('Invalid file type!');
    } else {
      alert('Upload failed: ' + error.message);
    }
  }
}
```

## ✅ Validation

```typescript
import { validateImageFile } from '@/hooks/use-upload';

// Default: max 10MB
const error = validateImageFile(file);

// Custom size limit
const error = validateImageFile(file, 5); // 5MB max

if (error) {
  alert(error); // "File size must be less than 5MB"
  return;
}
```

## 🔒 Cleanup on Memory Delete

When deleting a memory, also delete its image:

```typescript
import { UploadService } from '@/server/services/upload.service';

// In your delete handler
const memory = await memoryService.getById(id);

// Delete image from storage
const uploadService = new UploadService();
await uploadService.delete(memory.image_url);

// Delete memory record
await memoryService.delete(id);
```

## 📝 API Endpoint

Direct API usage (if not using the hook):

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@./image.jpg"
```

Response:
```json
{
  "success": true,
  "data": {
    "path": "1699123456-abc123-image.jpg",
    "fullPath": "memory-images/1699123456-abc123-image.jpg",
    "publicUrl": "https://...supabase.co/storage/v1/object/public/memory-images/..."
  }
}
```

## 🎨 Styling Tips

### Hide Default File Input
```tsx
<label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded">
  Choose File
  <input
    type="file"
    className="hidden"
    onChange={handleUpload}
  />
</label>
```

### Drag & Drop Zone
```tsx
<div
  onDrop={handleDrop}
  onDragOver={(e) => e.preventDefault()}
  className="border-2 border-dashed p-8 text-center"
>
  Drop image here or click to browse
  <input type="file" onChange={handleUpload} />
</div>
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "No file provided" | Ensure `<input type="file">` has `name="file"` |
| Upload hangs | Check file size limit (default 10MB) |
| 404 on image URL | Verify bucket "memory-images" is public in Supabase |
| CORS error | Add your domain to Supabase allowed origins |

## 📚 More Info

See `UPLOAD_DOCUMENTATION.md` for complete details.

