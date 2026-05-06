import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { company_id } = await req.json()
  if (!company_id) return NextResponse.json({ error: 'company_id required' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('companies')
    .update({ status: 'awaiting_approval' })
    .eq('id', company_id)
    .eq('status', 'content_ready')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
