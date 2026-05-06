import { NextRequest, NextResponse } from 'next/server'
import { validateAgentKey } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const authError = validateAgentKey(request)
  if (authError) return authError

  const body = await request.json()
  const { company_id, ...rest } = body

  if (!company_id) return NextResponse.json({ error: 'company_id is required' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('content')
    .insert({ company_id, ...rest })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
