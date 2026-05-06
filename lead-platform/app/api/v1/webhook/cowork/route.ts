import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { STATUS_TO_BOARD } from '@/lib/types'

// Cowork sends X-Cowork-Secret header for verification
function validateCoworkSecret(request: NextRequest): boolean {
  const secret = request.headers.get('X-Cowork-Secret')
  return secret === process.env.COWORK_WEBHOOK_SECRET
}

// Normalize Cowork payload → our schema
// Update field names here once Cowork API format is confirmed (SOP Open Question #1/#2)
function parseCoworkPayload(body: Record<string, unknown>) {
  const company = (body.company ?? body) as Record<string, unknown>
  const contact = (body.contact ?? {}) as Record<string, unknown>

  return {
    cowork_id:      String(company.id ?? company.company_id ?? ''),
    company_name:   String(company.name ?? company.company_name ?? ''),
    website:        (company.website ?? company.url ?? null) as string | null,
    contact_name:   (contact.name ?? contact.full_name ?? null) as string | null,
    contact_email:  (contact.email ?? null) as string | null,
    contact_phone:  (contact.phone ?? contact.mobile ?? null) as string | null,
    contact_linkedin: (contact.linkedin ?? contact.linkedin_url ?? null) as string | null,
  }
}

export async function POST(request: NextRequest) {
  if (!validateCoworkSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = parseCoworkPayload(body)

  if (!parsed.cowork_id || !parsed.company_name) {
    return NextResponse.json(
      { error: 'Missing required fields: company id and name' },
      { status: 400 }
    )
  }

  const supabase = getSupabaseAdmin()

  // SOP constraint: MUST NOT create record if cowork_id already exists
  const { data: existing } = await supabase
    .from('companies')
    .select('id, cowork_id')
    .eq('cowork_id', parsed.cowork_id)
    .maybeSingle()

  if (existing) {
    await supabase.from('agent_log').insert({
      agent_name: 'webhook',
      action: 'cowork_webhook_duplicate',
      status: 'skipped',
      payload: { cowork_id: parsed.cowork_id, company_name: parsed.company_name },
    })
    return NextResponse.json({ skipped: true, reason: 'duplicate', id: existing.id })
  }

  // Create new record in B-01 with status: new
  const { data: company, error } = await supabase
    .from('companies')
    .insert({
      cowork_id:        parsed.cowork_id,
      name:             parsed.company_name,
      website:          parsed.website,
      contact_name:     parsed.contact_name,
      contact_email:    parsed.contact_email,
      contact_phone:    parsed.contact_phone,
      contact_linkedin: parsed.contact_linkedin,
      cowork_raw_data:  body,
      source:           'cowork_webhook',
      status:           'new',
      current_board:    STATUS_TO_BOARD['new'],
    })
    .select()
    .single()

  if (error) {
    await supabase.from('agent_log').insert({
      agent_name:    'webhook',
      action:        'cowork_webhook_create',
      status:        'error',
      payload:       { cowork_id: parsed.cowork_id },
      error_message: error.message,
    })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase.from('agent_log').insert({
    company_id: company.id,
    agent_name: 'webhook',
    action:     'cowork_webhook_create',
    status:     'success',
    payload:    { cowork_id: parsed.cowork_id, board: 'B-01' },
  })

  return NextResponse.json({ created: true, id: company.id }, { status: 201 })
}
