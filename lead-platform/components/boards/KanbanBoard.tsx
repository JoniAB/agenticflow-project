'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { useSelection } from '@/components/providers/SelectionProvider'
import type { Company, CompanyStatus } from '@/lib/types'
import {
  Search, Users, FileText, Send, Mail, PauseCircle,
  GripVertical, Layers,
} from 'lucide-react'

// ─── Column config ────────────────────────────────────────────────────────────

type ColumnDef = {
  id: string
  label: string
  hebrew: string
  icon: React.ElementType
  dropStatus: CompanyStatus
  statuses: CompanyStatus[]
  color: string
  headerColor: string
}

const COLUMNS: ColumnDef[] = [
  {
    id: 'prospects',
    label: 'Prospect Research',
    hebrew: 'מחקר לידים',
    icon: Search,
    dropStatus: 'potential',
    statuses: ['potential', 'research_incomplete'],
    color: 'border-blue-200',
    headerColor: 'bg-blue-50 text-blue-700',
  },
  {
    id: 'potential',
    label: 'Potential Clients',
    hebrew: 'לקוחות פוטנציאליים',
    icon: Users,
    dropStatus: 'high_score',
    statuses: ['high_score', 'in_research'],
    color: 'border-indigo-200',
    headerColor: 'bg-indigo-50 text-indigo-700',
  },
  {
    id: 'content',
    label: 'Content Generation',
    hebrew: 'יצירת תוכן',
    icon: FileText,
    dropStatus: 'content_ready',
    statuses: ['content_ready'],
    color: 'border-violet-200',
    headerColor: 'bg-violet-50 text-violet-700',
  },
  {
    id: 'approval',
    label: 'Ready to Send',
    hebrew: 'מוכן לשליחה',
    icon: Send,
    dropStatus: 'awaiting_approval',
    statuses: ['awaiting_approval', 'approved', 'edit_required'],
    color: 'border-emerald-200',
    headerColor: 'bg-emerald-50 text-emerald-700',
  },
  {
    id: 'mail',
    label: 'Mail',
    hebrew: 'דואר',
    icon: Mail,
    dropStatus: 'sent',
    statuses: ['sent', 'replied', 'followup_sent', 'send_failed'],
    color: 'border-orange-200',
    headerColor: 'bg-orange-50 text-orange-700',
  },
  {
    id: 'standby',
    label: 'Standby',
    hebrew: 'המתנה',
    icon: PauseCircle,
    dropStatus: 'standby',
    statuses: ['standby'],
    color: 'border-gray-200',
    headerColor: 'bg-gray-100 text-gray-600',
  },
]

// ─── Score badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? 'bg-emerald-100 text-emerald-700' :
    score >= 60 ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-500'
  return (
    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums', color)}>
      {score}
    </span>
  )
}

// ─── Draggable Card ───────────────────────────────────────────────────────────

function KanbanCard({
  company,
  isSelected,
  onToggle,
  isDragOverlay = false,
  multiCount,
}: {
  company: Company
  isSelected: boolean
  onToggle: (id: string) => void
  isDragOverlay?: boolean
  multiCount?: number
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: company.id,
    data: { company },
  })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={isDragOverlay ? undefined : style}
      className={cn(
        'group relative bg-white border rounded-xl p-3 select-none',
        'transition-shadow',
        isDragging && !isDragOverlay && 'opacity-40 shadow-none',
        isDragOverlay && 'shadow-2xl ring-2 ring-indigo-400 rotate-1 cursor-grabbing',
        !isDragging && !isDragOverlay && 'shadow-sm hover:shadow-md cursor-grab',
        isSelected && !isDragOverlay && 'ring-2 ring-indigo-400',
      )}
    >
      {/* Multi-drag badge */}
      {isDragOverlay && multiCount && multiCount > 1 && (
        <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
          {multiCount}
        </div>
      )}

      <div className="flex items-start gap-2">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(company.id)}
          onClick={e => e.stopPropagation()}
          className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-400 shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{company.name}</p>
          {company.industry && (
            <p className="text-[11px] text-gray-400 truncate mt-0.5">{company.industry}</p>
          )}
        </div>

        {/* Score + drag handle */}
        <div className="flex items-center gap-1 shrink-0">
          {company.score > 0 && <ScoreBadge score={company.score} />}
          <span
            {...(isDragOverlay ? {} : { ...listeners, ...attributes })}
            className="p-0.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
          >
            <GripVertical size={14} />
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Droppable Column ─────────────────────────────────────────────────────────

