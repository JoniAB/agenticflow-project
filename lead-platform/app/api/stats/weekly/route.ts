import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export interface WeekDay {
  date: string   // YYYY-MM-DD
  label: string  // Mon, Tue, ...
  new_leads: number
  potentials: number
  emails_sent: number
  replies: number
}

export interface WeeklyStats {
  days: WeekDay[]
  totals: { new_leads: number; potentials: number; emails_sent: number; replies: number }
  pipeline: { board: string; label: string; count: number }[]
  health: { send_failed: number; research_incomplete: number; awaiting_approval: number; followup_pending: number }
  last_cron_at: string | null
  recent_activity: { agent: string; action: string; status: string; company_id: string | null; created_at: string }[]
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export async function GET() {
  const supabase = getSupabaseAdmin()

  // Build last-7-days date range
  const now = new Date()
  const days: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    return {
      date:       d.toISOString().slice(0, 10),
      label:      DAY_LABELS[d.getDay()],
      new_leads:  0,
      potentials: 0,
      emails_sent: 0,
      replies:    0,
    }
  })
  const since = days[0].date + 'T00:00:00.000Z'

  // Parallel queries
  const [companiesRes, outreachRes, pipelineRes, healthRes, cronRes, activityRes] =
    await Promise.all([
      // New leads per day
      supabase
        .from('companies')
        .select('created_at, scoring_result')
        .gte('created_at', since),
      // Emails sent + replies per day
      supabase
        .from('outreach')
        .select('sent_at, replied_at')
        .gte('sent_at', since),
      // Current pipeline counts by board
      supabase
        .from('companies')
        .select('current_board')
        .not('status', 'in', '("exhausted","rejected")'),
      // Health issues
      supabase
        .from('companies')
        .select('status')
        .in('status', ['send_failed', 'research_incomplete', 'awaiting_approval', 'awaiting_followup_approval']),
      // Last cron run
      supabase
        .from('agent_log')
        .select('created_at')
        .eq('agent_name', 'daily-pull')
        .eq('action', 'pull_complete')
        .eq('status', 'success')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      // Recent activity
      supabase
        .from('agent_log')
        .select('agent_name, action, status, company_id, created_at')
        .order('created_at', { ascending: false })
        .limit(8),
    ])

  // Fill in daily buckets
  for (const row of companiesRes.data ?? []) {
    const date = (row.created_at as string).slice(0, 10)
    const day = days.find(d => d.date === date)
    if (!day) continue
    day.new_leads++
    if ((row.scoring_result as number | null) !== null && (row.scoring_result as number) <= 5) {
      day.potentials++
    }
  }

  for (const row of outreachRes.data ?? []) {
    if (row.sent_at) {
      const date = (row.sent_at as string).slice(0, 10)
      const day = days.find(d => d.date === date)
      if (day) day.emails_sent++
    }
    if (row.replied_at) {
      const date = (row.replied_at as string).slice(0, 10)
      const day = days.find(d => d.date === date)
      if (day) day.replies++
    }
  }

  // Pipeline board counts
  const boardCounts: Record<string, number> = {}
  for (const row of pipelineRes.data ?? []) {
    const b = row.current_board as string
    boardCounts[b] = (boardCounts[b] ?? 0) + 1
  }
  const BOARD_LABELS: Record<string, string> = {
    'B-01': 'Raw Leads', 'B-02': 'Scoring', 'B-03': 'Potentials',
    'B-04': 'High Score', 'B-05': 'Researching', 'B-06': 'Ready to Send',
    'B-07': 'Sent', 'B-08': 'Replied', 'B-09': 'Follow-up Sent',
  }
  const pipeline = Object.entries(BOARD_LABELS).map(([board, label]) => ({
    board, label, count: boardCounts[board] ?? 0,
  }))

  // Health
  const healthRows = healthRes.data ?? []
  const health = {
    send_failed:        healthRows.filter(r => r.status === 'send_failed').length,
    research_incomplete: healthRows.filter(r => r.status === 'research_incomplete').length,
    awaiting_approval:  healthRows.filter(r => r.status === 'awaiting_approval' || r.status === 'awaiting_followup_approval').length,
    followup_pending:   0,
  }

  const totals = days.reduce(
    (acc, d) => ({
      new_leads:   acc.new_leads   + d.new_leads,
      potentials:  acc.potentials  + d.potentials,
      emails_sent: acc.emails_sent + d.emails_sent,
      replies:     acc.replies     + d.replies,
    }),
    { new_leads: 0, potentials: 0, emails_sent: 0, replies: 0 }
  )

  const stats: WeeklyStats = {
    days,
    totals,
    pipeline,
    health,
    last_cron_at: cronRes.data?.created_at ?? null,
    recent_activity: (activityRes.data ?? []).map(r => ({
      agent:      r.agent_name as string,
      action:     r.action as string,
      status:     r.status as string,
      company_id: r.company_id as string | null,
      created_at: r.created_at as string,
    })),
  }

  return NextResponse.json(stats)
}
