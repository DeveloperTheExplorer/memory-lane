# Complete CRUD Implementation Guide

## Overview

This document provides a comprehensive guide to the Memory Lane application's CRUD operations for both **Memory** and **Timeline** entities.

## Architecture

### Tech Stack

- **Backend**: tRPC (Type-safe API)
- **Frontend**: React with custom hooks
- **Database**: Supabase (PostgreSQL)
- **Validation**: Zod schemas
- **Type Safety**: TypeScript end-to-end

### Data Model

```
Timeline (1) ----< (many) Memory

Timeline:
  - id: UUID
  - name: string
  - description: string
  - slug: string (unique)
  - created_at: timestamp
  - updated_at: timestamp

Memory:
  - id: UUID
  - name: string
  - description: string
  - image_url: string
  - date_of_event: date
  - timeline_id: UUID (foreign key)
  - created_at: timestamp
  - updated_at: timestamp
```

## Files Structure

```
src/
├── server/
│   ├── routers/
│   │   ├── _app.ts           # Main tRPC router (registers all sub-routers)
│   │   ├── memory.ts         # Memory CRUD operations
│   │   └── timeline.ts       # Timeline CRUD operations
│   └── trpc.ts               # tRPC initialization
├── hooks/
│   ├── use-memory.ts         # Memory React hooks
│   └── use-timeline.ts       # Timeline React hooks
├── components/
│   ├── timeline-example.tsx  # Timeline usage examples
│   └── [memory-example.tsx]  # Memory usage examples (deleted by user)
└── types/
    └── supabase.ts           # Generated database types

Documentation:
├── MEMORY_CRUD_DOCUMENTATION.md
├── MEMORY_CRUD_SUMMARY.md
├── TIMELINE_CRUD_DOCUMENTATION.md
├── TIMELINE_CRUD_SUMMARY.md
└── COMPLETE_CRUD_IMPLEMENTATION.md (this file)
```

## Quick Start

### 1. Import the Hooks

```typescript
// Memory hooks
import {
  useMemories,
  useMemory,
  useMemoriesByTimeline,
  useCreateMemory,
  useUpdateMemory,
  useDeleteMemory,
} from "@/hooks/use-memory";

// Timeline hooks
import {
  useTimelines,
  useTimeline,
  useTimelineBySlug,
  useCreateTimeline,
  useUpdateTimeline,
  useDeleteTimeline,
} from "@/hooks/use-timeline";
```

### 2. Fetch Data

```typescript
function MyComponent() {
  // Get all timelines with memory counts
  const { data: timelines } = useTimelinesWithMemoryCounts();

  // Get memories for a specific timeline
  const { data: memories } = useMemoriesByTimeline("timeline-id");

  return (
    <div>
      {timelines?.map((timeline) => (
        <div key={timeline.id}>
          <h2>{timeline.name}</h2>
          <p>{timeline.memory_count} memories</p>
          {/* Show memories */}
        </div>
      ))}
    </div>
  );
}
```

### 3. Create Data

```typescript
function CreateForms() {
  const createTimeline = useCreateTimeline();
  const createMemory = useCreateMemory();

  const handleCreateTimeline = async () => {
    const timeline = await createTimeline.mutateAsync({
      name: "My Timeline",
      description: "A collection of memories",
      slug: "my-timeline",
    });

    // Now create a memory in this timeline
    await createMemory.mutateAsync({
      name: "First Memory",
      description: "A wonderful moment",
      image_url: "https://example.com/image.jpg",
      date_of_event: "2024-11-04",
      timeline_id: timeline.id,
    });
  };

  return <button onClick={handleCreateTimeline}>Create Timeline & Memory</button>;
}
```

### 4. Update Data

```typescript
function UpdateExample({ timelineId, memoryId }: Props) {
  const updateTimeline = useUpdateTimeline();
  const updateMemory = useUpdateMemory();

  const handleUpdate = async () => {
    // Update timeline
    await updateTimeline.mutateAsync({
      id: timelineId,
      name: "Updated Name",
    });

    // Update memory
    await updateMemory.mutateAsync({
      id: memoryId,
      description: "Updated description",
    });
  };

  return <button onClick={handleUpdate}>Update</button>;
}
```

