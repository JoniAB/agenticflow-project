import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export type QueryStatus = 'fresh' | 'bank' | 'used'

export interface SearchQuery {
  id: string
  text: string
  status: QueryStatus
  added_at: string
}

export async function GET() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('agent_log')
    .select('id, payload, created_at')
    .eq('agent_name', 'system')
    .eq('action', 'search_query')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows: SearchQuery[] = (data ?? []).map(row => ({
    id: row.id,
    text: (row.payload as { text: string; status: QueryStatus })?.text ?? '',
    status: (row.payload as { text: string; status: QueryStatus })?.status ?? 'fresh',
    added_at: row.created_at,
  }))

  return NextResponse.json({
    fresh: rows.filter(r => r.status === 'fresh'),
    bank:  rows.filter(r => r.status === 'bank'),
    used:  rows.filter(r => r.status === 'used'),
  })
}

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'text required' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('agent_log')
    .insert({
      agent_name: 'system',
      action: 'search_query',
      status: 'success',
      company_id: null,
      payload: { text: text.trim(), status: 'fresh' },
    })
    .select('id, payload, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    id: data.id,
    text: (data.payload as { text: string })?.text,
    status: 'fresh',
    added_at: data.created_at,
  }, { status: 201 })
}
