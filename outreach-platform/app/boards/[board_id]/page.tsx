import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'
import { BOARDS } from '@/lib/board-config'
import { getMockLeadsByBoard } from '@/lib/mock-data'
import { Lead } from '@/lib/types'
import { LeadTable } from '@/components/boards/LeadTable'
import { DashboardStrip } from '@/components/boards/DashboardStrip'

async function getLeads(boardId: string): Promise<Lead[]> {
  try {
    const supabase = getSupabaseAdmin()
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('current_board', boardId)
      .order('updated_at', { ascending: false })
    if (data && data.length > 0) return data
  } catch {}
  return getMockLeadsByBoard(boardId)
}

async function getAllLeads(): Promise<Lead[]> {
  try {
    const supabase = getSupabaseAdmin()
    const { data } = await supabase.from('leads').select('*')
    if (data && data.length > 0) return data
  } catch {}
  const { MOCK_LEADS } = await import('@/lib/mock-data')
  return MOCK_LEADS
}

interface Props {
  params: Promise<{ board_id: string }>
}

export default async function BoardPage({ params }: Props) {
  const { board_id } = await params
  const board = BOARDS.find(b => b.id === board_id)
  if (!board) notFound()

  const [leads, allLeads] = await Promise.all([getLeads(board_id), getAllLeads()])
  const showIcp = ['B-03', 'B-04', 'B-05', 'B-06', 'B-07', 'B-08'].includes(board_id)
  const showChannel = ['B-04', 'B-05', 'B-06', 'B-07'].includes(board_id)

  return (
    <div>
      <DashboardStrip leads={allLeads} />

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            <span className="text-gray-400 font-mono text-sm mr-2">{board.id}</span>
            {board.name}
          </h1>
          <p className="text-sm text-gray-500">{board.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{leads.length} lead{leads.length !== 1 ? 's' : ''}</span>
          {board.ownerAgent && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">{board.ownerAgent}</span>
          )}
        </div>
      </div>

      <LeadTable leads={leads} showIcp={showIcp} showChannel={showChannel} />
    </div>
  )
}
