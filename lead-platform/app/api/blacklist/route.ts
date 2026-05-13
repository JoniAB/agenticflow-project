import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export interface BlacklistCompany {
  id: string
  name: string
  domain: string
  added_at: string
}

async function readBlacklist(supabase: ReturnType<typeof getSupabaseAdmin>): Promise<BlacklistCompany[]> {
  const { data } = await supabase
    .from('agent_log')
    .select('payload')
    .eq('agent_name', 'system')
    .eq('action', 'blacklist')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data?.payload as { companies: BlacklistCompany[] })?.companies ?? []
}

async function saveBlacklist(supabase: ReturnType<typeof getSupabaseAdmin>, companies: BlacklistCompany[]) {
  await supabase.from('agent_log').insert({
    agent_name: 'system',
    action: 'blacklist',
    status: 'success',
    company_id: null,
    payload: { companies },
  })
}

export async function GET() {
  const supabase = getSupabaseAdmin()
  const companies = await readBlacklist(supabase)
  return NextResponse.json({ companies })
}

export async function POST(req: NextRequest) {
  const { name, domain } = await req.json()
  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const companies = await readBlacklist(supabase)

  const newItem: BlacklistCompany = {
    id: crypto.randomUUID(),
    name: name.trim(),
    domain: domain?.trim() ?? '',
    added_at: new Date().toISOString(),
  }

  companies.unshift(newItem)
  await saveBlacklist(supabase, companies)
  return NextResponse.json(newItem, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const companies = await readBlacklist(supabase)
  await saveBlacklist(supabase, companies.filter(c => c.id !== id))
  return NextResponse.json({ deleted: true })
}
