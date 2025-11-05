# Architecture Documentation

This document provides a comprehensive overview of the Memory Lane application architecture, data flow, and technical decisions.

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Data Flow](#data-flow)
3. [Project Structure](#project-structure)
4. [Core Technologies](#core-technologies)
5. [Authentication Flow](#authentication-flow)
6. [File Upload Flow](#file-upload-flow)
7. [State Management](#state-management)
8. [API Layer (tRPC)](#api-layer-trpc)
9. [Database Schema](#database-schema)
10. [Component Architecture](#component-architecture)
11. [Performance Optimizations](#performance-optimizations)
12. [Error Handling](#error-handling)

## High-Level Architecture

Memory Lane follows a **full-stack TypeScript** architecture with end-to-end type safety:

```
┌─────────────────────────────────────────────────────┐
│                    Client Layer                      │
│  (Next.js Pages, React Components, React Hooks)      │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ tRPC (Type-safe API calls)
                   │
┌──────────────────┴──────────────────────────────────┐
│                   Server Layer                       │
│     (tRPC Routers, Service Classes, Validation)      │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Supabase Client
                   │
┌──────────────────┴──────────────────────────────────┐
│                  Database Layer                      │
│    (PostgreSQL via Supabase, Storage, Auth)          │
└──────────────────────────────────────────────────────┘
```

## Data Flow

### Timeline/Memory CRUD Operations

```
User Action
    ↓
Component (onClick/onSubmit)
    ↓
Custom Hook (use-timeline.ts / use-memory.ts)
    ↓
tRPC Client Call
    ↓
tRPC Router (timeline.ts / memory.ts)
    ↓
Service Class (TimelineService / MemoryService)
    ↓
Supabase Client
    ↓
PostgreSQL Database
    ↓
Response flows back through the same layers
    ↓
TanStack Query caches & updates UI
```

### Example: Creating a Memory

```typescript
// 1. User clicks "Create Memory" button
// Component: create-memory-form.tsx
<form onSubmit={handleSubmit}>

// 2. Form submission handler
const handleSubmit = async (e) => {
  // Upload image first
  const uploadResult = await upload(formData.image);

  // 3. Call tRPC mutation
  await createMemory.mutateAsync({
    timeline_id: timelineId,
    name: formData.name,
    description: formData.description,
    date_of_event: formData.date_of_event,
    image_url: uploadResult.publicUrl,
    image_key: uploadResult.path,
  });
};

// 4. tRPC router receives the call
// server/routers/memory.ts
create: procedure
  .input(createMemorySchema)
  .mutation(async ({ input, ctx }) => {
    const memoryService = new MemoryService(ctx.accessToken);
    return memoryService.create(input);
  });

// 5. Service handles business logic
// server/services/memory.service.ts
async create(input: CreateMemoryInput): Promise<Memory> {
  const { data, error } = await this.supabase
    .from('memory')
    .insert({ ...input })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// 6. TanStack Query invalidates cache
onSuccess: () => {
  utils.memory.getAll.invalidate();
  utils.memory.getByTimelineId.invalidate();
}
```

## Project Structure

### Frontend Organization

```
src/
├── components/
│   ├── layout/              # App-wide layout components
│   │   ├── base-layout.tsx  # Main layout wrapper
│   │   ├── navbar.tsx       # Top navigation
│   │   ├── footer.tsx       # Footer component
│   │   └── app-sidebar.tsx  # Collapsible sidebar
│   │
│   ├── timeline/            # Timeline-specific components
│   │   ├── timeline-header.tsx
│   │   ├── timeline-stats.tsx
│   │   └── timeline-error-state.tsx
│   │
│   ├── memory/              # Memory-specific components
│   │   ├── memory-card.tsx        # Main memory card wrapper
│   │   ├── memory-card-view.tsx   # Read-only view
│   │   ├── memory-card-edit.tsx   # Edit mode
│   │   ├── create-memory-form.tsx # Creation form
│   │   └── memories-section.tsx   # List of memories
│   │
│   ├── auth/                # Authentication components
│   │   ├── login-form.tsx
│   │   └── protected-route.tsx
│   │
│   ├── shared/              # Reusable components
│   │   ├── action-dropdown.tsx    # Edit/Delete dropdown
│   │   ├── textarea-field.tsx     # Form textarea
│   │   ├── delete-confirmation-dialog.tsx
│   │   └── theme-toggle.tsx
│   │
│   ├── ui/                  # UI primitives (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── skeletons.tsx    # Loading states
│   │   └── ...
│   │
│   └── error-boundary.tsx   # Error handling wrapper
│
├── hooks/                   # Custom React hooks
│   ├── use-timeline.ts      # Timeline CRUD operations
│   ├── use-memory.ts        # Memory CRUD operations
│   ├── use-upload.ts        # File upload logic
│   ├── use-image-upload.ts  # Image upload helper
│   └── use-mobile.ts        # Mobile detection
│
├── lib/                     # Utility functions
│   ├── date-utils.ts        # Date formatting (dayjs)
│   ├── validation.ts        # Form validation (Zod)
│   ├── error-utils.ts       # Error handling utilities
│   ├── auth-utils.ts        # Auth helper functions
│   ├── trpc.ts              # tRPC client setup
│   └── utils.ts             # General utilities (cn)
│
├── contexts/                # React Context providers
│   ├── auth-context.tsx     # Authentication state
│   └── theme-provider.tsx   # Theme (dark/light) state
│
├── types/                   # TypeScript definitions
│   ├── supabase.ts          # Generated database types
│   └── components.ts        # Shared component types
│
└── server/                  # Server-side code
    ├── routers/             # tRPC API routers
    │   ├── _app.ts          # Root router
    │   ├── timeline.ts      # Timeline routes
    │   └── memory.ts        # Memory routes
    │
    ├── services/            # Business logic layer
    │   ├── timeline.service.ts
    │   ├── memory.service.ts
    │   └── upload.service.ts
    │
    └── trpc.ts              # tRPC server setup
```

## Core Technologies

### Next.js (Pages Router)

**Why Pages Router?**

- Simpler mental model for this application size
- File-based routing
- API routes for tRPC
- Mature ecosystem

**Key Pages:**

- `/` - Home page (timeline list)
- `/timeline/create` - Create timeline
- `/timeline/[slug]` - Timeline detail & memories
- `/login` - Authentication

### tRPC

**Benefits:**

- End-to-end type safety
- No API client boilerplate
- Auto-completion in IDE
- Runtime type validation with Zod

**Router Structure:**

```typescript
// server/routers/_app.ts
export const appRouter = router({
  timeline: timelineRouter, // Timeline CRUD
  memory: memoryRouter, // Memory CRUD
});

export type AppRouter = typeof appRouter;
```

### Supabase

**Services Used:**

1. **PostgreSQL Database** - Data storage
2. **Auth** - User authentication
3. **Storage** - Image uploads
4. **Row Level Security** - Data access control

**Connection Pattern:**

```typescript
// Service classes create authenticated clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    global: {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {},
    },
  }
);
```

## Authentication Flow

```
1. User visits /login
   ↓
2. Enters credentials
   ↓
3. Supabase Auth validates
   ↓
4. Session stored in browser
   ↓
5. AuthContext provides user state globally
   ↓
6. Protected routes check user existence
   ↓
7. Access token passed to tRPC for API calls
```

### Authentication Context

```typescript
// contexts/auth-context.tsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    setUser(session?.user ?? null);
  });

  return (
    <AuthContext.Provider value={{ user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Protected Routes

```typescript
// components/auth/protected-route.tsx
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <Loader />;
  if (!user) {
    router.push("/login");
    return null;
  }

  return children;
};
```

## File Upload Flow

```
1. User selects image
   ↓
2. Client-side validation (size, type)
   ↓
3. POST /api/upload with FormData
   ↓
4. Server parses multipart form data (Formidable)
   ↓
5. Server validates file & uploads to Supabase Storage
   ↓
6. Returns public URL & storage key
   ↓
7. Create/Update memory with image references
```

### Upload Implementation

The upload system uses **Formidable**, a robust Node.js library for parsing form data, especially multipart/form-data which is used for file uploads.

**Why Formidable?**

- ✅ **Production-Ready** - Battle-tested library used by millions
- ✅ **Streaming Parser** - Memory-efficient for large files
- ✅ **Built-in Validation** - File size limits and type checking
- ✅ **Security** - Prevents malicious file uploads
- ✅ **Performance** - Fast, non-blocking I/O
- ✅ **Flexibility** - Supports multiple files and fields
- ✅ **Type Safety** - TypeScript definitions available

**Alternative Considered:** Next.js built-in body parser doesn't support multipart/form-data, so Formidable fills this critical gap.

```typescript
// pages/api/upload.ts
import formidable from "formidable";
import { createReadStream } from "fs";

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1. Parse multipart form data with Formidable
  const form = formidable({
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
    keepExtensions: true,
    filter: (part) => {
      // Only accept images
      return part.mimetype?.startsWith("image/") || false;
    },
  });

  const { files } = await form.parse(req);
  const file = files.file?.[0];

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // 2. Validate file
  if (!file.mimetype?.startsWith("image/")) {
    return res.status(400).json({ error: "File must be an image" });
  }

  // 3. Generate unique filename
  const timestamp = Date.now();
  const filename = `${timestamp}-${file.originalFilename}`;

  // 4. Upload to Supabase Storage using file stream
  const fileStream = createReadStream(file.filepath);
  const { data, error } = await supabase.storage
    .from("memory-images")
    .upload(filename, fileStream, {
      contentType: file.mimetype,
    });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // 5. Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("memory-images").getPublicUrl(filename);

  return res.json({
    success: true,
    data: {
      publicUrl,
      path: filename,
    },
  });
}
```

### Upload Progress Tracking

The frontend tracks upload progress using XMLHttpRequest:

```typescript
// hooks/use-upload.ts
const xhr = new XMLHttpRequest();

xhr.upload.addEventListener("progress", (e) => {
  if (e.lengthComputable) {
    const progress = Math.round((e.loaded / e.total) * 100);
    setProgress(progress);
  }
});

xhr.open("POST", "/api/upload");
xhr.send(formData);
```

## State Management

### Global State (React Context)

1. **Authentication** - User session, login/logout
2. **Theme** - Dark/light mode preference

### Server State (TanStack Query)

- Timeline data
- Memory data
- Automatic caching
- Optimistic updates
- Background refetching

### Local Component State

- Form inputs
- UI toggles (modals, dropdowns)
- Temporary editing state

## API Layer (tRPC)

### Procedure Types

```typescript
// Query - Read operations
procedure.query(async ({ input, ctx }) => {
  // Return data
});

// Mutation - Write operations
procedure.mutation(async ({ input, ctx }) => {
  // Modify data
});
```

### Input Validation

```typescript
// All inputs validated with Zod
const createMemorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  image_url: z.string().url("Must be a valid URL"),
  date_of_event: z.string(),
  timeline_id: z.string().uuid(),
});

create: procedure
  .input(createMemorySchema) // Auto-validates
  .mutation(async ({ input }) => {
    // input is type-safe and validated
  });
```

## Database Schema

### Tables

#### timeline

```sql
CREATE TABLE timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### memory

```sql
CREATE TABLE memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timeline_id UUID NOT NULL REFERENCES timeline(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_key TEXT NOT NULL,
  date_of_event DATE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Row Level Security (RLS)

```sql
-- Users can only read their own data
CREATE POLICY "Users can view own timelines"
  ON timeline FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only modify their own data
CREATE POLICY "Users can update own timelines"
  ON timeline FOR UPDATE
  USING (auth.uid() = user_id);
```

## Component Architecture

### Component Patterns

1. **Container/Presentational Pattern**

   - Container: Handles data fetching & logic
   - Presentational: Pure UI rendering

2. **Compound Components**

   - Example: `Card`, `CardHeader`, `CardContent`

3. **Render Props (rare)**
   - Error boundaries with custom fallbacks

### Component Optimization

```typescript
// 1. React.memo for expensive renders
export const MemoryCardView = memo(({ memory, actions }) => {
  // Only re-renders if props change
});

// 2. useCallback for stable references
const handleDelete = useCallback(() => {
  deleteMemory.mutate({ id });
}, [id]);

// 3. useMemo for computed values
const sortedMemories = useMemo(() => {
  return memories.sort(compareDates);
}, [memories, sortOrder]);
```

## Performance Optimizations

### 1. Database Query Optimization

**Problem:** N+1 query when fetching timelines with memory counts

**Before:**

```typescript
// Fetches timelines, then counts for each (N+1)
const timelines = await getTimelines();
for (const timeline of timelines) {
  const count = await getMemoryCount(timeline.id);
}
```

**After:**

```typescript
// Single query with JOIN
const timelines = await supabase.from("timeline").select("*, memory(count)");
```

### 2. Component Memoization

- All skeleton loaders memoized
- Memory card view/edit components memoized
- Prevents unnecessary re-renders

### 3. Image Optimization

- Next.js Image component for automatic optimization
- Lazy loading for off-screen images
- Responsive image sizing

### 4. Code Splitting

- Dynamic imports for heavy modals
- Route-based splitting (automatic with Next.js)

## Error Handling

### Error Boundary

```typescript
// Catches React errors in component tree
<ErrorBoundary fallback={<ErrorUI />}>
  <App />
</ErrorBoundary>
```

### Centralized Error Logging

```typescript
// lib/error-utils.ts
export function logError(error: unknown, context?: object) {
  console.error("[Error]", formatErrorMessage(error));
  // In production, send to error tracking service
  // e.g., Sentry, LogRocket, etc.
}
```

### User-Friendly Messages

```typescript
try {
  await createMemory.mutateAsync(data);
} catch (error) {
  logError(error, { context: "Memory creation" });
  toast.error("Failed to create memory. Please try again.");
}
```

## Best Practices Implemented

1. ✅ **Type Safety** - Full TypeScript coverage
2. ✅ **Code Reusability** - Shared components & hooks
3. ✅ **Performance** - Optimized queries & memoization
4. ✅ **Accessibility** - ARIA labels, keyboard navigation
5. ✅ **Error Handling** - Boundaries & user feedback
6. ✅ **Code Organization** - Clear folder structure
7. ✅ **Documentation** - Comprehensive docs & comments
8. ✅ **Testing Ready** - Separation of concerns for easy testing

## Future Enhancements

Potential improvements for scaling:

1. **Testing** - Unit, integration, E2E tests
2. **CI/CD** - Automated deployments
3. **Monitoring** - Error tracking (Sentry), analytics
4. **SEO** - Dynamic meta tags, sitemap
5. **Internationalization** - Multi-language support
6. **Real-time** - WebSocket updates for collaborative editing
7. **Advanced Features** - Timeline templates, sharing controls, export

## Conclusion

Memory Lane demonstrates modern full-stack TypeScript development with:

- Type-safe APIs (tRPC)
- Robust authentication (Supabase)
- Performant data fetching (TanStack Query)
- Clean architecture (Services, Routers, Components)
- Professional UX (Responsive, accessible, error-handled)

The codebase is maintainable, scalable, and follows industry best practices.
