import { z } from 'zod';
import { procedure, router } from '../trpc';
import { TimelineService } from '../services/timeline.service';
import { MemoryService } from '../services/memory.service';

// Input validation schemas
const createTimelineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
});

const updateTimelineSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens').optional(),
});

const deleteTimelineSchema = z.object({
  id: z.string().uuid(),
});

const getTimelineSchema = z.object({
  id: z.string().uuid(),
});

const getTimelineBySlugSchema = z.object({
  slug: z.string().min(1),
});

export const timelineRouter = router({
  // Get all timelines (with optional pagination)
  getAll: procedure
    .input(
      z.object({
        limit: z.number().positive().optional(),
        offset: z.number().nonnegative().optional(),
      }).optional()
    )
    .query(async ({ input, ctx }) => {
      const timelineService = new TimelineService(ctx.accessToken);
      return timelineService.getAll(input || undefined);
    }),

  // Get a single timeline by ID
  getById: procedure
    .input(getTimelineSchema)
    .query(async ({ input, ctx }) => {
      const timelineService = new TimelineService(ctx.accessToken);
      return timelineService.getById(input.id);
    }),

  // Get a single timeline by slug
  getBySlug: procedure
    .input(getTimelineBySlugSchema)
    .query(async ({ input, ctx }) => {
      const timelineService = new TimelineService(ctx.accessToken);
      return timelineService.getBySlug(input.slug);
    }),

  // Create a new timeline
  create: procedure
    .input(createTimelineSchema)
    .mutation(async ({ input, ctx }) => {
      const timelineService = new TimelineService(ctx.accessToken);
      return timelineService.create(input);
    }),

  // Update an existing timeline
  update: procedure
    .input(updateTimelineSchema)
    .mutation(async ({ input, ctx }) => {
      const timelineService = new TimelineService(ctx.accessToken);
      const { id, ...updateData } = input;
      return timelineService.update(id, updateData);
    }),

  // Delete a timeline
  delete: procedure
    .input(deleteTimelineSchema)
    .mutation(async ({ input, ctx }) => {
      const timelineService = new TimelineService(ctx.accessToken);
      return timelineService.delete(input.id);
    }),

  // Get timeline count
  getCount: procedure
    .query(async ({ ctx }) => {
      const timelineService = new TimelineService(ctx.accessToken);
      const count = await timelineService.getCount();
      return { count };
    }),

  // Get timeline with memories
  getWithMemories: procedure
    .input(getTimelineSchema)
    .query(async ({ input, ctx }) => {
      const timelineService = new TimelineService(ctx.accessToken);
      const memoryService = new MemoryService(ctx.accessToken);
      const timeline = await timelineService.getById(input.id);
      const memories = await memoryService.getByTimelineId(input.id);

      return {
        ...timeline,
        memories,
      }
    }),

  // Get timeline with memory count
  getWithMemoryCount: procedure
    .input(getTimelineSchema)
    .query(async ({ input, ctx }) => {
      const timelineService = new TimelineService(ctx.accessToken);
      return timelineService.getWithMemoryCount(input.id);
    }),

  // Get all timelines with their memory counts
  getAllWithMemoryCounts: procedure
    .input(
      z.object({
        limit: z.number().positive().optional(),
        offset: z.number().nonnegative().optional(),
      }).optional()
    )
    .query(async ({ input, ctx }) => {
      const timelineService = new TimelineService(ctx.accessToken);
      return timelineService.getAllWithMemoryCounts(input || undefined);
    }),
});

