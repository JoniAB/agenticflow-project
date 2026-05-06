import { NextRequest, NextResponse } from 'next/server'
import { validateAgentKey, getAgentId } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { BOARD_NEXT, STATUS_ON_ADVANCE } from '@/lib/board-config'
import { BoardId } from '@/lib/types'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lead_id: string }> }
) {
  const authError = validateAgentKey(request)
  if (authError) return authError

  const { lead_id } = await params
  const agentId = getAgentId(request)
  const body = await request.json().catch(() => ({}))
  const notes = body.notes ?? null

  const supabase = getSupabaseAdmin()

  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('lead_id, current_board, status')
    .eq('lead_id', lead_id)
    .single()

  if (fetchError || !lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

  const currentBoard = lead.current_board as BoardId
  const nextBoard = BOARD_NEXT[currentBoard]

  if (!nextBoard) {
    return NextResponse.json({ error: `Board ${currentBoard} has no next board` }, { status: 422 })
  }

  const newStatus = STATUS_ON_ADVANCE[currentBoard] ?? 'new'

  const { error: updateError } = await supabase
    .from('leads')
    .update({ current_board: nextBoard, status: newStatus })
    .eq('lead_id', lead_id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  await supabase.from('activity_log').insert({
    lead_id,
    type: 'advance',
    body: notes ?? `Advanced from ${currentBoard} to ${nextBoard}.`,
    agent_id: agentId,
  })

  return NextResponse.json({
    lead_id,
    previous_board: currentBoard,
    current_board: nextBoard,
    status: newStatus,
    advanced_at: new Date().toISOString(),
  })
}
