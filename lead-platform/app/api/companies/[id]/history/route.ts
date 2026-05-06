import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = getSupabaseAdmin()

  const [companyRes, logsRes] = await Promise.all([
    supabase.from('companies').select('*').eq('id', id).single(),
    supabase.from('agent_log').select('*').eq('company_id', id).order('created_at', { ascending: false }),
  ])

  if (companyRes.error) return NextResponse.json({ error: companyRes.error.message }, { status: 404 })

  return NextResponse.json({
    company: companyRes.data,
    logs: logsRes.data ?? [],
  })
}
