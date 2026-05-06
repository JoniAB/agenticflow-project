import { NextRequest, NextResponse } from 'next/server'
import { validateAgentKey } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const authError = validateAgentKey(request)
  if (authError) return authError

  const { id } = await params
  const body = await request.json()

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('outreach')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
