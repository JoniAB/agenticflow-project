import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { STATUS_TO_BOARD, type CompanyStatus } from '@/lib/types'

export async function POST(req: Request) {
  const body = await req.json()
  const { action, ids, keep_id, status } = body as {
    action: 'delete' | 'standby' | 'merge' | 'set_status'
    ids: string[]
    keep_id?: string
    status?: string
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids required' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  if (action === 'delete') {
    const { error } = await supabase.from('companies').delete().in('id', ids)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, deleted: ids.length })
  }

  if (action === 'standby') {
    const { error } = await supabase.from('companies').update({ status: 'standby' }).in('id', ids)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, moved: ids.length })
  }

  if (action === 'merge') {
    if (!keep_id || !ids.includes(keep_id)) {
      return NextResponse.json({ error: 'keep_id must be one of ids' }, { status: 400 })
    }
    const to_delete = ids.filter(id => id !== keep_id)

    const { data: companies } = await supabase.from('companies').select('*').in('id', ids)
    if (!companies) return NextResponse.json({ error: 'not found' }, { status: 404 })

    const keeper = companies.find(c => c.id === keep_id)
    if (!keeper) return NextResponse.json({ error: 'keep_id not found' }, { status: 404 })

    const extras = companies.filter(c => c.id !== keep_id)
    const extraNotes = extras.map(c => c.notes).filter(Boolean).join('\n\n---\n\n')

    const updates: Record<string, unknown> = {}
    if (!keeper.contact_name) updates.contact_name = extras.find(c => c.contact_name)?.contact_name ?? null
    if (!keeper.contact_email) updates.contact_email = extras.find(c => c.contact_email)?.contact_email ?? null
    if (!keeper.contact_phone) updates.contact_phone = extras.find(c => c.contact_phone)?.contact_phone ?? null
    if (extraNotes) {
      updates.notes = keeper.notes ? `${keeper.notes}\n\n---\n\n${extraNotes}` : extraNotes
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from('companies').update(updates).eq('id', keep_id)
    }
    await supabase.from('companies').delete().in('id', to_delete)

    return NextResponse.json({ ok: true, kept: keep_id, deleted: to_delete.length })
  }

  if (action === 'set_status') {
    if (!status) return NextResponse.json({ error: 'status required' }, { status: 400 })
    const current_board = STATUS_TO_BOARD[status as CompanyStatus] ?? null
    const patch: Record<string, unknown> = { status }
    if (current_board) patch.current_board = current_board
    const { error } = await supabase.from('companies').update(patch).in('id', ids)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, updated: ids.length, status })
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 })
}
