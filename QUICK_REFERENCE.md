# Quick Reference - Memory & Timeline CRUD

## Import Statements

```typescript
// Timeline hooks
import {
  useTimelines,
  useTimeline,
  useTimelineBySlug,
  useTimelinesWithMemoryCounts,
  useCreateTimeline,
  useUpdateTimeline,
  useDeleteTimeline,
} from "@/hooks/use-timeline";

// Memory hooks
import {
  useMemories,
  useMemory,
  useMemoriesByTimeline,
  useCreateMemory,
  useUpdateMemory,
  useDeleteMemory,
} from "@/hooks/use-memory";
```

## Timeline Operations

### Fetch Timelines

```typescript
// All timelines
const { data, isLoading, error } = useTimelines({ limit: 10, offset: 0 });

// Single timeline by ID
const { data: timeline } = useTimeline("timeline-id");

// Single timeline by slug
const { data: timeline } = useTimelineBySlug("my-timeline");

// All timelines with memory counts
const { data: timelines } = useTimelinesWithMemoryCounts();
```

### Create Timeline

```typescript
const createTimeline = useCreateTimeline();

await createTimeline.mutateAsync({
  name: "My Timeline",
  description: "Description here",
  slug: "my-timeline", // lowercase, alphanumeric, hyphens only
});
```

### Update Timeline

```typescript
const updateTimeline = useUpdateTimeline();

await updateTimeline.mutateAsync({
  id: "timeline-id",
  name: "Updated Name", // optional
  description: "Updated Description", // optional
  slug: "new-slug", // optional
});
```

### Delete Timeline

```typescript
const deleteTimeline = useDeleteTimeline();

await deleteTimeline.mutateAsync({
  id: "timeline-id",
});
// Note: Will fail if timeline has memories
```

## Memory Operations

### Fetch Memories

```typescript
// All memories
const { data, isLoading, error } = useMemories({ limit: 10, offset: 0 });

// Single memory by ID
const { data: memory } = useMemory("memory-id");

// Memories by timeline
const { data: memories } = useMemoriesByTimeline("timeline-id", {
  limit: 20,
  offset: 0,
});
```

### Create Memory

```typescript
const createMemory = useCreateMemory();

await createMemory.mutateAsync({
  name: "Memory Title",
  description: "Memory description",
  image_url: "https://example.com/image.jpg",
  date_of_event: "2024-11-04", // ISO date string
  timeline_id: "timeline-id",
});
```

### Update Memory

```typescript
const updateMemory = useUpdateMemory();

await updateMemory.mutateAsync({
  id: "memory-id",
  name: "Updated Name", // optional
  description: "Updated Description", // optional
  image_url: "https://example.com/new-image.jpg", // optional
  date_of_event: "2024-11-05", // optional
});
```

### Delete Memory

```typescript
const deleteMemory = useDeleteMemory();

await deleteMemory.mutateAsync({
  id: "memory-id",
});
```

## Common Patterns

### Timeline Detail Page

```typescript
function TimelinePage({ slug }: { slug: string }) {
  const { data: timeline } = useTimelineBySlug(slug);
  const { data: memories } = useMemoriesByTimeline(timeline?.id || "");

  return (
    <div>
      <h1>{timeline?.name}</h1>
      {memories?.map((m) => (
        <div key={m.id}>{m.name}</div>
      ))}
    </div>
  );
}
```

### Create Timeline & Memory

```typescript
async function createTimelineWithMemory() {
  // 1. Create timeline
  const timeline = await createTimeline.mutateAsync({
    name: "Trip to Paris",
    description: "Summer vacation",
    slug: "trip-to-paris",
  });

  // 2. Create memory in that timeline
  await createMemory.mutateAsync({
    name: "Eiffel Tower",
    description: "Amazing view",
    image_url: "https://example.com/eiffel.jpg",
    date_of_event: "2024-07-15",
    timeline_id: timeline.id,
  });
}
```

### Loading & Error States

```typescript
function Component() {
  const { data, isLoading, error } = useTimelines();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data</div>;

  return <div>{/* Render data */}</div>;
}
```

### Mutation States

```typescript
function CreateButton() {
  const create = useCreateTimeline();

  return (
    <div>
      <button onClick={handleCreate} disabled={create.isPending}>
        {create.isPending ? "Creating..." : "Create"}
      </button>

      {create.isError && <div className="error">{create.error.message}</div>}

      {create.isSuccess && <div className="success">Created!</div>}
    </div>
  );
}
```

## Validation Rules

### Timeline

- **name**: Required, min 1 character
- **description**: Required, min 1 character
- **slug**: Required, pattern `^[a-z0-9-]+$`, must be unique

### Memory

- **name**: Required, min 1 character
- **description**: Required, min 1 character
- **image_url**: Required, must be valid URL
- **date_of_event**: Required, ISO date string
- **timeline_id**: Required, valid UUID

## Auto-Slug Generator

```typescript
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Usage
const slug = generateSlug("My Timeline Name 2024");
// Result: "my-timeline-name-2024"
```

## Type Imports

```typescript
import type { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

// Use in your components
type Timeline = Tables<"timeline">;
type Memory = Tables<"memory">;
type TimelineInsert = TablesInsert<"timeline">;
type MemoryUpdate = TablesUpdate<"memory">;
```

## Error Messages

- `"A timeline with this slug already exists"` → Use different slug
- `"Cannot delete timeline with existing memories"` → Delete memories first
- `"Failed to fetch timeline"` → Check timeline ID/slug exists
- `"Must be a valid URL"` → Fix image_url format
- `"Slug must be lowercase alphanumeric with hyphens"` → Fix slug format

## Files Reference

- **Backend Routers**: `src/server/routers/memory.ts`, `src/server/routers/timeline.ts`
- **Frontend Hooks**: `src/hooks/use-memory.ts`, `src/hooks/use-timeline.ts`
- **Types**: `src/types/supabase.ts`
- **Examples**: `src/components/timeline-example.tsx`

## Detailed Documentation

- `MEMORY_CRUD_DOCUMENTATION.md` - Complete Memory API
- `TIMELINE_CRUD_DOCUMENTATION.md` - Complete Timeline API
- `COMPLETE_CRUD_IMPLEMENTATION.md` - Full guide

---

**Quick Tip**: All hooks automatically handle cache invalidation. After mutations, related queries will refetch automatically! 🎉

