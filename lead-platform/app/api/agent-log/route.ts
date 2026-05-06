import { NextRequest, NextResponse } from 'next/server'
import { validateAgentKey } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const company_id = searchParams.get('company_id')

  const supabase = getSupabaseAdmin()
  let query = supabase.from('agent_log').select('*').order('created_at', { ascending: false }).limit(200)

  if (company_id) query = query.eq('company_id', company_id)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const authError = validateAgentKey(request)
  if (authError) return authError

  const body = await request.json()
  const { agent_name, action, status, payload, company_id, error_message } = body

  if (!agent_name || !action || !status) {
    return NextResponse.json({ error: 'agent_name, action, and status are required' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('agent_log')
    .insert({ agent_name, action, status, payload, company_id, error_message })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
