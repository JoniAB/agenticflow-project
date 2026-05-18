'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  BarChart2, AlertTriangle, CheckCircle2, Clock, ChevronRight,
  Send, MessageSquare, Users, TrendingUp, Activity, Search, FileText, Mail,
  ArrowRight, RefreshCw, Play, Loader2, XCircle, ChevronDown, ChevronUp,
} from 'lucide-react'
import type { WeeklyStats } from '@/app/api/stats/weekly/route'

// ─── Pipeline counts hook ─────────────────────────────────────────────────────

type PipelineCounts = {
  prospects: number; potential: number; content: number
  approval: number;  outreach: number; history: number; standby: number
}

const ZERO_COUNTS: PipelineCounts = {
  prospects: 0, potential: 0, content: 0,
  approval: 0,  outreach: 0, history: 0, standby: 0,
}

function usePipelineCounts() {
  const [counts, setCounts] = useState<PipelineCounts>(ZERO_COUNTS)
  useEffect(() => {
    function refresh() {
      fetch('/api/stats/counts').then(r => r.json()).then(setCounts).catch(() => {})
    }
    refresh()
    window.addEventListener('boards-refresh',    refresh)
    window.addEventListener('board-items-moved', refresh)
    return () => {
      window.removeEventListener('boards-refresh',    refresh)
      window.removeEventListener('board-items-moved', refresh)
    }
  }, [])
  return counts
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ─── Pipeline flow ────────────────────────────────────────────────────────────

type StageColor = 'violet' | 'blue' | 'amber' | 'emerald' | 'sky'

const PIPELINE_STAGES = [
  { href: '/boards/champions',   label: 'Find Leads',    icon: Search,   ck: 'prospects' as keyof PipelineCounts, color: 'violet'  as StageColor, step: 1 },
  { href: '/boards/researching', label: 'Potential',     icon: Users,    ck: 'potential' as keyof PipelineCounts, color: 'blue'    as StageColor, step: 2 },
  { href: '/boards/content',     label: 'Content',       icon: FileText, ck: 'content'   as keyof PipelineCounts, color: 'amber'   as StageColor, step: 3 },
  { href: '/boards/approval',    label: 'Ready to Send', icon: Send,     ck: 'approval'  as keyof PipelineCounts, color: 'emerald' as StageColor, step: 4 },
  { href: '/boards/outreach',    label: 'Sent',          icon: Mail,     ck: 'outreach'  as keyof PipelineCounts, color: 'sky'     as StageColor, step: 5 },
]

const STAGE_STYLE: Record<StageColor, { topBorder: string; hoverBg: string; text: string; muted: string; circleBg: string; circleText: string }> = {
  violet:  { topBorder: 'border-t-violet-500',  hoverBg: 'hover:bg-violet-50',  text: 'text-violet-600',  muted: 'text-violet-400',  circleBg: 'bg-violet-100',  circleText: 'text-violet-700'  },
  blue:    { topBorder: 'border-t-blue-500',    hoverBg: 'hover:bg-blue-50',    text: 'text-blue-600',    muted: 'text-blue-400',    circleBg: 'bg-blue-100',    circleText: 'text-blue-700'    },
  amber:   { topBorder: 'border-t-amber-500',   hoverBg: 'hover:bg-amber-50',   text: 'text-amber-600',   muted: 'text-amber-400',   circleBg: 'bg-amber-100',   circleText: 'text-amber-700'   },
  emerald: { topBorder: 'border-t-emerald-500', hoverBg: 'hover:bg-emerald-50', text: 'text-emerald-600', muted: 'text-emerald-400', circleBg: 'bg-emerald-100', circleText: 'text-emerald-700' },
  sky:     { topBorder: 'border-t-sky-500',     hoverBg: 'hover:bg-sky-50',     text: 'text-sky-600',     muted: 'text-sky-400',     circleBg: 'bg-sky-100',     circleText: 'text-sky-700'     },
}

function PipelineFlow() {
  const counts = usePipelineCounts()
  return (
    <div className="flex items-center gap-1.5">
      {PIPELINE_STAGES.flatMap((stage, i) => {
        const c     = STAGE_STYLE[stage.color]
        const count = counts[stage.ck]
        const cards = [
          <Link key={stage.href} href={stage.href} className={cn(
            'flex-1 flex flex-col p-4 bg-white rounded-xl border border-gray-200 border-t-2 transition-colors cursor-pointer',
            c.topBorder, c.hoverBg,
          )}>
            <div className="flex items-center justify-between mb-2.5">
              <span className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                c.circleBg, c.circleText,
              )}>
                {stage.step}
              </span>
              <stage.icon size={13} className={c.muted} strokeWidth={1.8} />
            </div>
            <p className="text-[11px] font-medium text-gray-500 leading-tight truncate">{stage.label}</p>
            <p className={cn('text-[2rem] font-bold leading-tight mt-0.5 tabular-nums', c.text)}>{count}</p>
          </Link>,
        ]
        if (i < PIPELINE_STAGES.length - 1) {
          cards.push(
            <ChevronRight key={`arrow-${i}`} size={13} className="text-gray-300 shrink-0" />,
          )
        }
        return cards
      })}
    </div>
  )
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color, icon: Icon }: {
  label: string; value: string; sub: string; color: string; icon: React.ElementType
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
        <Icon size={13} className="text-gray-300" strokeWidth={1.5} />
      </div>
      <p className={cn('text-[2rem] font-bold leading-none', color)}>{value}</p>
      <p className="text-[11px] text-gray-400 mt-1.5">{sub}</p>
    </div>
  )
}

