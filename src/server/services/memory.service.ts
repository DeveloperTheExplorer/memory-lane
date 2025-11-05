import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

type Memory = Database['public']['Tables']['memory']['Row'];
type CreateMemoryInput = {
  name: string;
  description: string;
  image_url: string;
  image_key: string;
  date_of_event: string;
  timeline_id: string;
};
type UpdateMemoryInput = {
  name?: string;
  description?: string;
  image_url?: string;
  image_key?: string;
  date_of_event?: string;
  timeline_id?: string;
};

export class MemoryService {
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
        image_key: input.image_key,
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
    // If updating with a new image_key, delete the old image from storage
    if (input.image_key) {
      const { data: existingMemory } = await this.supabase
        .from('memory')
        .select('image_key')
        .eq('id', id)
        .single();

      // Delete old image if it exists and is different from the new one
      if (existingMemory?.image_key && existingMemory.image_key !== input.image_key) {
        const { error: storageError } = await this.supabase.storage
          .from('memory-images')
          .remove([existingMemory.image_key]);

        if (storageError) {
          console.error(`Failed to delete old image from storage: ${storageError.message}`);
          // Continue with update even if storage deletion fails
        }
      }
    }

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
    // First, fetch the memory to get the image_key
    const { data: memory, error: fetchError } = await this.supabase
      .from('memory')
      .select('image_key')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch memory: ${fetchError.message}`);
    }

    // Delete the image from storage if image_key exists
    if (memory?.image_key) {
      const { error: storageError } = await this.supabase.storage
        .from('memory-images')
        .remove([memory.image_key]);

      if (storageError) {
        console.error(`Failed to delete image from storage: ${storageError.message}`);
        // Continue with memory deletion even if storage deletion fails
      }
    }

    // Delete the memory record
    const { error } = await this.supabase
      .from('memory')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete memory: ${error.message}`);
    }

    return { success: true, id };
  }

  async deleteByTimelineId(timelineId: string): Promise<{ success: boolean; id: string }> {
    const { error, data } = await this.supabase
      .from('memory')
      .select('id, image_key')
      .eq('timeline_id', timelineId);

    if (error) {
      throw new Error(`Failed to fetch memories by timeline: ${error.message}`);
    }

    // Delete all memories and their associated images
    for (const memory of data || []) {
      // Delete the image from storage if image_key exists
      if (memory.image_key) {
        const { error: storageError } = await this.supabase.storage
          .from('memory-images')
          .remove([memory.image_key]);

        if (storageError) {
          console.error(`Failed to delete image from storage: ${storageError.message}`);
          // Continue with memory deletion even if storage deletion fails
        }
      }

      // Delete the memory record
      const { error: deleteError } = await this.supabase
        .from('memory')
        .delete()
        .eq('id', memory.id);

      if (deleteError) {
        console.error(`Failed to delete memory: ${deleteError.message}`);
      }
    }

    return { success: true, id: timelineId };
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

