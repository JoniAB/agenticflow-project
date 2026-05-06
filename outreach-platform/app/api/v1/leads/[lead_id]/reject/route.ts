import { NextRequest, NextResponse } from 'next/server'
import { validateAgentKey, getAgentId } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lead_id: string }> }
) {
  const authError = validateAgentKey(request)
  if (authError) return authError

  const { lead_id } = await params
  const agentId = getAgentId(request)
  const body = await request.json().catch(() => ({}))
  const reason = body.reason ?? 'No reason provided'

  const supabase = getSupabaseAdmin()

  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('lead_id, current_board')
    .eq('lead_id', lead_id)
    .single()

  if (fetchError || !lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

  const { error: updateError } = await supabase
    .from('leads')
    .update({ current_board: 'B-08', status: 'archived', rejection_reason: reason })
    .eq('lead_id', lead_id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  await supabase.from('activity_log').insert({
    lead_id,
    type: 'reject',
    body: `Rejected from ${lead.current_board}: ${reason}`,
    agent_id: agentId,
  })

  return NextResponse.json({
    lead_id,
    previous_board: lead.current_board,
    current_board: 'B-08',
    status: 'archived',
    rejection_reason: reason,
    rejected_at: new Date().toISOString(),
  })
}
