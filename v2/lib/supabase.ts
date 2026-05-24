import { createClient, SupabaseClient } from '@supabase/supabase-js'

export function getSupabaseAdmin(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Client-only singleton — safe to call inside useEffect / event handlers
let _supabase: SupabaseClient | null = null
export function getSupabase(): SupabaseClient {
  if (typeof window === 'undefined') {
    // During SSR, return a dummy client that will never be used
    return createClient('https://placeholder.supabase.co', 'placeholder')
  }
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _supabase
}
