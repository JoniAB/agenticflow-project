import { NextRequest, NextResponse } from 'next/server'
import { validateAgentKey, getAgentId } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ lead_id: string }> }
) {
  const { lead_id } = await params
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('lead_id', lead_id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lead_id: string }> }
) {
  const authError = validateAgentKey(request)
  if (authError) return authError

  const { lead_id } = await params
  const agentId = getAgentId(request)
  const body = await request.json()
  const { type, body: bodyText, channel } = body

  if (!type) return NextResponse.json({ error: 'type is required' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('activity_log')
    .insert({ lead_id, type, body: bodyText, channel, agent_id: agentId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
