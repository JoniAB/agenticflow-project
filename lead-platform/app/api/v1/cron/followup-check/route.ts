import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { STATUS_TO_BOARD } from '@/lib/types'

const FOLLOWUP_WINDOW_HOURS = 72
const MAX_FOLLOWUPS = 3

function validateCronKey(request: NextRequest): boolean {
  const key = request.headers.get('X-Cron-Key')
  return key === process.env.CRON_SECRET
}

// ----------------------------------------------------------------
// Follow-up check — runs at 08:00 / 13:00 / 18:00 IL
// Checks Gmail inbox for replies, and queues follow-ups for
// companies that haven't replied within 72 hours.
// ----------------------------------------------------------------
export async function POST(request: NextRequest) {
  if (!validateCronKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const now = new Date()
  const windowMs = FOLLOWUP_WINDOW_HOURS * 60 * 60 * 1000
  const cutoff = new Date(now.getTime() - windowMs).toISOString()

  const result = {
    replies_detected: 0,
    followups_queued: 0,
    exhausted: 0,
    errors: [] as string[],
  }

  // ---- Path A: Check for replies in Gmail ----
  // Get all sent/followup_sent companies with a gmail_thread_id
  const { data: sentOutreaches, error: sentErr } = await supabase
    .from('outreach')
    .select('id, company_id, gmail_thread_id, sent_at, follow_up_count')
    .not('gmail_thread_id', 'is', null)
    .eq('replied', false)

  if (sentErr) {
    result.errors.push(`Fetch sent outreach: ${sentErr.message}`)
  }

  for (const outreach of sentOutreaches ?? []) {
    // Check Gmail for reply on this thread
    const hasReply = await checkGmailForReply(outreach.gmail_thread_id as string)
    if (!hasReply) continue

    const { error: replyErr } = await supabase
      .from('outreach')
      .update({
        replied:    true,
        replied_at: now.toISOString(),
      })
      .eq('id', outreach.id)

    if (replyErr) {
      result.errors.push(`Update reply for ${outreach.company_id}: ${replyErr.message}`)
      continue
    }

    // Move company to B-08 Replied
    await supabase
      .from('companies')
      .update({
        status:        'replied',
        current_board: STATUS_TO_BOARD['replied'],
      })
      .eq('id', outreach.company_id)

    await supabase.from('agent_log').insert({
      company_id: outreach.company_id,
      agent_name: 'followup-check',
      action:     'reply_detected',
      status:     'success',
      payload:    { thread_id: outreach.gmail_thread_id },
    })

    result.replies_detected++
  }

  // ---- Path B: Queue follow-ups for companies past 72-hour window ----
  const { data: waitingCompanies, error: waitErr } = await supabase
    .from('companies')
    .select('id, status')
    .in('status', ['sent', 'followup_sent'])

  if (waitErr) {
    result.errors.push(`Fetch waiting companies: ${waitErr.message}`)
  }

  for (const company of waitingCompanies ?? []) {
    const { data: outreach } = await supabase
      .from('outreach')
      .select('id, sent_at, follow_up_count, last_follow_up_at')
      .eq('company_id', company.id)
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!outreach) continue

    const lastContactAt = outreach.last_follow_up_at ?? outreach.sent_at
    if (!lastContactAt || lastContactAt > cutoff) continue

    // SOP: MUST NOT send follow-up if followup_count >= MAX_FOLLOWUPS
    if (outreach.follow_up_count >= MAX_FOLLOWUPS) {
      await supabase
        .from('companies')
        .update({
          status:        'exhausted',
          current_board: STATUS_TO_BOARD['exhausted'],
        })
        .eq('id', company.id)

      await supabase.from('agent_log').insert({
        company_id: company.id,
        agent_name: 'followup-check',
        action:     'followup_exhausted',
        status:     'success',
        payload:    { follow_up_count: outreach.follow_up_count },
      })

      result.exhausted++
      continue
    }

    // Queue follow-up for Yoni's approval — move to B-06
    await supabase
      .from('companies')
      .update({
        status:        'awaiting_followup_approval',
        current_board: STATUS_TO_BOARD['awaiting_followup_approval'],
      })
      .eq('id', company.id)

    await supabase.from('agent_log').insert({
      company_id: company.id,
      agent_name: 'followup-check',
      action:     'followup_queued',
      status:     'success',
      payload:    {
        follow_up_count: outreach.follow_up_count,
        last_contact_at: lastContactAt,
        hours_since:     Math.round((now.getTime() - new Date(lastContactAt).getTime()) / 3600000),
      },
    })

    result.followups_queued++
  }

  await supabase.from('agent_log').insert({
    agent_name: 'followup-check',
    action:     'check_complete',
    status:     result.errors.length === 0 ? 'success' : 'error',
    payload:    { ...result, run_at: now.toISOString() },
  })

  return NextResponse.json(result)
}

// ----------------------------------------------------------------
// Gmail reply detection
// TODO: implement with Gmail API once OAuth is wired
// For now returns false (no replies detected) so the cron runs
// safely without crashing.
// ----------------------------------------------------------------
async function checkGmailForReply(threadId: string): Promise<boolean> {
  // TODO: use Gmail MCP or googleapis to check thread for non-auto replies
  void threadId
  return false
}
