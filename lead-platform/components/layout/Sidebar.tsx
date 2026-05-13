'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/ui/Tooltip'
import {
  LayoutDashboard, Search, Users, FileText, Send, Inbox,
  Clock, Mail, Activity, BookOpen, MessageSquare,
  Play, Loader2, CheckCircle2, XCircle, SlidersHorizontal, ShieldOff,
} from 'lucide-react'

const OVERVIEW_NAV = [
  { href: '/boards/dashboard', label: 'Dashboard', hebrew: 'לוח מחוונים', icon: LayoutDashboard, segment: 'dashboard' },
]

type PipelineCounts = { prospects: number; approval: number; outreach: number; content: number }

function usePipelineCounts() {
  const [counts, setCounts] = useState<PipelineCounts>({ prospects: 0, approval: 0, outreach: 0, content: 0 })
  useEffect(() => {
    fetch('/api/stats/counts')
      .then(r => r.json())
      .then(setCounts)
      .catch(() => {})
  }, [])
  return counts
}

const PIPELINE_NAV = [
  { href: '/boards/champions',   label: 'Prospect Research',  hebrew: 'מחקר לידים',           icon: Search,   segment: 'champions',   countKey: 'prospects' as const },
  { href: '/boards/researching', label: 'Potential Clients',  hebrew: 'לקוחות פוטנציאליים',   icon: Users,    segment: 'researching', countKey: null },
  { href: '/boards/content',     label: 'Content Generation', hebrew: 'יצירת תוכן',            icon: FileText, segment: 'content',     countKey: 'content'   as const },
  { href: '/boards/approval',    label: 'Ready to Send',      hebrew: 'מוכן לשליחה',           icon: Send,     segment: 'approval',    countKey: 'approval'  as const },
  { href: '/boards/outreach',    label: 'Inbox',              hebrew: 'דואר נכנס',             icon: Inbox,    segment: 'outreach',    countKey: 'outreach'  as const },
  { href: '/boards/history',     label: 'Client History',     hebrew: 'היסטוריית לקוחות',      icon: Clock,    segment: 'history',     countKey: null },
]

const SYSTEM_NAV = [
  { href: '/boards/emails',     label: 'Email Review',        hebrew: 'סקירת מיילים',      icon: Mail,              segment: 'emails'     },
  { href: '/boards/activity',   label: 'Agent Activity',      hebrew: 'פעילות סוכנים',     icon: Activity,          segment: 'activity'   },
  { href: '/boards/settings',   label: 'Search Criteria',     hebrew: 'קריטריוני חיפוש',   icon: SlidersHorizontal, segment: 'settings'   },
  { href: '/boards/blacklist',  label: 'Blacklist & Queries', hebrew: 'רשימה שחורה ושאילתות', icon: ShieldOff,      segment: 'blacklist'  },
  { href: '/boards/api-docs',   label: 'API Documentation',   hebrew: 'תיעוד API',         icon: BookOpen,          segment: 'api-docs'   },
]

const AGENTS_NAV = [
  { href: '/boards/chat', label: 'Chat with Agents', hebrew: 'שיחה עם סוכנים', icon: MessageSquare, segment: 'chat' },
]

type RunStatus = 'idle' | 'loading' | 'done' | 'no_pending' | 'error'

