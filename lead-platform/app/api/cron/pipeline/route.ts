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
         req.headers.get('x-cron-key')   === process.env.CRON_SECRET ||
         req.headers.get('x-agent-key')  === 'yoni-agent-key-2025'
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
    log.push(`⚙️ הגדרות: ציון מקסימלי ${settings.max_score}, ${settings.industries.length} תחומים`)

    // ── Step 2: fetch businesses ─────────────────────────────────────
    log.push('🔍 מחפש עסקים חדשים...')
    const fetchRes = await fetch(`${BASE_URL}/api/fetch-businesses`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ mode: 'auto' }),
    })
    const fetchData = await fetchRes.json()

    if (!fetchRes.ok) {
      if (fetchData.error === 'no_credits') {
        log.push('❌ אין קרדיטים ב-Anthropic — יש להוסיף ב-console.anthropic.com')
      } else {
        log.push(`❌ חיפוש עסקים נכשל: ${fetchData.error ?? fetchRes.status}`)
      }
      throw new Error(fetchData.error ?? fetchRes.status)
    }

    const total = fetchData.businesses?.length ?? 0
    const businesses: Array<{
      name: string; domain?: string; industry?: string
      contact_phone?: string; contact_email?: string
      score?: number; weakness_summary?: string; city?: string
    }> = (fetchData.businesses ?? []).filter(
      (b: { score?: number }) => (b.score ?? 99) <= settings.max_score
    )

    log.push(`✅ נמצאו ${total} עסקים — ${businesses.length} עומדים בקריטריונים (ציון ≤ ${settings.max_score})`)

    if (businesses.length === 0) {
      log.push('ℹ️ אין עסקים חדשים להוספה')
      await supabase.from('agent_log').insert({
        agent_name: 'cron-pipeline', action: 'daily_run', status: 'success',
        payload: { run_at: runAt, log, added: 0, content_generated: 0 },
      })
      return NextResponse.json({ ok: true, added: 0, content_generated: 0, log })
    }

    // ── Step 3 + 4: add + promote each business ──────────────────────
    log.push('➕ מוסיף עסקים לפייפליין...')
    const addedIds: string[] = []

    for (const biz of businesses) {
      try {
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
        if (!addRes.ok) { log.push(`   ⏭️ דילוג על ${biz.name} (כבר קיים)`); continue }
        const added = await addRes.json()

        await fetch(`${BASE_URL}/api/companies/${added.id}`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json', 'X-Agent-Key': AGENT_KEY },
          body:    JSON.stringify({ status: 'high_score' }),
        })

        addedIds.push(added.id)
        log.push(`   ✅ ${biz.name} (ציון ${biz.score})`)
      } catch (e) {
        log.push(`   ❌ שגיאה בהוספת ${biz.name}: ${e}`)
      }
    }

    log.push(`📋 סה"כ נוספו: ${addedIds.length} עסקים`)

    // ── Step 5: generate content only for the companies just added ──────
    let contentGenerated = 0

    if (addedIds.length > 0) {
      log.push('✍️ מייצר תוכן שיווקי...')
      for (const id of addedIds) {
        const genRes  = await fetch(`${BASE_URL}/api/generate-content/next?company_id=${id}`, { method: 'POST' })
        const genData = await genRes.json()

        if (genData.error === 'no_credits') {
          log.push('   ❌ אין קרדיטים ב-Anthropic — יצירת תוכן הופסקה')
          break
        }
        if (!genRes.ok) {
          log.push(`   ❌ שגיאה ביצירת תוכן: ${genData.error ?? genRes.status}`)
          continue
        }
        if (genData.message !== 'no_pending') {
          contentGenerated++
          log.push(`   ✅ ${genData.company?.name} — עמוד נחיתה ודוח מוכנים`)
        }
      }
    }

    log.push(`🎉 הריצה הושלמה: ${addedIds.length} עסקים, ${contentGenerated} תכנים`)

    await supabase.from('agent_log').insert({
      agent_name: 'cron-pipeline',
      action:     'daily_run',
      status:     'success',
      payload:    { run_at: runAt, added: addedIds.length, content_generated: contentGenerated, log },
    })

    return NextResponse.json({ ok: true, added: addedIds.length, content_generated: contentGenerated, log })

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    log.push(`❌ שגיאה: ${message}`)
    await supabase.from('agent_log').insert({
      agent_name: 'cron-pipeline', action: 'daily_run', status: 'error',
      error_message: message, payload: { run_at: runAt, log },
    })
    return NextResponse.json({ error: message, log }, { status: 500 })
  }
}
