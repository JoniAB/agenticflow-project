import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET  → find duplicates (preview)
// POST → delete duplicates (keep newest per name)
export async function GET() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, status, created_at')
    .order('name')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const groups = new Map<string, typeof data>()
  for (const row of data ?? []) {
    const key = row.name.trim().toLowerCase()
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(row)
  }

  const duplicates = [...groups.values()].filter(g => g.length > 1)
  return NextResponse.json({ total_duplicates: duplicates.length, groups: duplicates })
}

export async function POST() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, status, created_at')
    .order('name')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const groups = new Map<string, typeof data>()
  for (const row of data ?? []) {
    const key = row.name.trim().toLowerCase()
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(row)
  }

  const toDelete: string[] = []
  for (const group of groups.values()) {
    if (group.length <= 1) continue
    // Keep first (newest, due to order), delete the rest
    toDelete.push(...group.slice(1).map(r => r.id))
  }

  if (toDelete.length === 0) {
    return NextResponse.json({ deleted: 0, message: 'אין כפילויות' })
  }

  const { error: delErr } = await supabase
    .from('companies')
    .delete()
    .in('id', toDelete)

  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })

  return NextResponse.json({ deleted: toDelete.length, ids: toDelete })
}
