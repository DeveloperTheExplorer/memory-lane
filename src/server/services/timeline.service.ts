import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';
import { MemoryService } from './memory.service';

type Timeline = Database['public']['Tables']['timeline']['Row'];
type CreateTimelineInput = {
  name: string;
  description: string;
};
type UpdateTimelineInput = {
  name?: string;
  description?: string;
  slug?: string;
};

export class TimelineService {
  private supabase;
  private accessToken?: string;

  constructor(accessToken?: string) {
    this.accessToken = accessToken;
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
   * Generate a URL-friendly slug from a name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Generate a unique slug by appending a number if the slug already exists
   */
  private async generateUniqueSlug(baseName: string): Promise<string> {
    let slug = this.generateSlug(baseName);
    let counter = 1;

    // Keep checking until we find a unique slug
    while (true) {
      const { data: existing } = await this.supabase
        .from('timeline')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!existing) {
        return slug;
      }

      // Slug exists, try with a counter
      slug = `${this.generateSlug(baseName)}-${counter}`;
      counter++;
    }
  }

  async getAll(options?: { limit?: number; offset?: number }): Promise<Timeline[]> {
    let query = this.supabase
      .from('timeline')
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch timelines: ${error.message}`);
    }

    return data;
  }

  async getById(id: string): Promise<Timeline> {
    const { data, error } = await this.supabase
      .from('timeline')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch timeline: ${error.message}`);
    }

    return data;
  }

  async getBySlug(slug: string): Promise<Timeline> {
    const { data, error } = await this.supabase
      .from('timeline')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      throw new Error(`Failed to fetch timeline by slug: ${error.message}`);
    }

    return data;
  }

  async create(input: CreateTimelineInput): Promise<Timeline> {
    // Generate a unique slug from the name
    const slug = await this.generateUniqueSlug(input.name);

    const { data, error } = await this.supabase
      .from('timeline')
      .insert({
        name: input.name,
        description: input.description,
        slug: slug,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create timeline: ${error.message}`);
    }

    return data;
  }

  async update(id: string, input: UpdateTimelineInput): Promise<Timeline> {
    // If updating slug, check if new slug already exists
    if (input.slug) {
      const { data: existing } = await this.supabase
        .from('timeline')
        .select('id')
        .eq('slug', input.slug)
        .neq('id', id)
        .single();

      if (existing) {
        throw new Error('A timeline with this slug already exists');
      }
    }

    const { data, error } = await this.supabase
      .from('timeline')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update timeline: ${error.message}`);
    }

    return data;
  }

  async delete(id: string): Promise<{ success: boolean; id: string }> {
    // Check if timeline has associated memories
    const { data: memories, error: memoriesError } = await this.supabase
      .from('memory')
      .select('id')
      .eq('timeline_id', id)
      .limit(1);

    if (memoriesError) {
      throw new Error(`Failed to check timeline memories: ${memoriesError.message}`);
    }

    if (memories && memories.length > 0) {
      const memoryService = new MemoryService(this.accessToken);
      await memoryService.deleteByTimelineId(id);
    }

    const { error } = await this.supabase
      .from('timeline')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete timeline: ${error.message}`);
    }

    return { success: true, id };
  }

  async getCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('timeline')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(`Failed to count timelines: ${error.message}`);
    }

    return count || 0;
  }

  async getWithMemoryCount(id: string): Promise<Timeline & { memory_count: number }> {
    // Get timeline
    const { data: timeline, error: timelineError } = await this.supabase
      .from('timeline')
      .select('*')
      .eq('id', id)
      .single();

    if (timelineError) {
      throw new Error(`Failed to fetch timeline: ${timelineError.message}`);
    }

    // Get memory count
    const { count, error: countError } = await this.supabase
      .from('memory')
      .select('*', { count: 'exact', head: true })
      .eq('timeline_id', id);

    if (countError) {
      throw new Error(`Failed to count memories: ${countError.message}`);
    }

    return {
      ...timeline,
      memory_count: count || 0,
    };
  }

  async getAllWithMemoryCounts(
    options?: { limit?: number; offset?: number }
  ): Promise<Array<Timeline & { memory_count: number }>> {
    // Fetch timelines first
    let query = this.supabase
      .from('timeline')
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data: timelines, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch timelines: ${error.message}`);
    }

    if (!timelines || timelines.length === 0) {
      return [];
    }

    // Get memory counts for all timelines in a single query using IN clause
    // This is much more efficient than N+1 individual queries
    const timelineIds = timelines.map(t => t.id);
    
    const { data: memoryCounts, error: countError } = await this.supabase
      .from('memory')
      .select('timeline_id')
      .in('timeline_id', timelineIds);

    if (countError) {
      throw new Error(`Failed to fetch memory counts: ${countError.message}`);
    }

    // Count memories per timeline
    const countMap = new Map<string, number>();
    (memoryCounts || []).forEach((memory) => {
      const count = countMap.get(memory.timeline_id) || 0;
      countMap.set(memory.timeline_id, count + 1);
    });

    // Combine timelines with their counts
    const timelinesWithCounts = timelines.map((timeline) => ({
      ...timeline,
      memory_count: countMap.get(timeline.id) || 0,
    }));

    return timelinesWithCounts;
  }
}

