'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { BOARDS } from '@/lib/board-config'
import { MOCK_LEADS } from '@/lib/mock-data'
import { NAV_HEBREW } from '@/lib/hebrew'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Activity, BookOpen } from 'lucide-react'

const PIPELINE_BOARDS = BOARDS.filter(b => !['B-08'].includes(b.id))
const ARCHIVE_BOARD = BOARDS.find(b => b.id === 'B-08')!

function getBoardCount(boardId: string) {
  return MOCK_LEADS.filter(l => l.current_board === boardId).length || null
}

interface NavItemProps {
  href: string
  label: string
  isActive: boolean
  count?: number | null
  icon?: React.ReactNode
}

function NavItem({ href, label, isActive, count, icon }: NavItemProps) {
  const hebrew = NAV_HEBREW[label]
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all mx-2',
        isActive
          ? 'bg-indigo-600 text-white font-medium'
          : 'text-gray-400 hover:text-white hover:bg-white/10'
      )}
    >
      {icon && <span className="w-4 h-4 shrink-0">{icon}</span>}
      <Tooltip hebrew={hebrew ?? label} dir="top">
        <span className="flex-1 truncate">{label}</span>
      </Tooltip>
      {count != null && (
        <span className={cn(
          'ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium min-w-[20px] text-center',
          isActive ? 'bg-white/20 text-white' : 'bg-indigo-500/80 text-white'
        )}>
          {count}
        </span>
      )}
    </Link>
  )
}

export function Sidebar() {
  const params = useParams()
  const pathname = usePathname()
  const currentBoard = params?.board_id as string

  return (
    <aside className="w-56 shrink-0 flex flex-col h-full bg-[#12141f] border-r border-white/5">
      {/* User header */}
      <div className="px-4 py-4 flex items-center gap-3 border-b border-white/5">
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
          YA
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-medium truncate">Yoni Aloni</p>
          <p className="text-gray-500 text-xs">Agents</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 space-y-4">
        {/* Overview */}
        <div>
          <p className="px-5 text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-1">Overview</p>
          <NavItem
            href="/boards/B-01"
            label="Dashboard"
            isActive={pathname === '/dashboard'}
            icon={<LayoutDashboard className="w-4 h-4" />}
          />
        </div>

        {/* Pipeline */}
        <div>
          <p className="px-5 text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-1">Pipeline</p>
          {PIPELINE_BOARDS.map(board => (
            <NavItem
              key={board.id}
              href={`/boards/${board.id}`}
              label={board.name}
              isActive={currentBoard === board.id}
              count={getBoardCount(board.id)}
            />
          ))}
        </div>

        {/* System */}
        <div>
          <p className="px-5 text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-1">System</p>
          <NavItem
            href={`/boards/${ARCHIVE_BOARD.id}`}
            label="Archive"
            isActive={currentBoard === 'B-08'}
            count={getBoardCount('B-08')}
          />
          <NavItem
            href="/boards/B-01"
            label="Agent Activity"
            isActive={false}
            icon={<Activity className="w-4 h-4" />}
          />
          <NavItem
            href="/boards/B-01"
            label="API Docs"
            isActive={false}
            icon={<BookOpen className="w-4 h-4" />}
          />
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-4 py-3 border-t border-white/5 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 text-xs font-bold">
          N
        </div>
        <div className="min-w-0">
          <p className="text-gray-400 text-xs truncate">Yoni Automation</p>
          <p className="text-gray-600 text-[10px]">v1.0</p>
        </div>
      </div>
    </aside>
  )
}
