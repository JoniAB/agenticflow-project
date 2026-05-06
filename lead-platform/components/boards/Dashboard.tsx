'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  BarChart2, AlertTriangle, CheckCircle2, Clock,
  Send, MessageSquare, Users, TrendingUp, Activity,
  ArrowRight, RefreshCw,
} from 'lucide-react'
import type { WeeklyStats } from '@/app/api/stats/weekly/route'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color, icon: Icon }: {
  label: string; value: string; sub: string; color: string; icon: React.ElementType
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
        <Icon size={14} className="text-gray-300 mt-0.5" strokeWidth={1.5} />
      </div>
      <p className={cn('text-[2.2rem] font-bold leading-none mt-3', color)}>{value}</p>
      <p className="text-xs text-gray-400 mt-2">{sub}</p>
    </div>
  )
}

function WeekChart({ days }: { days: WeeklyStats['days'] }) {
  const series = [
    { key: 'new_leads',   label: 'New Leads',    color: 'bg-indigo-400',  dot: 'bg-indigo-400' },
    { key: 'potentials',  label: 'Potentials',   color: 'bg-emerald-400', dot: 'bg-emerald-400' },
    { key: 'emails_sent', label: 'Emails Sent',  color: 'bg-amber-400',   dot: 'bg-amber-400' },
    { key: 'replies',     label: 'Replies',      color: 'bg-pink-400',    dot: 'bg-pink-400' },
  ] as const

  const maxVal = Math.max(
    ...days.flatMap(d => [d.new_leads, d.potentials, d.emails_sent, d.replies]),
    1
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <BarChart2 size={14} className="text-gray-400" />
          Last 7 Days
        </p>
        <div className="flex items-center gap-4">
          {series.map(s => (
            <span key={s.key} className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <span className={cn('w-2 h-2 rounded-full', s.dot)} />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Grouped bars */}
      <div className="flex items-end gap-2" style={{ height: 100 }}>
        {days.map(day => (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-end gap-[2px] w-full justify-center" style={{ height: 72 }}>
              {series.map(s => {
                const val = day[s.key]
                const h = val > 0 ? Math.max((val / maxVal) * 64, 4) : 2
                return (
                  <div
                    key={s.key}
                    title={`${s.label}: ${val}`}
                    className={cn('rounded-t-[2px] transition-all', s.color, val === 0 ? 'opacity-20' : '')}
                    style={{ height: h, width: 5 }}
                  />
                )
              })}
            </div>
            <p className="text-[10px] text-gray-400 leading-none">{day.label}</p>
          </div>
        ))}
      </div>

      {/* Totals row */}
      <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
        {series.map(s => (
          <div key={s.key} className="flex items-center gap-1.5">
            <span className={cn('w-2 h-2 rounded-full', s.dot)} />
            <span className="text-xs text-gray-500">
              <span className="font-semibold text-gray-800">
                {([] as number[]).concat(...days.map(d => [d[s.key]])).reduce((a, b) => a + b, 0)}
              </span>{' '}
              {s.label.toLowerCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PipelineBoard({ pipeline }: { pipeline: WeeklyStats['pipeline'] }) {
  const BOARD_LINKS: Record<string, string> = {
    'B-03': '/boards/champions',
    'B-04': '/boards/champions',
    'B-05': '/boards/researching',
    'B-06': '/boards/approval',
    'B-07': '/boards/outreach',
    'B-08': '/boards/outreach',
    'B-09': '/boards/outreach',
  }
  const BOARD_COLORS: Record<string, string> = {
    'B-01': 'bg-slate-100 text-slate-600',
    'B-02': 'bg-blue-50 text-blue-600',
    'B-03': 'bg-emerald-50 text-emerald-700',
    'B-04': 'bg-violet-50 text-violet-700',
    'B-05': 'bg-amber-50 text-amber-700',
    'B-06': 'bg-orange-50 text-orange-700',
    'B-07': 'bg-indigo-50 text-indigo-700',
    'B-08': 'bg-green-50 text-green-700',
    'B-09': 'bg-cyan-50 text-cyan-700',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingUp size={14} className="text-gray-400" strokeWidth={1.5} />
        Pipeline — Live Counts
      </p>
      <div className="grid grid-cols-3 gap-2">
        {pipeline.map(({ board, label, count }) => {
          const href = BOARD_LINKS[board]
          const colorClass = BOARD_COLORS[board] ?? 'bg-gray-50 text-gray-600'
          const inner = (
            <div className={cn('rounded-lg px-3 py-2.5 flex items-center justify-between', colorClass, href ? 'cursor-pointer hover:opacity-80 transition-opacity' : '')}>
              <div>
                <p className="text-[10px] font-semibold opacity-60 uppercase tracking-wider">{board}</p>
                <p className="text-[12px] font-medium mt-0.5 leading-tight">{label}</p>
              </div>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          )
          return href
            ? <Link key={board} href={href}>{inner}</Link>
            : <div key={board}>{inner}</div>
        })}
      </div>
    </div>
  )
}

function HealthPanel({ health, last_cron_at }: { health: WeeklyStats['health']; last_cron_at: string | null }) {
  const issues = [
    { label: 'Awaiting Approval',  count: health.awaiting_approval,   href: '/boards/approval',  color: 'text-orange-600', icon: Clock },
    { label: 'Send Failed',        count: health.send_failed,         href: '/boards/outreach',  color: 'text-red-600',    icon: AlertTriangle },
    { label: 'Research Incomplete',count: health.research_incomplete,  href: '/boards/researching',color: 'text-amber-600', icon: AlertTriangle },
    { label: 'Follow-up Pending',  count: health.followup_pending,    href: '/boards/approval',  color: 'text-blue-600',   icon: Send },
  ]

  const hasIssues = issues.some(i => i.count > 0)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          {hasIssues
            ? <AlertTriangle size={14} className="text-amber-400" />
            : <CheckCircle2 size={14} className="text-emerald-400" />}
          System Health
        </p>
        {last_cron_at && (
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <RefreshCw size={10} />
            Last sync {relativeTime(last_cron_at)}
          </span>
        )}
      </div>
      <div className="space-y-2">
        {issues.map(({ label, count, href, color, icon: Icon }) => (
          <Link key={label} href={href}
            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors group">
            <span className="flex items-center gap-2 text-sm text-gray-600">
              <Icon size={13} className={count > 0 ? color : 'text-gray-300'} />
              {label}
            </span>
            <div className="flex items-center gap-2">
              <span className={cn('text-sm font-semibold', count > 0 ? color : 'text-gray-300')}>
                {count}
              </span>
              <ArrowRight size={12} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function ActivityFeed({ activity }: { activity: WeeklyStats['recent_activity'] }) {
  const statusDot: Record<string, string> = {
    success: 'bg-emerald-400',
    error:   'bg-red-400',
    skipped: 'bg-gray-300',
  }
  const agentColor: Record<string, string> = {
    'webhook':        'text-indigo-600 bg-indigo-50',
    'daily-pull':     'text-blue-600 bg-blue-50',
    'followup-check': 'text-cyan-600 bg-cyan-50',
    'research':       'text-amber-600 bg-amber-50',
    'content':        'text-violet-600 bg-violet-50',
  }

  if (activity.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Activity size={14} className="text-gray-400" strokeWidth={1.5} />
          Agent Activity
        </p>
        <p className="text-sm text-gray-400 text-center py-4">No activity yet — waiting for first agent run.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Activity size={14} className="text-gray-400" strokeWidth={1.5} />
          Recent Agent Activity
        </p>
        <Link href="/boards/activity" className="text-[11px] text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
          View all <ArrowRight size={10} />
        </Link>
      </div>
      <div className="space-y-2">
        {activity.map((row, i) => (
          <div key={i} className="flex items-center gap-3 py-1.5">
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0 mt-0.5', statusDot[row.status] ?? 'bg-gray-300')} />
            <span className={cn('text-[11px] font-medium px-1.5 py-0.5 rounded shrink-0', agentColor[row.agent] ?? 'text-gray-500 bg-gray-50')}>
              {row.agent}
            </span>
            <span className="text-xs text-gray-600 flex-1 truncate font-mono">{row.action}</span>
            <span className="text-[11px] text-gray-400 shrink-0">{relativeTime(row.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function Dashboard({ stats }: { stats: WeeklyStats }) {
  const { totals, days, pipeline, health, last_cron_at, recent_activity } = stats

  const sentTotal    = pipeline.find(p => p.board === 'B-07')?.count ?? 0
  const repliedTotal = pipeline.find(p => p.board === 'B-08')?.count ?? 0
  const replyRate    = sentTotal > 0 ? Math.round((repliedTotal / sentTotal) * 100) : 0
  const totalActive  = pipeline.reduce((a, p) => a + p.count, 0)

  return (
    <div className="px-10 pt-8 pb-12">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Cold outreach pipeline — last 7 days</p>
        </div>
        {last_cron_at && (
          <div className="text-right">
            <p className="text-[11px] text-gray-400 flex items-center gap-1 justify-end">
              <RefreshCw size={10} className="text-gray-300" />
              Last sync: {relativeTime(last_cron_at)}
            </p>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <KpiCard
          label="New Leads (7d)"
          value={String(totals.new_leads)}
          sub={`${totals.potentials} scored as potential`}
          color="text-indigo-600"
          icon={Users}
        />
        <KpiCard
          label="Emails Sent (7d)"
          value={String(totals.emails_sent)}
          sub={`${sentTotal} total in pipeline`}
          color="text-amber-500"
          icon={Send}
        />
        <KpiCard
          label="Replies (7d)"
          value={String(totals.replies)}
          sub={`${replyRate}% reply rate overall`}
          color="text-emerald-500"
          icon={MessageSquare}
        />
        <KpiCard
          label="Active in Pipeline"
          value={String(totalActive)}
          sub={`${health.awaiting_approval} waiting for approval`}
          color={health.awaiting_approval > 0 ? 'text-orange-500' : 'text-gray-700'}
          icon={TrendingUp}
        />
      </div>

      {/* 7-day chart */}
      <div className="mt-4">
        <WeekChart days={days} />
      </div>

      {/* Pipeline + Health side by side */}
      <div className="mt-4 grid grid-cols-[1fr_320px] gap-4">
        <PipelineBoard pipeline={pipeline} />
        <HealthPanel health={health} last_cron_at={last_cron_at} />
      </div>

      {/* Activity Feed */}
      <div className="mt-4">
        <ActivityFeed activity={recent_activity} />
      </div>
    </div>
  )
}
