'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { useSelection } from '@/components/providers/SelectionProvider'
import type { Company, CompanyStatus } from '@/lib/types'
import { Users, FileText, Send, PauseCircle, GripVertical, Layers } from 'lucide-react'

// ─── Column definitions ───────────────────────────────────────────────────────

type ColumnDef = {
  id: string
  label: string
  icon: React.ElementType
  dropStatus: CompanyStatus
  statuses: CompanyStatus[]
  border: string
  header: string
  over: string
}

const COLUMNS: ColumnDef[] = [
  { id: 'potential', label: 'Potential Clients',  icon: Users,        dropStatus: 'high_score',        statuses: ['high_score', 'in_research'],                          border: 'border-indigo-200', header: 'bg-indigo-50 text-indigo-700', over: 'bg-indigo-50'  },
  { id: 'content',   label: 'Content Generation', icon: FileText,     dropStatus: 'content_ready',     statuses: ['content_ready'],                                     border: 'border-violet-200', header: 'bg-violet-50 text-violet-700', over: 'bg-violet-50'  },
  { id: 'approval',  label: 'Ready to Send',      icon: Send,         dropStatus: 'awaiting_approval', statuses: ['awaiting_approval', 'approved', 'edit_required'],     border: 'border-emerald-200',header: 'bg-emerald-50 text-emerald-700',over: 'bg-emerald-50' },
  { id: 'standby',   label: 'Standby',            icon: PauseCircle,  dropStatus: 'standby',           statuses: ['standby'],                                           border: 'border-gray-200',   header: 'bg-gray-100 text-gray-600',    over: 'bg-gray-100'   },
]

function colForStatus(status: CompanyStatus): ColumnDef | undefined {
  return COLUMNS.find(c => c.statuses.includes(status))
}

function colForId(id: string): ColumnDef | undefined {
  return COLUMNS.find(c => c.id === id)
}

// ─── Score badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 80 ? 'bg-emerald-100 text-emerald-700' :
    score >= 60 ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-500'
  return <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums', cls)}>{score}</span>
}

// ─── Sortable card ────────────────────────────────────────────────────────────

