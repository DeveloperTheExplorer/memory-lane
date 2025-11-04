import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

type Memory = Database['public']['Tables']['memory']['Row'];
type CreateMemoryInput = {
  name: string;
  description: string;
  image_url: string;
  date_of_event: string;
  timeline_id: string;
};
type UpdateMemoryInput = {
  name?: string;
  description?: string;
  image_url?: string;
  date_of_event?: string;
  timeline_id?: string;
};

export class MemoryService {
  private supabase;

  constructor(accessToken?: string) {
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

  async getAll(options?: { limit?: number; offset?: number }): Promise<Memory[]> {
    let query = this.supabase
      .from('memory')
      .select('*')
      .order('date_of_event', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch memories: ${error.message}`);
    }

    return data;
  }

  async getById(id: string): Promise<Memory> {
    const { data, error } = await this.supabase
      .from('memory')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch memory: ${error.message}`);
    }

    return data;
  }

  async getByTimelineId(
    timelineId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<Memory[]> {
    let query = this.supabase
      .from('memory')
      .select('*')
      .eq('timeline_id', timelineId)
      .order('date_of_event', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch memories for timeline: ${error.message}`);
    }

    return data;
  }

  async create(input: CreateMemoryInput): Promise<Memory> {
    const { data, error } = await this.supabase
      .from('memory')
      .insert({
        name: input.name,
        description: input.description,
        image_url: input.image_url,
        date_of_event: input.date_of_event,
        timeline_id: input.timeline_id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create memory: ${error.message}`);
    }

    return data;
  }

  async update(id: string, input: UpdateMemoryInput): Promise<Memory> {
    const { data, error } = await this.supabase
      .from('memory')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update memory: ${error.message}`);
    }

    return data;
  }

  async delete(id: string): Promise<{ success: boolean; id: string }> {
    const { error } = await this.supabase
      .from('memory')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete memory: ${error.message}`);
    }

    return { success: true, id };
  }

  async getCountByTimelineId(timelineId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('memory')
      .select('*', { count: 'exact', head: true })
      .eq('timeline_id', timelineId);

    if (error) {
      throw new Error(`Failed to count memories: ${error.message}`);
    }

    return count || 0;
  }
}

