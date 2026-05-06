import { NextResponse } from 'next/server'
import { BOARDS } from '@/lib/board-config'

export async function GET() {
  return NextResponse.json(BOARDS)
}
