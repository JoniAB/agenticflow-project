import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { BlacklistCompany } from '../route'

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

// POST — import all pipeline companies into the blacklist (deduped by name)
export async function POST() {
  const supabase = getSupabaseAdmin()

  const { data: pipelineCompanies, error } = await supabase
    .from('companies')
    .select('id, name, domain')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const existing = await readBlacklist(supabase)
  const existingNames = new Set(existing.map(c => c.name.trim().toLowerCase()))

  const toAdd: BlacklistCompany[] = (pipelineCompanies ?? [])
    .filter(c => !existingNames.has(c.name.trim().toLowerCase()))
    .map(c => ({
      id: crypto.randomUUID(),
      name: c.name.trim(),
      domain: c.domain?.trim() ?? '',
      added_at: new Date().toISOString(),
    }))

  const merged = [...toAdd, ...existing]
  await saveBlacklist(supabase, merged)

  return NextResponse.json({ added: toAdd.length, total: merged.length, names: toAdd.map(c => c.name) })
}
