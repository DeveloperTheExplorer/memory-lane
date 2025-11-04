# Timeline CRUD Operations Documentation

This document explains how to use the Timeline CRUD operations through tRPC in the Memory Lane application.

## Overview

The Timeline CRUD operations are implemented using:

- **Backend**: tRPC procedures in `src/server/routers/timeline.ts`
- **Frontend**: React hooks in `src/hooks/use-timeline.ts`
- **Database**: Supabase PostgreSQL with the `timeline` table

## Table Schema

The `timeline` table has the following structure:

```typescript
{
  id: string; // UUID (auto-generated)
  name: string; // Timeline title
  description: string; // Timeline details
  slug: string; // URL-friendly identifier (unique, lowercase alphanumeric with hyphens)
  created_at: string; // ISO timestamp (auto-generated)
  updated_at: string; // ISO timestamp (auto-updated)
}
```

## Backend API (tRPC Procedures)

All procedures are available under `trpc.timeline.*`

### Query Procedures (Read Operations)

#### 1. `getAll` - Get all timelines

```typescript
trpc.timeline.getAll.useQuery({
  limit: 10, // Optional: number of records to return
  offset: 0, // Optional: number of records to skip
});
```

#### 2. `getById` - Get a single timeline by ID

```typescript
trpc.timeline.getById.useQuery({
  id: "uuid-string", // Required: timeline UUID
});
```

#### 3. `getBySlug` - Get a single timeline by slug

```typescript
trpc.timeline.getBySlug.useQuery({
  slug: "my-timeline", // Required: timeline slug
});
```

#### 4. `getCount` - Get total timeline count

```typescript
trpc.timeline.getCount.useQuery();
```

#### 5. `getWithMemoryCount` - Get a timeline with its memory count

```typescript
trpc.timeline.getWithMemoryCount.useQuery({
  id: "uuid-string", // Required: timeline UUID
});
```

**Returns**: Timeline object with an additional `memory_count` field

#### 6. `getAllWithMemoryCounts` - Get all timelines with memory counts

```typescript
trpc.timeline.getAllWithMemoryCounts.useQuery({
  limit: 10, // Optional: pagination limit
  offset: 0, // Optional: pagination offset
});
```

**Returns**: Array of timeline objects, each with a `memory_count` field

### Mutation Procedures (Write Operations)

#### 7. `create` - Create a new timeline

```typescript
trpc.timeline.create.useMutation({
  name: string; // Required
  description: string; // Required
  slug: string; // Required: lowercase alphanumeric with hyphens, must be unique
});
```

**Validation**:

- Checks if slug already exists
- Slug must match pattern: `^[a-z0-9-]+$`

#### 8. `update` - Update an existing timeline

```typescript
trpc.timeline.update.useMutation({
  id: string; // Required: timeline UUID
  name?: string; // Optional
  description?: string; // Optional
  slug?: string; // Optional: must be unique if provided
});
```

**Validation**:

- If updating slug, checks that new slug doesn't already exist

#### 9. `delete` - Delete a timeline

```typescript
trpc.timeline.delete.useMutation({
  id: "uuid-string", // Required: timeline UUID
});
```

**Safety Check**:

- Prevents deletion if timeline has associated memories
- Returns error: "Cannot delete timeline with existing memories"

## Frontend Hooks

### Query Hooks

#### `useTimelines(options?)`

Fetch all timelines with optional pagination.

```typescript
import { useTimelines } from "@/hooks/use-timeline";

function MyComponent() {
  const { data, isLoading, error } = useTimelines({
    limit: 10,
    offset: 0,
  });

  return (
    <div>
      {data?.map((timeline) => (
        <div key={timeline.id}>{timeline.name}</div>
      ))}
    </div>
  );
}
```

#### `useTimeline(id)`

Fetch a single timeline by ID.

```typescript
import { useTimeline } from "@/hooks/use-timeline";

function TimelineDetail({ timelineId }: { timelineId: string }) {
  const { data: timeline, isLoading } = useTimeline(timelineId);

  if (isLoading) return <div>Loading...</div>;

  return <div>{timeline?.name}</div>;
}
```

#### `useTimelineBySlug(slug)`

Fetch a single timeline by its slug.