function ContentGenButton() {
  const [status, setStatus] = useState<RunStatus>('idle')
  const [lastCompany, setLastCompany] = useState<string | null>(null)

  async function run(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (status === 'loading') return
    setStatus('loading')
    setLastCompany(null)

    try {
      const res  = await fetch('/api/generate-content/next', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
      } else if (data.message === 'no_pending') {
        setStatus('no_pending')
      } else {
        setLastCompany(data.company?.name ?? null)
        setStatus('done')
      }
    } catch {
      setStatus('error')
    } finally {
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  const icon =
    status === 'loading'    ? <Loader2    size={11} className="animate-spin" /> :
    status === 'done'       ? <CheckCircle2 size={11} className="text-emerald-400" /> :
    status === 'no_pending' ? <CheckCircle2 size={11} className="text-gray-400" /> :
    status === 'error'      ? <XCircle    size={11} className="text-red-400" /> :
                              <Play       size={11} />

  const tip =
    status === 'loading'    ? 'מייצר תוכן...' :
    status === 'done'       ? (lastCompany ? `✓ ${lastCompany}` : 'נוצר בהצלחה') :
    status === 'no_pending' ? 'אין לקוחות בתור' :
    status === 'error'      ? 'שגיאה — נסה שוב' :
                              'הפעל יצירת תוכן לפי סדר'

  return (
    <Tooltip text={tip}>
      <button
        onClick={run}
        className={cn(
          'p-1 rounded transition-colors shrink-0',
          status === 'loading'    ? 'text-indigo-300 cursor-wait' :
          status === 'done'       ? 'text-emerald-400' :
          status === 'no_pending' ? 'text-gray-500' :
          status === 'error'      ? 'text-red-400' :
                                    'text-[#5B6080] hover:text-white hover:bg-white/10'
        )}
      >
        {icon}
      </button>
    </Tooltip>
  )
}

function SectionLabel({ label, hebrew }: { label: string; hebrew: string }) {
  return (
    <Tooltip text={hebrew} className="px-3 mb-1">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#3D4060] cursor-default">
        {label}
      </p>
    </Tooltip>
  )
}

function NavItem({ href, label, hebrew, icon: Icon, segment, count, isActive, action }: {
  href: string; label: string; hebrew?: string; icon: React.ElementType
  segment: string; count?: number; isActive: boolean; action?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-0.5">
      <Link
        href={href}
        className={cn(
          'flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-colors flex-1 min-w-0',
          isActive
            ? 'bg-indigo-600 text-white'
            : 'text-[#8B90B0] hover:text-white hover:bg-white/[0.06]'
        )}
      >
        <Icon size={15} strokeWidth={1.8} className="shrink-0" />
        <Tooltip text={hebrew ?? label} className="flex-1 min-w-0">
          <span className="truncate w-full">{label}</span>
        </Tooltip>
        {count != null && count > 0 && (
          <span className={cn(
            'text-[11px] font-semibold rounded-full px-1.5 min-w-[20px] text-center tabular-nums',
            isActive ? 'bg-white/20 text-white' : 'text-[#5B6080]'
          )}>
          {count}
        </span>
      )}
    </Link>
    {action}
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const counts   = usePipelineCounts()
  return (
    <aside className="flex flex-col w-[256px] shrink-0 h-full bg-[#1C1D2E]">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 h-[60px] border-b border-white/[0.06]">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shrink-0 text-white font-bold text-sm">
          YA
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-[13px] leading-tight truncate">Yoni Aloni's</p>
          <p className="text-[#5B6080] text-[11px] leading-tight">Agents</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <div>
          <SectionLabel label="Overview" hebrew="סקירה כללית" />
          <div className="space-y-0.5">
            {OVERVIEW_NAV.map(item => (
              <NavItem key={item.href} {...item} count={0}
                isActive={pathname.startsWith(`/boards/${item.segment}`)} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel label="Pipeline" hebrew="צנרת מכירות" />
          <div className="space-y-0.5">
            {PIPELINE_NAV.map(item => (
              <NavItem key={item.href} {...item}
                count={item.countKey ? counts[item.countKey] : undefined}
                isActive={pathname.startsWith(`/boards/${item.segment}`)} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel label="System" hebrew="מערכת" />
          <div className="space-y-0.5">
            {SYSTEM_NAV.map(item => (
              <NavItem key={item.href} {...item} count={0}
                isActive={pathname.startsWith(`/boards/${item.segment}`)} />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel label="Agents" hebrew="סוכנים" />
          <div className="space-y-0.5">
            {AGENTS_NAV.map(item => (
              <NavItem key={item.href} {...item} count={0}
                isActive={pathname.startsWith(`/boards/${item.segment}`)} />
            ))}
          </div>
        </div>
      </nav>

      <div className="px-4 py-3 border-t border-white/[0.06]">
        <p className="text-[11px] text-[#3D4060]">Yoni Automation · v1.0</p>
      </div>
    </aside>
  )
}