### 5. Delete Data

```typescript
function DeleteExample({ timelineId, memoryId }: Props) {
  const deleteMemory = useDeleteMemory();
  const deleteTimeline = useDeleteTimeline();

  const handleDelete = async () => {
    // Must delete memories first
    await deleteMemory.mutateAsync({ id: memoryId });

    // Then delete timeline
    await deleteTimeline.mutateAsync({ id: timelineId });
  };

  return <button onClick={handleDelete}>Delete All</button>;
}
```

## Complete API Reference

### Timeline Operations

| Operation                      | Hook                              | Type     |
| ------------------------------ | --------------------------------- | -------- |
| Get all timelines              | `useTimelines()`                  | Query    |
| Get timeline by ID             | `useTimeline(id)`                 | Query    |
| Get timeline by slug           | `useTimelineBySlug(slug)`         | Query    |
| Get timelines with counts      | `useTimelinesWithMemoryCounts()`  | Query    |
| Get timeline with count        | `useTimelineWithMemoryCount(id)`  | Query    |
| Get timeline count             | `useTimelineCount()`              | Query    |
| Create timeline                | `useCreateTimeline()`             | Mutation |
| Update timeline                | `useUpdateTimeline()`             | Mutation |
| Delete timeline                | `useDeleteTimeline()`             | Mutation |
| All timeline mutations         | `useTimelineMutations()`          | Utility  |

### Memory Operations

| Operation                      | Hook                              | Type     |
| ------------------------------ | --------------------------------- | -------- |
| Get all memories               | `useMemories()`                   | Query    |
| Get memory by ID               | `useMemory(id)`                   | Query    |
| Get memories by timeline       | `useMemoriesByTimeline(id)`       | Query    |
| Get memory count by timeline   | `useMemoryCountByTimeline(id)`    | Query    |
| Create memory                  | `useCreateMemory()`               | Mutation |
| Update memory                  | `useUpdateMemory()`               | Mutation |
| Delete memory                  | `useDeleteMemory()`               | Mutation |
| All memory mutations           | `useMemoryMutations()`            | Utility  |

## Common Patterns

### Pattern 1: Timeline Detail Page

```typescript
function TimelineDetailPage({ slug }: { slug: string }) {
  // Get timeline by slug
  const { data: timeline, isLoading } = useTimelineBySlug(slug);

  // Get memories for this timeline
  const { data: memories } = useMemoriesByTimeline(timeline?.id || "", {
    limit: 20,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!timeline) return <div>Timeline not found</div>;

  return (
    <div>
      <h1>{timeline.name}</h1>
      <p>{timeline.description}</p>

      <div className="memories-grid">
        {memories?.map((memory) => (
          <MemoryCard key={memory.id} memory={memory} />
        ))}
      </div>
    </div>
  );
}
```

### Pattern 2: Dashboard with Statistics

```typescript
function Dashboard() {
  const { data: timelines } = useTimelinesWithMemoryCounts({ limit: 10 });
  const { data: timelineCount } = useTimelineCount();

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stats">
        <StatCard label="Total Timelines" value={timelineCount?.count} />
        <StatCard
          label="Total Memories"
          value={timelines?.reduce((sum, t) => sum + t.memory_count, 0)}
        />
      </div>

      <div className="timeline-list">
        {timelines?.map((timeline) => (
          <TimelineCard key={timeline.id} timeline={timeline} />
        ))}
      </div>
    </div>
  );
}
```

### Pattern 3: Create Timeline with First Memory

