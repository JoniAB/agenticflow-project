import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const supabase = getSupabaseAdmin()

  const [prospects, potential, content, approval, outreach, history, standby] = await Promise.all([
    supabase
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .in('status', ['potential', 'research_incomplete']),
    supabase
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .in('status', ['high_score', 'in_research']),
    supabase
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'content_ready'),
    supabase
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .in('status', ['awaiting_approval', 'awaiting_followup_approval', 'approved', 'edit_required']),
    supabase
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .in('status', ['sent', 'replied', 'followup_sent', 'send_failed']),
    supabase
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .in('status', ['exhausted', 'rejected']),
    supabase
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'standby'),
  ])

  return NextResponse.json({
    prospects: prospects.count ?? 0,
    potential: potential.count ?? 0,
    content:   content.count   ?? 0,
    approval:  approval.count  ?? 0,
    outreach:  outreach.count  ?? 0,
    history:   history.count   ?? 0,
    standby:   standby.count   ?? 0,
  })
}