```typescript
import { useTimelineBySlug } from "@/hooks/use-timeline";

function TimelinePage({ slug }: { slug: string }) {
  const { data: timeline, isLoading } = useTimelineBySlug(slug);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{timeline?.name}</h1>
      <p>{timeline?.description}</p>
    </div>
  );
}
```

#### `useTimelinesWithMemoryCounts(options?)`

Fetch all timelines with their memory counts.

```typescript
import { useTimelinesWithMemoryCounts } from "@/hooks/use-timeline";

function TimelineList() {
  const { data: timelines } = useTimelinesWithMemoryCounts({
    limit: 20,
  });

  return (
    <div>
      {timelines?.map((timeline) => (
        <div key={timeline.id}>
          <h3>{timeline.name}</h3>
          <span>Memories: {timeline.memory_count}</span>
        </div>
      ))}
    </div>
  );
}
```

#### `useTimelineWithMemoryCount(id)`

Fetch a single timeline with its memory count.

```typescript
import { useTimelineWithMemoryCount } from "@/hooks/use-timeline";

function TimelineStats({ timelineId }: { timelineId: string }) {
  const { data } = useTimelineWithMemoryCount(timelineId);

  return (
    <div>
      <h2>{data?.name}</h2>
      <p>Total memories: {data?.memory_count}</p>
    </div>
  );
}
```

#### `useTimelineCount()`

Get the total count of all timelines.

```typescript
import { useTimelineCount } from "@/hooks/use-timeline";

function TimelineCounter() {
  const { data } = useTimelineCount();

  return <div>Total Timelines: {data?.count}</div>;
}
```

### Mutation Hooks

#### `useCreateTimeline()`

Create a new timeline.

```typescript
import { useCreateTimeline } from "@/hooks/use-timeline";

function CreateTimelineButton() {
  const createTimeline = useCreateTimeline();

  const handleCreate = async () => {
    try {
      const newTimeline = await createTimeline.mutateAsync({
        name: "Family Memories",
        description: "A collection of family moments",
        slug: "family-memories",
      });

      console.log("Created:", newTimeline);
    } catch (error) {
      console.error("Failed:", error);
    }
  };

  return (
    <button onClick={handleCreate} disabled={createTimeline.isPending}>
      {createTimeline.isPending ? "Creating..." : "Create Timeline"}
    </button>
  );
}
```

#### `useUpdateTimeline()`

Update an existing timeline.

```typescript
import { useUpdateTimeline } from "@/hooks/use-timeline";

function UpdateTimelineButton({ timelineId }: { timelineId: string }) {
  const updateTimeline = useUpdateTimeline();

  const handleUpdate = async () => {
    try {
      const updated = await updateTimeline.mutateAsync({
        id: timelineId,
        name: "Updated Timeline Name",
        description: "New description",
      });

      console.log("Updated:", updated);
    } catch (error) {
      console.error("Failed:", error);
    }
  };

  return (
    <button onClick={handleUpdate} disabled={updateTimeline.isPending}>
      Update
    </button>
  );
}
```

#### `useDeleteTimeline()`

Delete a timeline.

```typescript
import { useDeleteTimeline } from "@/hooks/use-timeline";

function DeleteTimelineButton({ timelineId }: { timelineId: string }) {
  const deleteTimeline = useDeleteTimeline();

  const handleDelete = async () => {
    if (!confirm("Are you sure?")) return;

    try {
      await deleteTimeline.mutateAsync({ id: timelineId });
      console.log("Deleted successfully");
    } catch (error) {
      console.error("Failed:", error);
    }
  };

  return (
    <button onClick={handleDelete} disabled={deleteTimeline.isPending}>
      Delete
    </button>
  );
}
```

#### `useTimelineMutations()`

Combined hook for all mutation operations.