```typescript
function CreateTimelineWizard() {
  const createTimeline = useCreateTimeline();
  const createMemory = useCreateMemory();
  const [step, setStep] = useState(1);
  const [timelineData, setTimelineData] = useState({});
  const [memoryData, setMemoryData] = useState({});

  const handleSubmit = async () => {
    // Step 1: Create timeline
    const timeline = await createTimeline.mutateAsync(timelineData);

    // Step 2: Create first memory
    await createMemory.mutateAsync({
      ...memoryData,
      timeline_id: timeline.id,
    });

    // Success!
    router.push(`/timeline/${timeline.slug}`);
  };

  return (
    <WizardForm>
      {step === 1 && <TimelineForm onChange={setTimelineData} />}
      {step === 2 && <MemoryForm onChange={setMemoryData} />}
      {step === 3 && <button onClick={handleSubmit}>Create</button>}
    </WizardForm>
  );
}
```

### Pattern 4: Memory Gallery with Timeline Selector

```typescript
function MemoryGallery() {
  const [selectedTimelineId, setSelectedTimelineId] = useState<string>("");
  const { data: timelines } = useTimelines();
  const { data: memories } = useMemoriesByTimeline(selectedTimelineId);

  return (
    <div>
      <select
        value={selectedTimelineId}
        onChange={(e) => setSelectedTimelineId(e.target.value)}
      >
        <option value="">All Memories</option>
        {timelines?.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <div className="gallery">
        {memories?.map((memory) => (
          <img key={memory.id} src={memory.image_url} alt={memory.name} />
        ))}
      </div>
    </div>
  );
}
```

### Pattern 5: Infinite Scroll with Pagination

```typescript
function InfiniteMemoryList({ timelineId }: { timelineId: string }) {
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const { data: memories, isLoading } = useMemoriesByTimeline(timelineId, {
    limit,
    offset,
  });

  const handleLoadMore = () => {
    setOffset((prev) => prev + limit);
  };

  return (
    <div>
      {memories?.map((memory) => (
        <MemoryCard key={memory.id} memory={memory} />
      ))}

      {isLoading && <Spinner />}

      <button onClick={handleLoadMore}>Load More</button>
    </div>
  );
}
```

## Form Examples

### Timeline Form with Auto-Slug

```typescript
function TimelineForm() {
  const createTimeline = useCreateTimeline();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");

  const handleNameChange = (value: string) => {
    setName(value);
    // Auto-generate slug
    setSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createTimeline.mutateAsync({
        name,
        description,
        slug,
      });

      // Success - reset form
      setName("");
      setDescription("");
      setSlug("");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => handleNameChange(e.target.value)}
        placeholder="Timeline Name"
        required
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        required
      />

      <input
        type="text"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="url-slug"
        pattern="^[a-z0-9-]+$"
        required
      />

      <button type="submit" disabled={createTimeline.isPending}>
        {createTimeline.isPending ? "Creating..." : "Create Timeline"}
      </button>
    </form>
  );
}
```

### Memory Form with Date Picker

```typescript
function MemoryForm({ timelineId }: { timelineId: string }) {
  const createMemory = useCreateMemory();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    date_of_event: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMemory.mutateAsync({
        ...formData,
        timeline_id: timelineId,
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        image_url: "",
        date_of_event: new Date().toISOString().split("T")[0],
      });
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Memory Name"
        required
      />

      <textarea
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        placeholder="Description"
        required
      />

      <input
        type="url"
        value={formData.image_url}
        onChange={(e) =>
          setFormData({ ...formData, image_url: e.target.value })
        }
        placeholder="Image URL"
        required
      />

      <input
        type="date"
        value={formData.date_of_event}
        onChange={(e) =>
          setFormData({ ...formData, date_of_event: e.target.value })
        }
        required
      />

      <button type="submit" disabled={createMemory.isPending}>
        {createMemory.isPending ? "Adding..." : "Add Memory"}
      </button>
    </form>
  );
}
```

## Error Handling

### Handling Specific Errors

