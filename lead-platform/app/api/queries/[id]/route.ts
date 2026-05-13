import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { QueryStatus } from '../route'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status } = await req.json() as { status: QueryStatus }
  if (!status) return NextResponse.json({ error: 'status required' }, { status: 400 })

  const supabase = getSupabaseAdmin()

  // Read current payload then update it
  const { data: current, error: fetchErr } = await supabase
    .from('agent_log')
    .select('payload')
    .eq('id', id)
    .single()

  if (fetchErr || !current) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const { error } = await supabase
    .from('agent_log')
    .update({ payload: { ...(current.payload as object), status } })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ updated: true, status })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from('agent_log')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
