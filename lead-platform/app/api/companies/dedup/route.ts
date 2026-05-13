import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

type Row = {
  id: string
  name: string
  status: string
  created_at: string
  contact_phone: string | null
  contact_email: string | null
  contact_name:  string | null
  domain:        string | null
  industry:      string | null
  notes:         string | null
  score:         number | null
}

function normalizePhone(p: string | null): string | null {
  if (!p) return null
  const digits = p.replace(/\D/g, '')
  return digits.length >= 7 ? digits : null
}

function normalizeEmail(e: string | null): string | null {
  if (!e) return null
  const t = e.trim().toLowerCase()
  return t.includes('@') ? t : null
}

const hasHebrew = (s: string) => /[֐-׿]/.test(s)

// Union-find: group companies that share a phone or email
function buildGroups(data: Row[]): Row[][] {
  const parent = new Map<string, string>()

  function find(id: string): string {
    if (!parent.has(id)) parent.set(id, id)
    const p = parent.get(id)!
    if (p !== id) { parent.set(id, find(p)); return parent.get(id)! }
    return id
  }

  function union(a: string, b: string) {
    const pa = find(a), pb = find(b)
    if (pa !== pb) parent.set(pa, pb)
  }

  data.forEach(r => parent.set(r.id, r.id))

  const byPhone = new Map<string, string>()
  const byEmail = new Map<string, string>()

  for (const row of data) {
    const phone = normalizePhone(row.contact_phone)
    if (phone) {
      if (byPhone.has(phone)) union(row.id, byPhone.get(phone)!)
      else byPhone.set(phone, row.id)
    }
    const email = normalizeEmail(row.contact_email)
    if (email) {
      if (byEmail.has(email)) union(row.id, byEmail.get(email)!)
      else byEmail.set(email, row.id)
    }
  }

  const groupMap = new Map<string, Row[]>()
  for (const row of data) {
    const root = find(row.id)
    if (!groupMap.has(root)) groupMap.set(root, [])
    groupMap.get(root)!.push(row)
  }

  return [...groupMap.values()].filter(g => g.length > 1)
}

// GET → preview duplicate groups
export async function GET() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, status, created_at, contact_phone, contact_email, contact_name, domain, industry, notes, score')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const groups = buildGroups(data ?? [])
  return NextResponse.json({ total_duplicates: groups.length, groups })
}

// POST → merge each duplicate group: keep Hebrew-named entry, copy missing fields, delete rest
export async function POST() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, status, created_at, contact_phone, contact_email, contact_name, domain, industry, notes, score')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const groups = buildGroups(data ?? [])
  if (groups.length === 0) return NextResponse.json({ merged: 0, message: 'אין כפילויות' })

  const toDelete: string[] = []
  let merged = 0

  for (const group of groups) {
    // Prefer the entry with a Hebrew name; among ties, prefer newest
    const keeper = group.find(r => hasHebrew(r.name)) ?? group[0]
    const others = group.filter(r => r.id !== keeper.id)

    // Merge missing fields from duplicates into keeper
    const patch: Partial<Row> = {}
    for (const other of others) {
      if (!keeper.contact_phone && other.contact_phone) patch.contact_phone = other.contact_phone
      if (!keeper.contact_email && other.contact_email) patch.contact_email = other.contact_email
      if (!keeper.contact_name  && other.contact_name)  patch.contact_name  = other.contact_name
      if (!keeper.domain        && other.domain)         patch.domain        = other.domain
      if (!keeper.notes && other.notes) patch.notes = other.notes
      if ((keeper.score ?? 0) === 0 && (other.score ?? 0) > 0) patch.score = other.score
    }

    if (Object.keys(patch).length > 0) {
      await supabase.from('companies').update(patch).eq('id', keeper.id)
    }

    toDelete.push(...others.map(r => r.id))
    merged++
  }

  if (toDelete.length > 0) {
    const { error: delErr } = await supabase
      .from('companies')
      .delete()
      .in('id', toDelete)
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })
  }

  return NextResponse.json({ merged, deleted: toDelete.length })
}
