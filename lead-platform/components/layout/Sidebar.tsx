'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/ui/Tooltip'
import {
  LayoutDashboard, Search, Users, FileText, Send, Mail,
  Clock, Activity, BookOpen, MessageSquare, Layers,
  Play, Loader2, CheckCircle2, XCircle, SlidersHorizontal, ShieldOff, PauseCircle,
} from 'lucide-react'
import { BoardMoveDropdown } from '@/components/layout/BoardMoveDropdown'

// ─── Counts hook ──────────────────────────────────────────────────────────────

type PipelineCounts = {
  prospects: number; potential: number; content: number
  approval: number;  outreach: number; history: number; standby: number
}

const ZERO: PipelineCounts = {
  prospects: 0, potential: 0, content: 0,
  approval: 0,  outreach: 0, history: 0, standby: 0,
}

function usePipelineCounts() {
  const [counts, setCounts] = useState<PipelineCounts>(ZERO)
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

// ─── Stage color tokens ────────────────────────────────────────────────────────

type StageColor = 'violet' | 'blue' | 'amber' | 'emerald' | 'sky'

const STAGE_STYLE: Record<StageColor, { dot: string; badge: string; border: string; activeBg: string }> = {
  violet:  { dot: 'bg-violet-500',  badge: 'bg-violet-500/20 text-violet-300',  border: 'border-l-violet-500',  activeBg: 'bg-violet-600/10'  },
  blue:    { dot: 'bg-blue-500',    badge: 'bg-blue-500/20 text-blue-300',      border: 'border-l-blue-500',    activeBg: 'bg-blue-600/10'    },
  amber:   { dot: 'bg-amber-500',   badge: 'bg-amber-500/20 text-amber-300',    border: 'border-l-amber-500',   activeBg: 'bg-amber-600/10'   },
  emerald: { dot: 'bg-emerald-500', badge: 'bg-emerald-500/20 text-emerald-300',border: 'border-l-emerald-500', activeBg: 'bg-emerald-600/10' },
  sky:     { dot: 'bg-sky-500',     badge: 'bg-sky-500/20 text-sky-300',        border: 'border-l-sky-500',     activeBg: 'bg-sky-600/10'     },
}

// ─── Pipeline stages ──────────────────────────────────────────────────────────

const PIPELINE = [
  { href: '/boards/champions',  segment: 'champions',  label: 'Find Leads',    icon: Search,   ck: 'prospects' as keyof PipelineCounts, color: 'violet'  as StageColor, gen: false },
  { href: '/boards/researching',segment: 'researching',label: 'Potential',     icon: Users,    ck: 'potential' as keyof PipelineCounts, color: 'blue'    as StageColor, gen: false },
  { href: '/boards/content',    segment: 'content',    label: 'Content',       icon: FileText, ck: 'content'   as keyof PipelineCounts, color: 'amber'   as StageColor, gen: true  },
  { href: '/boards/approval',   segment: 'approval',   label: 'Ready to Send', icon: Send,     ck: 'approval'  as keyof PipelineCounts, color: 'emerald' as StageColor, gen: false },
  { href: '/boards/outreach',   segment: 'outreach',   label: 'Sent',          icon: Mail,     ck: 'outreach'  as keyof PipelineCounts, color: 'sky'     as StageColor, gen: false },
]

// ─── Content gen button ───────────────────────────────────────────────────────

type RunStatus = 'idle' | 'auto' | 'loading' | 'done' | 'no_pending' | 'error'

function ContentGenButton() {
  const [status,      setStatus]      = useState<RunStatus>('idle')
  const [lastCompany, setLastCompany] = useState<string | null>(null)

  useEffect(() => {
    function onStart()  { setStatus('auto') }
    function onDone(e: Event) {
      setLastCompany((e as CustomEvent<{ name?: string }>).detail?.name ?? null)
      setStatus('auto')
    }
    function onIdle() {
      setStatus(prev => prev === 'auto' ? 'done' : prev)
      setTimeout(() => setStatus('idle'), 3000)
    }
    window.addEventListener('auto-gen-start', onStart)
    window.addEventListener('auto-gen-done',  onDone)
    window.addEventListener('auto-gen-idle',  onIdle)
    return () => {
      window.removeEventListener('auto-gen-start', onStart)
      window.removeEventListener('auto-gen-done',  onDone)
      window.removeEventListener('auto-gen-idle',  onIdle)
    }
  }, [])

  async function run(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    if (status === 'loading' || status === 'auto') return
    setStatus('loading'); setLastCompany(null)
    try {
      const res  = await fetch('/api/generate-content/next', { method: 'POST' })
      const data = await res.json()
      if (!res.ok)                            setStatus('error')
      else if (data.message === 'no_pending') setStatus('no_pending')
      else { setLastCompany(data.company?.name ?? null); setStatus('done') }
    } catch { setStatus('error') }
    finally  { setTimeout(() => setStatus('idle'), 4000) }
  }

  const spinning = status === 'auto' || status === 'loading'
  const tip =
    status === 'auto'       ? (lastCompany ? `מייצר: ${lastCompany}` : 'אוטומטי פעיל...') :
    status === 'loading'    ? 'מייצר תוכן...' :
    status === 'done'       ? (lastCompany ? `✓ ${lastCompany}` : 'נוצר') :
    status === 'no_pending' ? 'אין בתור' :
    status === 'error'      ? 'שגיאה' : 'הפעל יצירת תוכן'

  return (
    <Tooltip text={tip}>
      <button onClick={run} className={cn(
        'p-1.5 rounded transition-colors shrink-0',
        spinning                ? 'text-amber-400 cursor-wait' :
        status === 'done'       ? 'text-emerald-400' :
        status === 'error'      ? 'text-red-400' :
        status === 'no_pending' ? 'text-[#374151]' :
                                  'text-[#4B5563] hover:text-white hover:bg-white/10'
      )}>
        {spinning            ? <Loader2      size={10} className="animate-spin" /> :
         status === 'done'   ? <CheckCircle2 size={10} /> :
         status === 'error'  ? <XCircle      size={10} /> :
                               <Play         size={10} />}
      </button>
    </Tooltip>
  )
}

// ─── Other nav items ──────────────────────────────────────────────────────────

const VIEWS = [
  { href: '/boards/dashboard', segment: 'dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/boards/kanban',    segment: 'kanban',    label: 'Kanban Board', icon: Layers          },
]

const ARCHIVE = [
  { href: '/boards/history', segment: 'history', label: 'Client History', icon: Clock,       ck: 'history' as keyof PipelineCounts },
  { href: '/boards/standby', segment: 'standby', label: 'Standby',        icon: PauseCircle, ck: 'standby' as keyof PipelineCounts },
]

const TOOLS = [
  { href: '/boards/activity',  segment: 'activity',  label: 'Agent Activity',      icon: Activity          },
  { href: '/boards/settings',  segment: 'settings',  label: 'Search Criteria',     icon: SlidersHorizontal },
  { href: '/boards/blacklist', segment: 'blacklist', label: 'Blacklist & Queries',  icon: ShieldOff         },
  { href: '/boards/api-docs',  segment: 'api-docs',  label: 'API Documentation',   icon: BookOpen          },
  { href: '/boards/chat',      segment: 'chat',      label: 'Chat with Agents',    icon: MessageSquare     },
]

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname()
  const counts   = usePipelineCounts()

  return (
    <aside className="flex flex-col w-[232px] shrink-0 h-full bg-[#111827]">

      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 h-[60px] border-b border-white/[0.05] shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shrink-0 text-white font-bold text-sm">
          YA
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-[13px] leading-tight">AgenticFlow</p>
          <p className="text-[#374151] text-[10px] leading-tight">Cold Outreach</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-4">

        <div className="px-3">
          <BoardMoveDropdown />
        </div>

        {/* Views */}
        <div className="px-3 space-y-0.5">
          {VIEWS.map(item => {
            const active = pathname.startsWith(`/boards/${item.segment}`)
            return (
              <Link key={item.href} href={item.href} className={cn(
                'flex items-center gap-2.5 px-3 py-[6px] rounded-lg text-[12px] font-medium transition-colors',
                active ? 'bg-white/[0.08] text-white' : 'text-[#6B7280] hover:text-[#D1D5DB] hover:bg-white/[0.04]'
              )}>
                <item.icon size={13} strokeWidth={1.8} className="shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Pipeline */}
        <div>
          <p className="px-6 pb-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#374151]">
            Pipeline
          </p>
          {PIPELINE.map((stage, i) => {
            const active = pathname.startsWith(`/boards/${stage.segment}`)
            const c      = STAGE_STYLE[stage.color]
            const count  = counts[stage.ck]
            return (
              <div key={stage.href} className="flex items-center gap-0.5 pr-2">
                <Link href={stage.href} className={cn(
                  'flex items-center gap-2.5 flex-1 min-w-0 pl-5 pr-2 py-[8px] text-[12px] font-medium transition-all border-l-2',
                  active
                    ? cn('text-white', c.border, c.activeBg)
                    : 'border-l-transparent text-[#6B7280] hover:text-[#D1D5DB] hover:bg-white/[0.04] hover:border-l-white/[0.12]'
                )}>
                  <span className={cn(
                    'w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 transition-colors',
                    active ? cn(c.dot, 'text-white') : 'bg-[#1F2937] text-[#4B5563]'
                  )}>
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate">{stage.label}</span>
                  {count > 0 && (
                    <span className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums shrink-0',
                      active ? c.badge : 'text-[#374151]'
                    )}>
                      {count}
                    </span>
                  )}
                </Link>
                {stage.gen && <ContentGenButton />}
              </div>
            )
          })}
        </div>

        {/* Archive */}
        <div className="px-3">
          <p className="px-3 pb-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#374151]">
            Archive
          </p>
          <div className="space-y-0.5">
            {ARCHIVE.map(item => {
              const active = pathname.startsWith(`/boards/${item.segment}`)
              const count  = counts[item.ck]
              return (
                <Link key={item.href} href={item.href} className={cn(
                  'flex items-center gap-2.5 px-3 py-[6px] rounded-lg text-[12px] font-medium transition-colors',
                  active ? 'bg-white/[0.08] text-white' : 'text-[#6B7280] hover:text-[#D1D5DB] hover:bg-white/[0.04]'
                )}>
                  <item.icon size={13} strokeWidth={1.8} className="shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {count > 0 && <span className="text-[10px] text-[#374151] tabular-nums">{count}</span>}
                </Link>
              )
            })}
          </div>
        </div>

      </nav>

      {/* Tools — icon row */}
      <div className="px-3 py-2 border-t border-white/[0.05] flex items-center gap-0.5">
        {TOOLS.map(item => {
          const active = pathname.startsWith(`/boards/${item.segment}`)
          return (
            <Tooltip key={item.href} text={item.label}>
              <Link href={item.href} className={cn(
                'p-1.5 rounded-md transition-colors',
                active ? 'text-white bg-white/10' : 'text-[#374151] hover:text-[#9CA3AF] hover:bg-white/[0.06]'
              )}>
                <item.icon size={13} strokeWidth={1.8} />
              </Link>
            </Tooltip>
          )
        })}
        <span className="flex-1" />
        <span className="text-[9px] text-[#1F2937] font-medium">v1.0</span>
      </div>

    </aside>
  )
}
