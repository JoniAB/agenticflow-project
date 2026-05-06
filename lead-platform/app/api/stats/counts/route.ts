import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const supabase = getSupabaseAdmin()

  const [prospects, approval, outreach, content] = await Promise.all([
    supabase
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .in('status', ['potential', 'high_score']),
    supabase
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .in('status', ['awaiting_approval', 'awaiting_followup_approval', 'approved', 'edit_required']),
    supabase
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .in('status', ['sent', 'replied', 'followup_sent']),
    supabase
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'content_ready'),
  ])

  return NextResponse.json({
    prospects: prospects.count ?? 0,
    approval:  approval.count  ?? 0,
    outreach:  outreach.count  ?? 0,
    content:   content.count   ?? 0,
  })
}
