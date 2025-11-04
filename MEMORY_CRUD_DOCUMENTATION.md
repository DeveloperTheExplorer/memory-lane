# Memory CRUD Operations Documentation

This document explains how to use the Memory CRUD operations through tRPC in the Memory Lane application.

## Overview

The Memory CRUD operations are implemented using:

- **Backend**: tRPC procedures in `src/server/routers/memory.ts`
- **Frontend**: React hooks in `src/hooks/use-memory.ts`
- **Database**: Supabase PostgreSQL with the `memory` table

## Table Schema

The `memory` table has the following structure:

```typescript
{
  id: string; // UUID (auto-generated)
  name: string; // Memory title
  description: string; // Memory details
  image_url: string; // URL to memory image
  date_of_event: string; // ISO date string of when the memory occurred
  timeline_id: string; // UUID reference to timeline table
  created_at: string; // ISO timestamp (auto-generated)
  updated_at: string; // ISO timestamp (auto-updated)
}
```

## Backend API (tRPC Procedures)

All procedures are available under `trpc.memory.*`

### Query Procedures (Read Operations)

#### 1. `getAll` - Get all memories

```typescript
trpc.memory.getAll.useQuery({
  limit: 10, // Optional: number of records to return
  offset: 0, // Optional: number of records to skip
});
```

#### 2. `getById` - Get a single memory

```typescript
trpc.memory.getById.useQuery({
  id: "uuid-string", // Required: memory UUID
});
```

#### 3. `getByTimelineId` - Get memories for a specific timeline

```typescript
trpc.memory.getByTimelineId.useQuery({
  timeline_id: "uuid-string", // Required: timeline UUID
  limit: 10, // Optional: pagination limit
  offset: 0, // Optional: pagination offset
});
```

#### 4. `getCountByTimelineId` - Get count of memories in a timeline

```typescript
trpc.memory.getCountByTimelineId.useQuery({
  timeline_id: "uuid-string", // Required: timeline UUID
});
```

### Mutation Procedures (Write Operations)

#### 5. `create` - Create a new memory

```typescript
trpc.memory.create.useMutation({
  name: string;              // Required
  description: string;       // Required
  image_url: string;         // Required: valid URL
  date_of_event: string;     // Required: ISO date string
  timeline_id: string;       // Required: UUID
})
```

#### 6. `update` - Update an existing memory

```typescript
trpc.memory.update.useMutation({
  id: string;                // Required: memory UUID
  name?: string;             // Optional
  description?: string;      // Optional
  image_url?: string;        // Optional: valid URL
  date_of_event?: string;    // Optional: ISO date string
  timeline_id?: string;      // Optional: UUID
})
```

#### 7. `delete` - Delete a memory

```typescript
trpc.memory.delete.useMutation({
  id: "uuid-string", // Required: memory UUID
});
```

## Frontend Hooks

### Query Hooks

#### `useMemories(options?)`

Fetch all memories with optional pagination.

```typescript
import { useMemories } from "@/hooks/use-memory";

function MyComponent() {
  const { data, isLoading, error } = useMemories({
    limit: 10,
    offset: 0,
  });

  return (
    <div>
      {data?.map((memory) => (
        <div key={memory.id}>{memory.name}</div>
      ))}
    </div>
  );
}
```

#### `useMemory(id)`

Fetch a single memory by ID.

```typescript
import { useMemory } from "@/hooks/use-memory";

function MemoryDetail({ memoryId }: { memoryId: string }) {
  const { data: memory, isLoading } = useMemory(memoryId);

  if (isLoading) return <div>Loading...</div>;

  return <div>{memory?.name}</div>;
}
```

#### `useMemoriesByTimeline(timeline_id, options?)`

Fetch all memories for a specific timeline.

```typescript
import { useMemoriesByTimeline } from "@/hooks/use-memory";

function TimelineMemories({ timelineId }: { timelineId: string }) {
  const { data: memories } = useMemoriesByTimeline(timelineId, {
    limit: 20,
    offset: 0,
  });

  return (
    <div>
      {memories?.map((memory) => (
        <div key={memory.id}>{memory.name}</div>
      ))}
    </div>
  );
}
```

#### `useMemoryCountByTimeline(timeline_id)`

Get the count of memories in a timeline.

```typescript
import { useMemoryCountByTimeline } from "@/hooks/use-memory";

function MemoryCount({ timelineId }: { timelineId: string }) {
  const { data } = useMemoryCountByTimeline(timelineId);

  return <div>Total Memories: {data?.count}</div>;
}
```

### Mutation Hooks

#### `useCreateMemory()`

Create a new memory.