function KanbanColumn({
  col,
  leads,
  selected,
  onToggle,
}: {
  col: ColumnDef
  leads: Company[]
  selected: Set<string>
  onToggle: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })
  const Icon = col.icon

  return (
    <div className="flex flex-col w-64 shrink-0">
      {/* Column header */}
      <div className={cn('flex items-center gap-2 px-3 py-2.5 rounded-t-xl border border-b-0', col.color)}>
        <div className={cn('flex items-center gap-1.5 flex-1 min-w-0 px-2 py-1 rounded-lg text-xs font-semibold', col.headerColor)}>
          <Icon size={12} className="shrink-0" />
          <span className="truncate">{col.label}</span>
        </div>
        <span className="text-[11px] font-bold text-gray-400 tabular-nums shrink-0">{leads.length}</span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 min-h-[200px] p-2 space-y-2 rounded-b-xl border overflow-y-auto',
          'transition-colors',
          col.color,
          isOver ? 'bg-indigo-50/60' : 'bg-gray-50/40',
        )}
      >
        {leads.length === 0 && !isOver && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-300">
            <Layers size={20} className="mb-1.5 opacity-40" />
            <p className="text-[11px]">Drop here</p>
          </div>
        )}
        {leads.map(c => (
          <KanbanCard
            key={c.id}
            company={c}
            isSelected={selected.has(c.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main Board ───────────────────────────────────────────────────────────────

export function KanbanBoard({ initialLeads }: { initialLeads: Company[] }) {
  const [leads, setLeads]       = useState<Company[]>(initialLeads)
  const [activeId, setActiveId] = useState<string | null>(null)
  const { selected, toggle, clear } = useSelection()
  const router = useRouter()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const leadsForCol = useCallback(
    (col: ColumnDef) => leads.filter(c => col.statuses.includes(c.status)),
    [leads],
  )

  const activeCompany = activeId ? leads.find(c => c.id === activeId) ?? null : null

  // IDs being dragged: if dragged item is selected, drag all selected; otherwise just this one
  const dragIds = activeId && selected.has(activeId)
    ? [...selected]
    : activeId
      ? [activeId]
      : []

  function onDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  async function onDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over) return

    const targetCol  = COLUMNS.find(c => c.id === over.id)
    if (!targetCol) return

    const targetStatus = targetCol.dropStatus
    const ids = dragIds

    // Skip if no real change
    const alreadyThere = ids.every(id => {
      const lead = leads.find(l => l.id === id)
      return lead && targetCol.statuses.includes(lead.status)
    })
    if (alreadyThere) return

    // Optimistic update
    setLeads(prev =>
      prev.map(l => ids.includes(l.id) ? { ...l, status: targetStatus } : l),
    )
    if (selected.has(active.id as string)) clear()

    try {
      await fetch('/api/companies/bulk', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'set_status', status: targetStatus, ids }),
      })
      window.dispatchEvent(new CustomEvent('boards-refresh'))
      router.refresh()
    } catch {
      // Revert on failure
      setLeads(initialLeads)
    }
  }

  return (
    <div className="px-8 pt-8 pb-12 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white">
          <Layers size={18} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
          <p className="text-sm text-gray-400 mt-0.5">גרור לידים בין עמודות — סמן מספר לידים וגרור את כולם יחד</p>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        {/* Columns */}
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start">
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              col={col}
              leads={leadsForCol(col)}
              selected={selected}
              onToggle={toggle}
            />
          ))}
        </div>

        {/* Drag overlay */}
        <DragOverlay dropAnimation={null}>
          {activeCompany && (
            <KanbanCard
              company={activeCompany}
              isSelected={false}
              onToggle={() => {}}
              isDragOverlay
              multiCount={dragIds.length}
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
