import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'

// Browser / server-component client — uses anon key, respects RLS
export function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// API-route client — uses service role key, bypasses RLS
export function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  })
}
