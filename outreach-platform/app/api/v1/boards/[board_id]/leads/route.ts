import { NextRequest, NextResponse } from 'next/server'
import { validateAgentKey, getAgentId } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { BOARDS } from '@/lib/board-config'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ board_id: string }> }
) {
  const { board_id } = await params
  const { searchParams } = request.nextUrl

  const status = searchParams.get('status')
  const assigned_agent = searchParams.get('assigned_agent')
  const due = searchParams.get('due') === 'true'
  const limit = parseInt(searchParams.get('limit') ?? '100')
  const offset = parseInt(searchParams.get('offset') ?? '0')
  const sort = searchParams.get('sort') ?? 'updated_at:desc'
  const [sortField, sortDir] = sort.split(':')

  const supabase = getSupabaseAdmin()
  let query = supabase
    .from('leads')
    .select('*')
    .eq('current_board', board_id)
    .order(sortField ?? 'updated_at', { ascending: sortDir === 'asc' })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)
  if (assigned_agent) query = query.eq('assigned_agent', assigned_agent)
  if (due) query = query.lte('next_followup_at', new Date().toISOString())

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ board_id: string }> }
) {
  const authError = validateAgentKey(request)
  if (authError) return authError

  const { board_id } = await params
  const board = BOARDS.find(b => b.id === board_id)
  if (!board) return NextResponse.json({ error: 'Board not found' }, { status: 404 })

  const agentId = getAgentId(request)
  const body = await request.json()
  const { company_name, website, industry, employee_count, hq_location, linkedin_url, status } = body

  if (!company_name) return NextResponse.json({ error: 'company_name is required' }, { status: 400 })

  const supabase = getSupabaseAdmin()

  // Duplicate check
  if (website) {
    const { data: existing } = await supabase
      .from('leads')
      .select('lead_id')
      .eq('company_name', company_name)
      .eq('website', website)
      .limit(1)
    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Duplicate: lead with same company_name and website already exists', existing_id: existing[0].lead_id }, { status: 409 })
    }
  }

  const { data, error } = await supabase
    .from('leads')
    .insert({
      company_name, website, industry, employee_count, hq_location, linkedin_url,
      current_board: board_id,
      status: status ?? 'new',
      created_by: agentId,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Log creation
  await supabase.from('activity_log').insert({
    lead_id: data.lead_id,
    type: 'note',
    body: `Lead created on ${board.name} by ${agentId}.`,
    agent_id: agentId,
  })

  return NextResponse.json(data, { status: 201 })
}
