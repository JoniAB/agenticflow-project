import { NextRequest, NextResponse } from 'next/server'
import { validateAgentKey } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

type Params = { params: Promise<{ company_id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const { company_id } = await params
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('research_data')
    .select('*')
    .eq('company_id', company_id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const authError = validateAgentKey(request)
  if (authError) return authError

  const { company_id } = await params
  const body = await request.json()

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('research_data')
    .update(body)
    .eq('company_id', company_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
