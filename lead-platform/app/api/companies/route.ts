import { NextRequest, NextResponse } from 'next/server'
import { validateAgentKey } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const status = searchParams.get('status')
  const source = searchParams.get('source')
  const limit = parseInt(searchParams.get('limit') ?? '100')
  const offset = parseInt(searchParams.get('offset') ?? '0')

  const supabase = getSupabaseAdmin()
  let query = supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)
  if (source) query = query.eq('source', source)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const authError = validateAgentKey(request)
  if (authError) return authError

  const body = await request.json()
  const {
    name, domain, source, linkedin_url, industry, size_estimate, notes,
    score, contact_name, contact_phone, contact_email, status,
  } = body

  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

  const supabase = getSupabaseAdmin()

  // Dedup: reject if same name already exists (case-insensitive)
  const { data: existing } = await supabase
    .from('companies')
    .select('id, name, status')
    .ilike('name', name.trim())
    .limit(1)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: 'duplicate', message: `"${existing.name}" already exists`, existing },
      { status: 409 },
    )
  }

  const { data, error } = await supabase
    .from('companies')
    .insert({
      name, domain, source: source ?? 'other', linkedin_url, industry, size_estimate, notes,
      score, contact_name, contact_phone, contact_email,
      status: status ?? 'potential',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
