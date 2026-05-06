import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { STATUS_TO_BOARD } from '@/lib/types'

// Cron key auth — call this from Vercel Cron or external scheduler
function validateCronKey(request: NextRequest): boolean {
  const key = request.headers.get('X-Cron-Key')
  return key === process.env.CRON_SECRET
}

// ----------------------------------------------------------------
// Cowork API pull — called daily at 08:00 IL (UTC+3 = 05:00 UTC)
// Pulls companies created/updated since last run
//
// TODO (SOP Open Question #1): Replace placeholder with real
// Cowork API endpoint + auth once confirmed.
// ----------------------------------------------------------------
export async function POST(request: NextRequest) {
  if (!validateCronKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  // Determine since timestamp from last successful run
  const { data: lastLog } = await supabase
    .from('agent_log')
    .select('created_at, payload')
    .eq('agent_name', 'daily-pull')
    .eq('action', 'pull_complete')
    .eq('status', 'success')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const since = lastLog?.payload
    ? (lastLog.payload as Record<string, unknown>).run_at as string
    : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const runAt = new Date().toISOString()

  // ---- Cowork API call ----
  // TODO: replace with actual Cowork endpoint + auth headers
  const coworkApiUrl = process.env.COWORK_API_URL
  const coworkApiKey = process.env.COWORK_API_KEY

  if (!coworkApiUrl || !coworkApiKey) {
    await supabase.from('agent_log').insert({
      agent_name:    'daily-pull',
      action:        'pull_skipped',
      status:        'skipped',
      payload:       { reason: 'COWORK_API_URL or COWORK_API_KEY not configured' },
    })
    return NextResponse.json({ skipped: true, reason: 'Cowork API not configured' })
  }

  let coworkData: Record<string, unknown>[]
  try {
    const res = await fetch(`${coworkApiUrl}?since=${encodeURIComponent(since)}`, {
      headers: {
        Authorization: `Bearer ${coworkApiKey}`,
        'Content-Type': 'application/json',
      },
    })
    if (!res.ok) throw new Error(`Cowork API returned ${res.status}`)
    coworkData = await res.json()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await supabase.from('agent_log').insert({
      agent_name:    'daily-pull',
      action:        'pull_error',
      status:        'error',
      error_message: message,
    })
    return NextResponse.json({ error: message }, { status: 502 })
  }

  let created = 0
  let skipped = 0
  const errors: string[] = []

  for (const row of coworkData) {
    const cowork_id = String(
      (row as Record<string, unknown>).id ??
      (row as Record<string, unknown>).company_id ??
      ''
    )
    if (!cowork_id) continue

    // Deduplication check
    const { data: existing } = await supabase
      .from('companies')
      .select('id')
      .eq('cowork_id', cowork_id)
      .maybeSingle()

    if (existing) { skipped++; continue }

    const company = row as Record<string, unknown>
    const contact = (company.contact ?? {}) as Record<string, unknown>

    const { error } = await supabase.from('companies').insert({
      cowork_id,
      name:             String(company.name ?? company.company_name ?? ''),
      website:          (company.website ?? company.url ?? null) as string | null,
      contact_name:     (contact.name ?? contact.full_name ?? null) as string | null,
      contact_email:    (contact.email ?? null) as string | null,
      contact_phone:    (contact.phone ?? contact.mobile ?? null) as string | null,
      contact_linkedin: (contact.linkedin ?? null) as string | null,
      cowork_raw_data:  row,
      source:           'cowork_api',
      status:           'new',
      current_board:    STATUS_TO_BOARD['new'],
    })

    if (error) {
      errors.push(`${cowork_id}: ${error.message}`)
    } else {
      created++
    }
  }

  await supabase.from('agent_log').insert({
    agent_name: 'daily-pull',
    action:     'pull_complete',
    status:     errors.length === 0 ? 'success' : 'error',
    payload:    { run_at: runAt, since, created, skipped, errors },
  })

  return NextResponse.json({ created, skipped, errors })
}
