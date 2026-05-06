import { NextRequest, NextResponse } from 'next/server'
import { validateAgentKey } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const replied = searchParams.get('replied')
  const days = searchParams.get('days')

  const supabase = getSupabaseAdmin()
  let query = supabase.from('outreach').select('*').order('sent_at', { ascending: false })

  if (replied !== null) query = query.eq('replied', replied === 'true')

  if (days) {
    const cutoff = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000).toISOString()
    query = query.lte('sent_at', cutoff)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const authError = validateAgentKey(request)
  if (authError) return authError

  const body = await request.json()
  const { company_id, content_id, recipient_email, gmail_message_id, gmail_thread_id } = body

  if (!company_id || !recipient_email) {
    return NextResponse.json({ error: 'company_id and recipient_email are required' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('outreach')
    .insert({ company_id, content_id, recipient_email, gmail_message_id, gmail_thread_id, sent_at: new Date().toISOString() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
