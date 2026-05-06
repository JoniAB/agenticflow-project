import { NextRequest, NextResponse } from 'next/server'
import { BOARDS } from '@/lib/board-config'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ board_id: string }> }
) {
  const { board_id } = await params
  const board = BOARDS.find(b => b.id === board_id)
  if (!board) return NextResponse.json({ error: 'Board not found' }, { status: 404 })
  return NextResponse.json(board)
}
