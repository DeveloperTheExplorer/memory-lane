'use client'
import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
// Using NEXT_PUBLIC_ prefix to make env vars available on client-side
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default supabase;