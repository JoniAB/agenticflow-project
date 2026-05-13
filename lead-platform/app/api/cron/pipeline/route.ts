import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'
import { DEFAULT_SETTINGS } from '@/app/api/settings/route'
import type { SearchSettings } from '@/app/api/settings/route'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://lead-platform-yoni.vercel.app'
const AGENT_KEY = 'yoni-agent-key-2025'

function validateCronKey(req: NextRequest): boolean {
  const auth = req.headers.get('authorization') ?? ''
  return auth === `Bearer ${process.env.CRON_SECRET}` ||
         req.headers.get('x-cron-key') === process.env.CRON_SECRET
}

async function loadSettings(): Promise<SearchSettings> {
  try {
    const supabase = getSupabaseAdmin()
    const { data } = await supabase
      .from('agent_log')
      .select('payload')
      .eq('agent_name', 'system')
      .eq('action', 'search_settings')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    return (data?.payload as SearchSettings) ?? DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export async function GET(req: NextRequest) {
  return POST(req)
}

export async function POST(req: NextRequest) {
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET>
  if (!validateCronKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const log: string[] = []
  const runAt = new Date().toISOString()

  try {
    // ── Step 1: load settings ────────────────────────────────────────
    const settings = await loadSettings()
    log.push(`Settings: max_score=${settings.max_score}, industries=${settings.industries.length}`)

    // ── Step 2: fetch businesses ─────────────────────────────────────
    const fetchRes = await fetch(`${BASE_URL}/api/fetch-businesses`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ mode: 'auto' }),
    })
    const fetchData = await fetchRes.json()

    if (!fetchRes.ok) {
      throw new Error(`fetch-businesses failed: ${fetchData.error ?? fetchRes.status}`)
    }

    const businesses: Array<{
      name: string; domain?: string; industry?: string
      contact_phone?: string; contact_email?: string
      score?: number; weakness_summary?: string; city?: string
    }> = (fetchData.businesses ?? []).filter(
      (b: { score?: number }) => (b.score ?? 99) <= settings.max_score
    )

    log.push(`Found ${fetchData.businesses?.length ?? 0} businesses, ${businesses.length} qualify (score ≤ ${settings.max_score})`)

    if (businesses.length === 0) {
      await supabase.from('agent_log').insert({
        agent_name: 'cron-pipeline', action: 'daily_run', status: 'success',
        payload: { run_at: runAt, log, added: 0, content_generated: 0 },
      })
      return NextResponse.json({ ok: true, added: 0, content_generated: 0, log })
    }

    // ── Step 3 + 4: add + promote each business ──────────────────────
    const addedIds: string[] = []

    for (const biz of businesses) {
      try {
        // Add as potential
        const addRes = await fetch(`${BASE_URL}/api/companies`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'X-Agent-Key': AGENT_KEY },
          body: JSON.stringify({
            name:          biz.name,
            domain:        biz.domain,
            industry:      biz.industry,
            contact_phone: biz.contact_phone,
            contact_email: biz.contact_email,
            score:         biz.score,
            notes:         biz.weakness_summary,
            source:        'google_maps',
            status:        'potential',
          }),
        })
        if (!addRes.ok) { log.push(`Skip ${biz.name}: add failed`); continue }
        const added = await addRes.json()

        // Promote to high_score
        await fetch(`${BASE_URL}/api/companies/${added.id}`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json', 'X-Agent-Key': AGENT_KEY },
          body:    JSON.stringify({ status: 'high_score' }),
        })

        addedIds.push(added.id)
        log.push(`Added + promoted: ${biz.name} (score ${biz.score})`)
      } catch (e) {
        log.push(`Error adding ${biz.name}: ${e}`)
      }
    }

    // ── Step 5: generate content for all high_score leads ────────────
    let contentGenerated = 0
    let attempts = 0
    const maxAttempts = 20

    while (attempts < maxAttempts) {
      attempts++
      const genRes = await fetch(`${BASE_URL}/api/generate-content/next`, { method: 'POST' })
      const genData = await genRes.json()

      if (genData.message === 'no_pending') break
      if (genData.error === 'no_credits') {
        log.push('ERROR: No Anthropic API credits')
        break
      }
      if (!genRes.ok) {
        log.push(`Content gen error: ${genData.error ?? genRes.status}`)
        break
      }

      contentGenerated++
      log.push(`Content ready: ${genData.company?.name} → ${genData.content?.page_url ?? '?'}`)

      if (genData.queue_remaining === 0) break
    }

    // ── Log run ──────────────────────────────────────────────────────
    await supabase.from('agent_log').insert({
      agent_name: 'cron-pipeline',
      action:     'daily_run',
      status:     'success',
      payload:    { run_at: runAt, added: addedIds.length, content_generated: contentGenerated, log },
    })

    return NextResponse.json({ ok: true, added: addedIds.length, content_generated: contentGenerated, log })

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await supabase.from('agent_log').insert({
      agent_name: 'cron-pipeline', action: 'daily_run', status: 'error',
      error_message: message, payload: { run_at: runAt, log },
    })
    return NextResponse.json({ error: message, log }, { status: 500 })
  }
}
