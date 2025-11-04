import { z } from 'zod';
import { procedure, router } from '../trpc';
import { MemoryService } from '../services/memory.service';

// Initialize service
const memoryService = new MemoryService();

// Input validation schemas
const createMemorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  image_url: z.string().url('Must be a valid URL'),
  date_of_event: z.string(), // ISO date string
  timeline_id: z.string().uuid('Must be a valid timeline ID'),
});

const updateMemorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  image_url: z.string().url().optional(),
  date_of_event: z.string().optional(),
  timeline_id: z.string().uuid().optional(),
});

const deleteMemorySchema = z.object({
  id: z.string().uuid(),
});

const getMemorySchema = z.object({
  id: z.string().uuid(),
});

const getMemoriesByTimelineSchema = z.object({
  timeline_id: z.string().uuid(),
  limit: z.number().positive().optional(),
  offset: z.number().nonnegative().optional(),
});

export const memoryRouter = router({
  // Get all memories (with optional pagination)
  getAll: procedure
    .input(
      z.object({
        limit: z.number().positive().optional(),
        offset: z.number().nonnegative().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return memoryService.getAll(input || undefined);
    }),

  // Get a single memory by ID
  getById: procedure
    .input(getMemorySchema)
    .query(async ({ input }) => {
      return memoryService.getById(input.id);
    }),

  // Get memories by timeline ID
  getByTimelineId: procedure
    .input(getMemoriesByTimelineSchema)
    .query(async ({ input }) => {
      const { timeline_id, ...options } = input;
      return memoryService.getByTimelineId(timeline_id, options);
    }),

  // Create a new memory
  create: procedure
    .input(createMemorySchema)
    .mutation(async ({ input }) => {
      return memoryService.create(input);
    }),

  // Update an existing memory
  update: procedure
    .input(updateMemorySchema)
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      return memoryService.update(id, updateData);
    }),

  // Delete a memory
  delete: procedure
    .input(deleteMemorySchema)
    .mutation(async ({ input }) => {
      return memoryService.delete(input.id);
    }),

  // Get memory count by timeline
  getCountByTimelineId: procedure
    .input(z.object({ timeline_id: z.string().uuid() }))
    .query(async ({ input }) => {
      const count = await memoryService.getCountByTimelineId(input.timeline_id);
      return { count };
    }),
});