// ─── Week chart ───────────────────────────────────────────────────────────────

function WeekChart({ days }: { days: WeeklyStats['days'] }) {
  const series = [
    { key: 'new_leads',   label: 'New Leads',    color: 'bg-indigo-400',  dot: 'bg-indigo-400'  },
    { key: 'potentials',  label: 'Potentials',   color: 'bg-emerald-400', dot: 'bg-emerald-400' },
    { key: 'emails_sent', label: 'Emails Sent',  color: 'bg-amber-400',   dot: 'bg-amber-400'   },
    { key: 'replies',     label: 'Replies',      color: 'bg-pink-400',    dot: 'bg-pink-400'    },
  ] as const

  const maxVal = Math.max(
    ...days.flatMap(d => [d.new_leads, d.potentials, d.emails_sent, d.replies]),
    1,
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <BarChart2 size={13} className="text-gray-400" />
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

      <div className="flex items-end gap-2" style={{ height: 100 }}>
        {days.map(day => (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-end gap-[2px] w-full justify-center" style={{ height: 72 }}>
              {series.map(s => {
                const val = day[s.key]
                const h   = val > 0 ? Math.max((val / maxVal) * 64, 4) : 2
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

// ─── Manual pipeline trigger ──────────────────────────────────────────────────

function RunPipelineButton({ lastCronAt }: { lastCronAt: string | null }) {
  const [status,  setStatus]  = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [log,     setLog]     = useState<string[]>([])
  const [showLog, setShowLog] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)

  async function run() {
    if (status === 'running') return
    setStatus('running')
    setLog([])
    setSummary(null)
    try {
      const res  = await fetch('/api/cron/pipeline', {
        method: 'POST',
        headers: { 'x-agent-key': 'yoni-agent-key-2025' },
      })
      const data = await res.json()
      setLog(data.log ?? [data.error ?? 'Unknown error'])
      if (!res.ok) {
        setStatus('error')
      } else {
        setSummary(`${data.added ?? 0} עסקים נוספו · ${data.content_generated ?? 0} תוכן נוצר`)
        setStatus('done')
        window.dispatchEvent(new CustomEvent('boards-refresh'))
      }
    } catch (e) {
      setLog([e instanceof Error ? e.message : 'Network error'])
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2.5">
        {status === 'idle' && lastCronAt && (
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <RefreshCw size={10} /> Last run: {relativeTime(lastCronAt)}
          </span>
        )}
        {status === 'done' && summary && (
          <span className="text-[11px] text-emerald-500 flex items-center gap-1">
            <CheckCircle2 size={10} /> {summary}
          </span>
        )}
        {status === 'error' && (
          <span className="text-[11px] text-red-400 flex items-center gap-1">
            <XCircle size={10} /> Run failed
          </span>
        )}
        <button
          onClick={run}
          disabled={status === 'running'}
          className={cn(
            'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors',
            status === 'running' ? 'bg-indigo-100 text-indigo-400 cursor-wait' :
            status === 'error'   ? 'bg-red-50 text-red-600 hover:bg-red-100'   :
                                   'bg-indigo-600 text-white hover:bg-indigo-700',
          )}
        >
          {status === 'running'
            ? <><Loader2 size={12} className="animate-spin" /> מריץ סוכנים...</>
            : <><Play    size={12} /> הרץ סוכנים</>}
        </button>
      </div>
      {log.length > 0 && (
        <button
          onClick={() => setShowLog(p => !p)}
          className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-1"
        >
          {showLog ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          {showLog ? 'הסתר לוג' : 'הצג לוג'}
        </button>
      )}
      {showLog && (
        <div className="bg-gray-950 rounded-xl p-4 text-right w-96 max-h-60 overflow-y-auto border border-gray-800">
          {log.map((line, i) => (
            <p key={i} className={cn(
              'text-xs leading-relaxed py-0.5',
              line.includes('❌') ? 'text-red-400' :
              line.includes('✅') || line.includes('🎉') ? 'text-emerald-400' :
              line.includes('⏭️') ? 'text-gray-500' :
              'text-gray-300',
            )} dir="rtl">{line}</p>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Health panel ─────────────────────────────────────────────────────────────

function HealthPanel({ health, last_cron_at }: { health: WeeklyStats['health']; last_cron_at: string | null }) {
  const issues = [
    { label: 'Awaiting Approval',   count: health.awaiting_approval,    href: '/boards/approval',   color: 'text-orange-600', icon: Clock         },
    { label: 'Send Failed',         count: health.send_failed,          href: '/boards/outreach',   color: 'text-red-600',    icon: AlertTriangle },
    { label: 'Research Incomplete', count: health.research_incomplete,  href: '/boards/researching',color: 'text-amber-600',  icon: AlertTriangle },
    { label: 'Follow-up Pending',   count: health.followup_pending,     href: '/boards/approval',   color: 'text-blue-600',   icon: Send          },
  ]

  const hasIssues = issues.some(i => i.count > 0)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          {hasIssues
            ? <AlertTriangle size={13} className="text-amber-400" />
            : <CheckCircle2  size={13} className="text-emerald-400" />}
          System Health
        </p>
        {last_cron_at && (
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <RefreshCw size={10} />
            {relativeTime(last_cron_at)}
          </span>
        )}
      </div>
      <div className="space-y-1 flex-1">
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

// ─── Activity feed ────────────────────────────────────────────────────────────

function ActivityFeed({ activity }: { activity: WeeklyStats['recent_activity'] }) {
  const statusDot: Record<string, string> = {
    success: 'bg-emerald-400',
    error:   'bg-red-400',
    skipped: 'bg-gray-300',
  }
  const agentColor: Record<string, string> = {
    'webhook':          'text-indigo-600 bg-indigo-50',
    'daily-pull':       'text-blue-600 bg-blue-50',
    'followup-check':   'text-cyan-600 bg-cyan-50',
    'research':         'text-amber-600 bg-amber-50',
    'content':          'text-violet-600 bg-violet-50',
    'content-generator':'text-violet-600 bg-violet-50',
    'cron-pipeline':    'text-indigo-600 bg-indigo-50',
  }

  if (activity.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col">
        <p className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Activity size={13} className="text-gray-400" strokeWidth={1.5} />
          Agent Activity
        </p>
        <p className="text-sm text-gray-400 text-center py-4">No activity yet — waiting for first agent run.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Activity size={13} className="text-gray-400" strokeWidth={1.5} />
          Recent Agent Activity
        </p>
        <Link href="/boards/activity" className="text-[11px] text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
          View all <ArrowRight size={10} />
        </Link>
      </div>
      <div className="space-y-1 overflow-y-auto">
        {activity.map((row, i) => (
          <div key={i} className="flex items-center gap-3 py-1.5 px-1">
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', statusDot[row.status] ?? 'bg-gray-300')} />
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
    <div className="px-8 pt-6 pb-12 bg-[#F9FAFB] min-h-full">

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">Cold outreach pipeline</p>
        </div>
        <RunPipelineButton lastCronAt={last_cron_at} />
      </div>

      {/* Pipeline Flow — the hero */}
      <PipelineFlow />

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3 mt-4">
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

      {/* Health + Activity side by side */}
      <div className="mt-4 grid grid-cols-[280px_1fr] gap-4">
        <HealthPanel health={health} last_cron_at={last_cron_at} />
        <ActivityFeed activity={recent_activity} />
      </div>

    </div>
  )
}
