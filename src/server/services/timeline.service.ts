import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

type Timeline = Database['public']['Tables']['timeline']['Row'];
type CreateTimelineInput = {
  name: string;
  description: string;
  slug: string;
};
type UpdateTimelineInput = {
  name?: string;
  description?: string;
  slug?: string;
};

export class TimelineService {
  private supabase;

  constructor() {
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
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
    // Check if slug already exists
    const { data: existing } = await this.supabase
      .from('timeline')
      .select('id')
      .eq('slug', input.slug)
      .single();

    if (existing) {
      throw new Error('A timeline with this slug already exists');
    }

    const { data, error } = await this.supabase
      .from('timeline')
      .insert({
        name: input.name,
        description: input.description,
        slug: input.slug,
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
      throw new Error('Cannot delete timeline with existing memories. Please delete all memories first.');
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

    // Get memory counts for each timeline
    const timelinesWithCounts = await Promise.all(
      (timelines || []).map(async (timeline) => {
        const { count } = await this.supabase
          .from('memory')
          .select('*', { count: 'exact', head: true })
          .eq('timeline_id', timeline.id);

        return {
          ...timeline,
          memory_count: count || 0,
        };
      })
    );

    return timelinesWithCounts;
  }
}