```typescript
function DeleteTimelineButton({ timelineId }: { timelineId: string }) {
  const deleteTimeline = useDeleteTimeline();

  const handleDelete = async () => {
    try {
      await deleteTimeline.mutateAsync({ id: timelineId });
      alert("Timeline deleted successfully!");
    } catch (error: any) {
      if (error.message.includes("existing memories")) {
        alert("Please delete all memories before deleting the timeline.");
      } else if (error.message.includes("slug already exists")) {
        alert("A timeline with this slug already exists.");
      } else {
        alert("An error occurred. Please try again.");
      }
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

### Global Error Handling

```typescript
function useTimelineWithErrorHandling(id: string) {
  const { data, error, isLoading } = useTimeline(id);

  useEffect(() => {
    if (error) {
      // Log to error service
      console.error("Timeline fetch error:", error);

      // Show user-friendly message
      toast.error("Failed to load timeline");
    }
  }, [error]);

  return { data, error, isLoading };
}
```

## Performance Tips

### 1. Use Memory Counts Efficiently

```typescript
// ❌ Bad: Multiple separate queries
const timelines = useTimelines();
timelines.data?.forEach((t) => {
  const { data: count } = useMemoryCountByTimeline(t.id); // Multiple queries!
});

// ✅ Good: Single query with counts
const { data: timelines } = useTimelinesWithMemoryCounts(); // One query!
```

### 2. Pagination for Large Lists

```typescript
// ❌ Bad: Load everything
const { data: allMemories } = useMemories(); // Could be thousands!

// ✅ Good: Paginate
const { data: memories } = useMemories({ limit: 20, offset: 0 });
```

### 3. Selective Cache Invalidation

```typescript
// ❌ Bad: Invalidate everything
utils.invalidate();

// ✅ Good: Selective invalidation (already built-in!)
// Hooks automatically invalidate only related queries
```

## Type Safety Examples

### Typed Form State

```typescript
import type { TablesInsert } from "@/types/supabase";

function TypedForm() {
  // ✅ Fully typed form data
  const [formData, setFormData] = useState<TablesInsert<"timeline">>({
    name: "",
    description: "",
    slug: "",
  });

  // TypeScript will enforce correct types
  const createTimeline = useCreateTimeline();
  await createTimeline.mutateAsync(formData); // Type-safe!
}
```

### Type Inference in Components

```typescript
import type { Tables } from "@/types/supabase";

type TimelineCardProps = {
  timeline: Tables<"timeline">;
};

function TimelineCard({ timeline }: TimelineCardProps) {
  // timeline is fully typed - autocomplete works!
  return (
    <div>
      <h3>{timeline.name}</h3>
      <p>{timeline.description}</p>
    </div>
  );
}
```

## Testing Guide

### Testing Hooks (Example with React Testing Library)

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { useTimeline } from "@/hooks/use-timeline";

test("fetches timeline by id", async () => {
  const { result } = renderHook(() => useTimeline("test-id"));

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  expect(result.current.data).toBeDefined();
  expect(result.current.data?.id).toBe("test-id");
});
```

## Troubleshooting

### Common Issues

1. **"Slug already exists" error**
   - Solution: Use a different slug or add a unique suffix

2. **"Cannot delete timeline with memories"**
   - Solution: Delete all memories first, then delete timeline

3. **Stale data after mutation**
   - Solution: Hooks automatically handle this; check cache invalidation

4. **TypeScript errors**
   - Solution: Ensure types are imported from `@/types/supabase`

5. **Query not refetching**
   - Solution: Check that mutations are using the provided hooks

## Next Steps

1. **Read detailed docs**:
   - `MEMORY_CRUD_DOCUMENTATION.md`
   - `TIMELINE_CRUD_DOCUMENTATION.md`

2. **Check examples**:
   - `src/components/timeline-example.tsx`

3. **Start building**:
   - Import hooks
   - Create your components
   - Enjoy type safety!

## Summary

✅ **Complete CRUD for Timeline**  
✅ **Complete CRUD for Memory**  
✅ **Type-safe end-to-end**  
✅ **Automatic cache management**  
✅ **Zod validation**  
✅ **Pagination support**  
✅ **Error handling**  
✅ **Delete protection**  
✅ **Slug management**  
✅ **Memory count aggregation**  
✅ **Zero linter errors**

**You're all set to build amazing features! 🚀**