```typescript
import { useCreateMemory } from "@/hooks/use-memory";

function CreateMemoryButton() {
  const createMemory = useCreateMemory();

  const handleCreate = async () => {
    try {
      const newMemory = await createMemory.mutateAsync({
        name: "Family Vacation",
        description: "Summer trip to the beach",
        image_url: "https://example.com/beach.jpg",
        date_of_event: "2024-07-15",
        timeline_id: "timeline-uuid",
      });

      console.log("Created:", newMemory);
    } catch (error) {
      console.error("Failed:", error);
    }
  };

  return (
    <button onClick={handleCreate} disabled={createMemory.isPending}>
      {createMemory.isPending ? "Creating..." : "Create Memory"}
    </button>
  );
}
```

#### `useUpdateMemory()`

Update an existing memory.

```typescript
import { useUpdateMemory } from "@/hooks/use-memory";

function UpdateMemoryButton({ memoryId }: { memoryId: string }) {
  const updateMemory = useUpdateMemory();

  const handleUpdate = async () => {
    try {
      const updated = await updateMemory.mutateAsync({
        id: memoryId,
        name: "Updated Memory Name",
        description: "New description",
      });

      console.log("Updated:", updated);
    } catch (error) {
      console.error("Failed:", error);
    }
  };

  return (
    <button onClick={handleUpdate} disabled={updateMemory.isPending}>
      Update
    </button>
  );
}
```

#### `useDeleteMemory()`

Delete a memory.

```typescript
import { useDeleteMemory } from "@/hooks/use-memory";

function DeleteMemoryButton({ memoryId }: { memoryId: string }) {
  const deleteMemory = useDeleteMemory();

  const handleDelete = async () => {
    if (!confirm("Are you sure?")) return;

    try {
      await deleteMemory.mutateAsync({ id: memoryId });
      console.log("Deleted successfully");
    } catch (error) {
      console.error("Failed:", error);
    }
  };

  return (
    <button onClick={handleDelete} disabled={deleteMemory.isPending}>
      Delete
    </button>
  );
}
```

#### `useMemoryMutations()`

Combined hook for all mutation operations.

```typescript
import { useMemoryMutations } from "@/hooks/use-memory";

function MemoryManager() {
  const {
    createMemory,
    updateMemory,
    deleteMemory,
    isLoading,
    isError,
    error,
  } = useMemoryMutations();

  // Use any of the mutations
  const handleCreate = () => {
    createMemory.mutateAsync({
      name: "New Memory",
      description: "Description",
      image_url: "https://example.com/image.jpg",
      date_of_event: "2024-01-01",
      timeline_id: "timeline-uuid",
    });
  };

  return (
    <div>
      {isLoading && <div>Processing...</div>}
      {isError && <div>Error: {error?.message}</div>}
      <button onClick={handleCreate}>Create</button>
    </div>
  );
}
```

## Automatic Cache Invalidation

All mutation hooks automatically invalidate relevant queries after successful operations:

- **Create**: Invalidates `getAll`, `getByTimelineId`, and `getCountByTimelineId`
- **Update**: Invalidates `getById`, `getAll`, and `getByTimelineId` for the specific timeline
- **Delete**: Invalidates `getAll`, `getByTimelineId`, and `getCountByTimelineId`

This ensures your UI always shows the latest data without manual refetching.

## Error Handling

All procedures throw descriptive errors that can be caught and displayed:

```typescript
try {
  await createMemory.mutateAsync({ ... });
} catch (error) {
  // Error will include helpful message like:
  // "Failed to create memory: <specific error>"
  console.error(error.message);
}
```

## Validation

The backend validates all inputs using Zod schemas:

- **name**: Required, minimum 1 character
- **description**: Required, minimum 1 character
- **image_url**: Required, must be a valid URL
- **date_of_event**: Required, ISO date string
- **timeline_id**: Required, must be a valid UUID
- **id**: Must be a valid UUID (for updates/deletes)

## Complete Example

See `src/components/memory-example.tsx` for complete working examples including:

- Displaying lists of memories
- Creating new memories with a form
- Updating existing memories
- Deleting memories with confirmation
- Pagination and filtering by timeline

## Files Created

1. **Backend Router**: `src/server/routers/memory.ts`

   - Contains all tRPC procedures for CRUD operations

2. **Main Router Update**: `src/server/routers/_app.ts`

   - Registers the memory router with the main app router

3. **Frontend Hooks**: `src/hooks/use-memory.ts`

   - React hooks wrapping tRPC calls with automatic cache management

4. **Example Components**: `src/components/memory-example.tsx`
   - Reference implementations showing how to use the hooks

## Type Safety

All operations are fully type-safe thanks to:

- TypeScript types generated from Supabase schema (`src/types/supabase.ts`)
- tRPC's end-to-end type inference
- Zod validation schemas

The frontend hooks will have full autocomplete and type checking for all memory fields.

## Next Steps

To use these operations in your application:

1. Import the hooks you need from `@/hooks/use-memory`
2. Use them in your React components
3. Handle loading/error states appropriately
4. Enjoy automatic cache invalidation and type safety!

For more examples, see `src/components/memory-example.tsx`.
