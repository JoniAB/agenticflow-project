import { NextRequest, NextResponse } from 'next/server'
import { validateAgentKey, getAgentId } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ lead_id: string }> }
) {
  const { lead_id } = await params
  const supabase = getSupabaseAdmin()

  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('lead_id', lead_id)
    .single()

  if (error || !lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

  const { data: activity } = await supabase
    .from('activity_log')
    .select('*')
    .eq('lead_id', lead_id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ ...lead, activity: activity ?? [] })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ lead_id: string }> }
) {
  const authError = validateAgentKey(request)
  if (authError) return authError

  const { lead_id } = await params
  const agentId = getAgentId(request)
  const body = await request.json()

  const ALLOWED_FIELDS = [
    'company_name', 'website', 'industry', 'employee_count', 'hq_location',
    'linkedin_url', 'contact_name', 'contact_title', 'contact_email', 'contact_linkedin',
    'status', 'assigned_agent', 'icp_score', 'icp_notes', 'rejection_reason',
    'outreach_channel', 'first_message_sent_at', 'first_message_text',
    'followup_count', 'next_followup_at', 'response_received_at', 'response_sentiment',
    'agent_notes',
  ]

  const updates: Record<string, unknown> = {}
  for (const field of ALLOWED_FIELDS) {
    if (field in body) updates[field] = body[field]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 422 })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('lead_id', lead_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

  // Log the update
  await supabase.from('activity_log').insert({
    lead_id,
    type: 'field_update',
    body: `Updated fields: ${Object.keys(updates).join(', ')}`,
    agent_id: agentId,
  })

  return NextResponse.json({
    lead_id,
    updated_fields: Object.keys(updates),
    updated_at: data.updated_at,
    updated_by: agentId,
  })
}
