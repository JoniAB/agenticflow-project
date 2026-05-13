import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// POST /api/admin/sync-outreach-statuses
// Looks at the outreach table to correct company statuses:
//   - has outreach.replied = true  → company.status = 'replied'
//   - has outreach.sent_at != null → company.status = 'sent'  (only if currently before 'sent' in the funnel)
export async function POST(req: Request) {
  const key = req.headers.get('x-agent-key')
  if (key !== 'yoni-agent-key-2025') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  // Load all outreach rows that have been sent
  const { data: outreachRows, error: outErr } = await supabase
    .from('outreach')
    .select('company_id, sent_at, replied')
    .not('sent_at', 'is', null)

  if (outErr) return NextResponse.json({ error: outErr.message }, { status: 500 })

  if (!outreachRows || outreachRows.length === 0) {
    return NextResponse.json({ updated: 0, message: 'No sent outreach found' })
  }

  // Separate replied vs just sent
  const repliedIds = outreachRows.filter(r => r.replied).map(r => r.company_id as string)
  const sentIds    = outreachRows.filter(r => !r.replied).map(r => r.company_id as string)

  // Statuses that should NOT be overwritten (already at or past the target)
  const sentTerminal    = ['sent', 'replied', 'followup_sent', 'exhausted', 'rejected']
  const repliedTerminal = ['replied', 'followup_sent', 'exhausted', 'rejected']

  let updatedSent    = 0
  let updatedReplied = 0

  // Update replied companies first (higher priority)
  if (repliedIds.length > 0) {
    const { data: existing } = await supabase
      .from('companies')
      .select('id, status')
      .in('id', repliedIds)

    const toUpdate = (existing ?? [])
      .filter(c => !repliedTerminal.includes(c.status))
      .map(c => c.id)

    if (toUpdate.length > 0) {
      await supabase
        .from('companies')
        .update({ status: 'replied' })
        .in('id', toUpdate)
      updatedReplied = toUpdate.length
    }
  }

  // Update sent companies
  if (sentIds.length > 0) {
    const { data: existing } = await supabase
      .from('companies')
      .select('id, status')
      .in('id', sentIds)

    const toUpdate = (existing ?? [])
      .filter(c => !sentTerminal.includes(c.status))
      .map(c => c.id)

    if (toUpdate.length > 0) {
      await supabase
        .from('companies')
        .update({ status: 'sent' })
        .in('id', toUpdate)
      updatedSent = toUpdate.length
    }
  }

  return NextResponse.json({
    total_outreach_records: outreachRows.length,
    updated_to_sent:    updatedSent,
    updated_to_replied: updatedReplied,
    skipped: outreachRows.length - updatedSent - updatedReplied,
  })
}

// GET → dry-run preview of what would change
export async function GET(req: Request) {
  const key = req.headers.get('x-agent-key')
  if (key !== 'yoni-agent-key-2025') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  const { data: outreachRows, error: outErr } = await supabase
    .from('outreach')
    .select('company_id, sent_at, replied, recipient_email')
    .not('sent_at', 'is', null)

  if (outErr) return NextResponse.json({ error: outErr.message }, { status: 500 })

  if (!outreachRows || outreachRows.length === 0) {
    return NextResponse.json({ message: 'No sent outreach records found' })
  }

  const companyIds = outreachRows.map(r => r.company_id as string)
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, status')
    .in('id', companyIds)

  const companyMap = new Map((companies ?? []).map(c => [c.id, c]))

  const summary = outreachRows.map(r => {
    const company  = companyMap.get(r.company_id as string)
    const target   = r.replied ? 'replied' : 'sent'
    return {
      company_id:    r.company_id,
      company_name:  company?.name ?? '?',
      current_status: company?.status ?? '?',
      target_status: target,
      sent_at:       r.sent_at,
      replied:       r.replied,
      recipient:     r.recipient_email,
    }
  })

  return NextResponse.json({ count: summary.length, records: summary })
}
