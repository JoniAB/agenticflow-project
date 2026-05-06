import { NextRequest, NextResponse } from 'next/server'
import { validateAgentKey, getAgentId } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const agent_id = searchParams.get('agent_id')
  const status = searchParams.get('status') ?? 'open'

  const supabase = getSupabaseAdmin()
  let query = supabase.from('agent_tasks').select('*').eq('status', status).order('created_at', { ascending: true })

  if (agent_id) query = query.eq('agent_id', agent_id)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const authError = validateAgentKey(request)
  if (authError) return authError

  const agentId = getAgentId(request)
  const body = await request.json()
  const { lead_id, type, payload } = body

  if (!type) return NextResponse.json({ error: 'type is required' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('agent_tasks')
    .insert({ agent_id: agentId, lead_id, type, payload })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