function KanbanCard({
  company,
  isSelected,
  onToggle,
  overlay = false,
  multiCount,
}: {
  company: Company
  isSelected: boolean
  onToggle: (id: string) => void
  overlay?: boolean
  multiCount?: number
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: company.id,
    data: { company },
  })

  const style = overlay ? undefined : {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      className={cn(
        'relative bg-white border rounded-xl p-3 select-none',
        overlay  && 'shadow-2xl ring-2 ring-indigo-400 rotate-[1.5deg] cursor-grabbing',
        !overlay && isDragging && 'opacity-30 shadow-none',
        !overlay && !isDragging && 'shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing',
        isSelected && !overlay && 'ring-2 ring-indigo-300',
      )}
    >
      {overlay && multiCount && multiCount > 1 && (
        <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
          {multiCount}
        </div>
      )}

      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(company.id)}
          onClick={e => e.stopPropagation()}
          className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-400 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{company.name}</p>
          {company.industry && (
            <p className="text-[11px] text-gray-400 truncate mt-0.5">{company.industry}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {company.score > 0 && <ScoreBadge score={company.score} />}
          {!overlay && (
            <span {...listeners} {...attributes} className="p-0.5 text-gray-300 hover:text-gray-500 touch-none">
              <GripVertical size={14} />
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Droppable + Sortable column ──────────────────────────────────────────────

function KanbanColumn({
  col, items, selected, onToggle,
}: {
  col: ColumnDef
  items: Company[]
  selected: Set<string>
  onToggle: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })
  const Icon = col.icon

  return (
    <div className="flex flex-col w-[260px] shrink-0 h-full">
      <div className={cn('flex items-center gap-2 px-3 py-2.5 rounded-t-xl border border-b-0', col.border)}>
        <div className={cn('flex items-center gap-1.5 flex-1 min-w-0 px-2 py-1 rounded-lg text-xs font-semibold', col.header)}>
          <Icon size={12} className="shrink-0" />
          <span className="truncate">{col.label}</span>
        </div>
        <span className="text-[11px] font-bold text-gray-400 tabular-nums shrink-0">{items.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-2 rounded-b-xl border overflow-y-auto transition-colors min-h-[120px]',
          col.border,
          isOver ? col.over : 'bg-gray-50/40',
        )}
      >
        <SortableContext items={items.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.length === 0 && !isOver && (
              <div className="flex items-center justify-center py-8 text-gray-300 text-[11px]">Drop here</div>
            )}
            {items.map(c => (
              <KanbanCard
                key={c.id}
                company={c}
                isSelected={selected.has(c.id)}
                onToggle={onToggle}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}

// ─── Main board ───────────────────────────────────────────────────────────────

type ColState = Record<string, Company[]>

function buildColState(leads: Company[]): ColState {
  const state: ColState = {}
  for (const col of COLUMNS) state[col.id] = []
  for (const lead of leads) {
    const col = colForStatus(lead.status)
    if (col) state[col.id].push(lead)
  }
  return state
}

export function KanbanBoard({ initialLeads }: { initialLeads: Company[] }) {
  const [cols, setCols]         = useState<ColState>(() => buildColState(initialLeads))
  const [activeId, setActiveId] = useState<string | null>(null)
  const { selected, toggle, clear } = useSelection()
  const router     = useRouter()
  const saveRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestCols = useRef<ColState>(buildColState(initialLeads))

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  // Keep ref in sync so the save closure always reads latest state
  const setCols2 = (fn: (prev: ColState) => ColState) => {
    setCols(prev => {
      const next = fn(prev)
      latestCols.current = next
      return next
    })
  }

  const activeCompany = activeId
    ? Object.values(cols).flat().find(c => c.id === activeId) ?? null
    : null

  const dragIds = activeId && selected.has(activeId)
    ? [...selected]
    : activeId ? [activeId] : []

  function findColIdForItem(itemId: string): string | undefined {
    return COLUMNS.find(col => cols[col.id].some(c => c.id === itemId))?.id
  }

  function onDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over || active.id === over.id) return

    const activeColId = findColIdForItem(active.id as string)
    const overColId   = colForId(over.id as string)?.id ?? findColIdForItem(over.id as string)
    if (!activeColId || !overColId) return

    setCols2(prev => {
      const activeItems = [...prev[activeColId]]
      const overItems   = [...prev[overColId]]
      const activeIdx   = activeItems.findIndex(c => c.id === active.id)
      if (activeIdx === -1) return prev

      if (activeColId === overColId) {
        const overIdx = overItems.findIndex(c => c.id === over.id)
        if (overIdx === -1) return prev
        return { ...prev, [activeColId]: arrayMove(activeItems, activeIdx, overIdx) }
      }

      // Move to new column — keep original status (status update happens in onDragEnd save)
      const movedItem = { ...activeItems[activeIdx] }
      activeItems.splice(activeIdx, 1)
      const overIdx = overItems.findIndex(c => c.id === over.id)
      if (overIdx === -1) overItems.push(movedItem)
      else overItems.splice(overIdx, 0, movedItem)
      return { ...prev, [activeColId]: activeItems, [overColId]: overItems }
    })
  }

  function scheduleSave() {
    if (saveRef.current) clearTimeout(saveRef.current)
    saveRef.current = setTimeout(() => {
      const current = latestCols.current
      const updates: Array<{ id: string; kanban_position: number; status: string }> = []
      for (const col of COLUMNS) {
        current[col.id].forEach((c, i) => {
          // Always set status = dropStatus of the column the item is currently in
          updates.push({ id: c.id, kanban_position: i, status: col.dropStatus })
        })
      }
      if (updates.length === 0) return
      fetch('/api/companies/bulk', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'reorder', ids: updates.map(u => u.id), updates }),
      }).then(() => {
        window.dispatchEvent(new CustomEvent('boards-refresh'))
        router.refresh()
      }).catch(() => {})
    }, 600)
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over) return

    const activeColId = findColIdForItem(active.id as string) ?? colForId(over.id as string)?.id
    if (!activeColId) return

    // Multi-drag: move all selected to target column
    if (selected.has(active.id as string) && dragIds.length > 1) {
      const targetCol = colForId(activeColId)
      if (!targetCol) return
      setCols2(prev => {
        const next = { ...prev }
        for (const col of COLUMNS) next[col.id] = prev[col.id].filter(c => !selected.has(c.id))
        const alreadyInCol = prev[activeColId].filter(c => selected.has(c.id))
        const extras = dragIds
          .filter(id => !alreadyInCol.some(c => c.id === id))
          .map(id => Object.values(prev).flat().find(c => c.id === id))
          .filter(Boolean) as Company[]
        next[activeColId] = [...alreadyInCol, ...next[activeColId], ...extras]
        return next
      })
      clear()
    }

    scheduleSave()
  }

  return (
    <div className="px-8 pt-8 pb-4 h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white">
          <Layers size={18} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
          <p className="text-sm text-gray-400 mt-0.5">גרור בין עמודות ובתוך עמודה — הסדר נשמר אוטומטית</p>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto flex-1 items-start pb-4">
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              col={col}
              items={cols[col.id]}
              selected={selected}
              onToggle={toggle}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeCompany && (
            <KanbanCard
              company={activeCompany}
              isSelected={false}
              onToggle={() => {}}
              overlay
              multiCount={dragIds.length}
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
