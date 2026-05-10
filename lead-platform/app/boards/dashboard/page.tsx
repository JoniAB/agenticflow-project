export const dynamic = 'force-dynamic'
import { getSupabaseAdmin } from '@/lib/supabase'
import { ALL_MOCK_COMPANIES } from '@/lib/mock-data'
import { Dashboard } from '@/components/boards/Dashboard'
import { ViewTransition } from 'react'
import type { WeeklyStats } from '@/app/api/stats/weekly/route'

// Mock weekly stats for fallback (no Supabase)
function getMockWeeklyStats(): WeeklyStats {
  const now = new Date()
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    const mock = [
      { new_leads: 2, potentials: 1, emails_sent: 0, replies: 0 },
      { new_leads: 1, potentials: 0, emails_sent: 0, replies: 0 },
      { new_leads: 3, potentials: 1, emails_sent: 1, replies: 0 },
      { new_leads: 0, potentials: 0, emails_sent: 0, replies: 0 },
      { new_leads: 1, potentials: 1, emails_sent: 1, replies: 0 },
      { new_leads: 2, potentials: 1, emails_sent: 0, replies: 1 },
      { new_leads: 4, potentials: 2, emails_sent: 2, replies: 1 },
    ][i]
    return { date: d.toISOString().slice(0, 10), label: DAY_LABELS[d.getDay()], ...mock }
  })

  const companies = ALL_MOCK_COMPANIES
  return {
    days,
    totals: { new_leads: 13, potentials: 6, emails_sent: 4, replies: 2 },
    pipeline: [
      { board: 'B-01', label: 'Raw Leads',      count: 0 },
      { board: 'B-02', label: 'Scoring',        count: 0 },
      { board: 'B-03', label: 'Potentials',     count: companies.filter(c => c.status === 'potential').length },
      { board: 'B-04', label: 'High Score',     count: 0 },
      { board: 'B-05', label: 'Researching',    count: 0 },
      { board: 'B-06', label: 'Ready to Send',  count: companies.filter(c => c.status === 'awaiting_approval').length },
      { board: 'B-07', label: 'Sent',           count: companies.filter(c => c.status === 'sent').length },
      { board: 'B-08', label: 'Replied',        count: companies.filter(c => c.status === 'replied').length },
      { board: 'B-09', label: 'Follow-up Sent', count: companies.filter(c => c.status === 'followup_sent').length },
    ],
    health: { send_failed: 0, research_incomplete: 0, awaiting_approval: companies.filter(c => c.status === 'awaiting_approval').length, followup_pending: 0 },
    last_cron_at: null,
    recent_activity: [],
  }
}

async function getWeeklyStats(): Promise<WeeklyStats> {
  try {
    const supabase = getSupabaseAdmin()
    // Quick check — if Supabase returns data, use real stats API logic inline
    const { data: check, error } = await supabase.from('companies').select('id').limit(1)
    if (error || !check) return getMockWeeklyStats()

    // Fetch real stats
    const now = new Date()
    const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (6 - i))
      return { date: d.toISOString().slice(0, 10), label: DAY_LABELS[d.getDay()], new_leads: 0, potentials: 0, emails_sent: 0, replies: 0 }
    })
    const since = days[0].date + 'T00:00:00.000Z'

    const [companiesRes, outreachRes, pipelineRes, healthRes, cronRes, activityRes] = await Promise.all([
      supabase.from('companies').select('created_at, scoring_result').gte('created_at', since),
      supabase.from('outreach').select('sent_at, replied_at').gte('sent_at', since),
      supabase.from('companies').select('current_board').not('status', 'in', '("exhausted","rejected")'),
      supabase.from('companies').select('status').in('status', ['send_failed', 'research_incomplete', 'awaiting_approval', 'awaiting_followup_approval']),
      supabase.from('agent_log').select('created_at').eq('agent_name', 'daily-pull').eq('action', 'pull_complete').eq('status', 'success').order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('agent_log').select('agent_name, action, status, company_id, created_at').order('created_at', { ascending: false }).limit(8),
    ])

    for (const row of companiesRes.data ?? []) {
      const d = days.find(d => d.date === (row.created_at as string).slice(0, 10))
      if (!d) continue
      d.new_leads++
      if (row.scoring_result !== null && (row.scoring_result as number) <= 5) d.potentials++
    }
    for (const row of outreachRes.data ?? []) {
      if (row.sent_at) { const d = days.find(d => d.date === (row.sent_at as string).slice(0, 10)); if (d) d.emails_sent++ }
      if (row.replied_at) { const d = days.find(d => d.date === (row.replied_at as string).slice(0, 10)); if (d) d.replies++ }
    }

    const boardCounts: Record<string, number> = {}
    for (const row of pipelineRes.data ?? []) {
      const b = row.current_board as string
      boardCounts[b] = (boardCounts[b] ?? 0) + 1
    }
    const BOARD_LABELS: Record<string, string> = { 'B-01': 'Raw Leads', 'B-02': 'Scoring', 'B-03': 'Potentials', 'B-04': 'High Score', 'B-05': 'Researching', 'B-06': 'Ready to Send', 'B-07': 'Sent', 'B-08': 'Replied', 'B-09': 'Follow-up Sent' }

    const healthRows = healthRes.data ?? []
    return {
      days,
      totals: days.reduce((a, d) => ({ new_leads: a.new_leads + d.new_leads, potentials: a.potentials + d.potentials, emails_sent: a.emails_sent + d.emails_sent, replies: a.replies + d.replies }), { new_leads: 0, potentials: 0, emails_sent: 0, replies: 0 }),
      pipeline: Object.entries(BOARD_LABELS).map(([board, label]) => ({ board, label, count: boardCounts[board] ?? 0 })),
      health: {
        send_failed: healthRows.filter(r => r.status === 'send_failed').length,
        research_incomplete: healthRows.filter(r => r.status === 'research_incomplete').length,
        awaiting_approval: healthRows.filter(r => r.status === 'awaiting_approval' || r.status === 'awaiting_followup_approval').length,
        followup_pending: 0,
      },
      last_cron_at: cronRes.data?.created_at ?? null,
      recent_activity: (activityRes.data ?? []).map(r => ({ agent: r.agent_name as string, action: r.action as string, status: r.status as string, company_id: r.company_id as string | null, created_at: r.created_at as string })),
    }
  } catch {
    return getMockWeeklyStats()
  }
}

export default async function DashboardPage() {
  const stats = await getWeeklyStats()
  return (
    <ViewTransition>
      <Dashboard stats={stats} />
    </ViewTransition>
  )
}