```typescript
import { useTimelineMutations } from "@/hooks/use-timeline";

function TimelineManager() {
  const {
    createTimeline,
    updateTimeline,
    deleteTimeline,
    isLoading,
    isError,
    error,
  } = useTimelineMutations();

  // Use any of the mutations
  const handleCreate = () => {
    createTimeline.mutateAsync({
      name: "New Timeline",
      description: "Description",
      slug: "new-timeline",
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

- **Create**: Invalidates `getAll`, `getAllWithMemoryCounts`, and `getCount`
- **Update**: Invalidates `getById`, `getBySlug`, `getAll`, `getAllWithMemoryCounts`, and `getWithMemoryCount`
- **Delete**: Invalidates `getAll`, `getAllWithMemoryCounts`, and `getCount`

This ensures your UI always shows the latest data without manual refetching.

## Error Handling

All procedures throw descriptive errors that can be caught and displayed:

```typescript
try {
  await createTimeline.mutateAsync({ ... });
} catch (error) {
  // Error will include helpful message like:
  // "A timeline with this slug already exists"
  // "Cannot delete timeline with existing memories"
  console.error(error.message);
}
```

## Validation

The backend validates all inputs using Zod schemas:

- **name**: Required, minimum 1 character
- **description**: Required, minimum 1 character
- **slug**: Required, must match pattern `^[a-z0-9-]+$` (lowercase alphanumeric with hyphens), must be unique
- **id**: Must be a valid UUID (for updates/deletes)

## Special Features

### Slug Uniqueness

The `create` and `update` operations check for slug uniqueness:

```typescript
// This will fail if 'my-timeline' already exists
await createTimeline.mutateAsync({
  name: "My Timeline",
  description: "Description",
  slug: "my-timeline",
});
```

### Delete Protection

Timelines with associated memories cannot be deleted:

```typescript
// This will fail if timeline has memories
await deleteTimeline.mutateAsync({ id: "timeline-with-memories" });
// Error: "Cannot delete timeline with existing memories. Please delete all memories first."
```

### Auto-generated Slug Helper

Example utility function to generate slugs from names:

```typescript
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Usage
const slug = generateSlug("My Family Vacation 2024");
// Result: "my-family-vacation-2024"
```

## Complete Example

See `src/components/timeline-example.tsx` for complete working examples including:

- Displaying lists of timelines
- Creating new timelines with a form (including auto-slug generation)
- Updating existing timelines
- Deleting timelines with confirmation and error handling
- Showing timelines with memory counts
- Pagination and filtering

## Files Created

1. **Backend Router**: `src/server/routers/timeline.ts`

   - Contains all tRPC procedures for CRUD operations

2. **Main Router Update**: `src/server/routers/_app.ts`

   - Registers the timeline router with the main app router

3. **Frontend Hooks**: `src/hooks/use-timeline.ts`

   - React hooks wrapping tRPC calls with automatic cache management

4. **Example Components**: `src/components/timeline-example.tsx`
   - Reference implementations showing how to use the hooks

## Type Safety

All operations are fully type-safe thanks to:

- TypeScript types generated from Supabase schema (`src/types/supabase.ts`)
- tRPC's end-to-end type inference
- Zod validation schemas

The frontend hooks will have full autocomplete and type checking for all timeline fields.

## Common Patterns

### Creating a Timeline with Validation

```typescript
function CreateTimelineForm() {
  const createTimeline = useCreateTimeline();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createTimeline.mutateAsync({
        name,
        description,
        slug,
      });

      // Success - clear form
      setName("");
      setDescription("");
      setSlug("");
    } catch (error: any) {
      // Show error to user
      alert(error.message);
    }
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

### Displaying Timeline with Memory Count

```typescript
function TimelineCard({ timelineId }: { timelineId: string }) {
  const { data, isLoading } = useTimelineWithMemoryCount(timelineId);

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h2>{data?.name}</h2>
      <p>{data?.description}</p>
      <span>Contains {data?.memory_count} memories</span>
    </div>
  );
}
```

### Fetching Timeline by URL Slug

```typescript
function TimelineBySlugPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { data: timeline, isLoading } = useTimelineBySlug(slug as string);

  if (isLoading) return <div>Loading...</div>;
  if (!timeline) return <div>Timeline not found</div>;

  return <TimelineView timeline={timeline} />;
}
```

## Next Steps

To use these operations in your application:

1. Import the hooks you need from `@/hooks/use-timeline`
2. Use them in your React components
3. Handle loading/error states appropriately
4. Enjoy automatic cache invalidation and type safety!

For more examples, see `src/components/timeline-example.tsx`.
