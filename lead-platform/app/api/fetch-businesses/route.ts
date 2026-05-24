import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { DEFAULT_SETTINGS } from '@/app/api/settings/route'
import type { SearchSettings } from '@/app/api/settings/route'
import { getSupabaseAdmin } from '@/lib/supabase'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

function buildPrompt(
  isAuto: boolean,
  query: string | null,
  industry: string | null,
  weaknessList: string,
  max_score: number,
): string {
  if (isAuto) {
    return `אתה סוכן מחקר שמאתר עסקים ישראלים קטנים עם נוכחות דיגיטלית חלשה.

חפש 6 עסקים ישראלים בתחום "${industry}".
**עדיפות עליונה:** עסקים ללא אתר אינטרנט בכלל, או עם אתר מוזנח/מיושן (עיצוב ישן, תוכן לא מעודכן, לא רספונסיבי למובייל, http ללא https).

קריטריוני חולשה — חפש עסקים שסובלים מהחסרים האלה:
${weaknessList}

ציון מקסימלי לכניסה לפייפליין: ${max_score} מתוך 10 (ככל שנמוך יותר — מועמד טוב יותר).
אם לעסק אין אתר בכלל — תן ציון 1-2. אם האתר מוזנח/ישן — תן ציון 2-3.

החזר JSON בלבד בפורמט:
{
  "searched_industry": "${industry}",
  "businesses": [
    {
      "name": "שם העסק",
      "domain": null,
      "industry": "${industry}",
      "contact_phone": "050-1234567",
      "contact_email": "email@example.com",
      "score": 1,
      "weakness_summary": "אין אתר אינטרנט, אין WhatsApp, אין הזמנות אונליין",
      "city": "תל אביב"
    }
  ]
}

כללים:
- אם אין אתר — domain יהיה null
- score 1-${max_score} בלבד (אנחנו מחפשים חלשים!)
- נתונים מציאותיים ככל האפשר`
  }
  return `אתה סוכן מחקר שמאתר עסקים ישראלים קטנים עם נוכחות דיגיטלית חלשה.

המשתמש מחפש: "${query}"
**עדיפות עליונה:** עסקים ללא אתר אינטרנט בכלל, או עם אתר מוזנח/מיושן (עיצוב ישן, תוכן לא מעודכן, לא רספונסיבי למובייל).

קריטריוני חולשה — חפש עסקים שסובלים מהחסרים האלה:
${weaknessList}

ציון מקסימלי לכניסה לפייפליין: ${max_score} מתוך 10.
אם לעסק אין אתר בכלל — תן ציון 1-2. אם האתר מוזנח/ישן — תן ציון 2-3.

מצא 5-7 עסקים ישראלים המתאימים לשאילתה.

החזר JSON בלבד בפורמט:
{
  "businesses": [
    {
      "name": "שם העסק",
      "domain": null,
      "industry": "תחום",
      "contact_phone": "050-1234567",
      "contact_email": "email@example.com",
      "score": 2,
      "weakness_summary": "אין אתר אינטרנט, רק דף פייסבוק ישן",
      "city": "תל אביב"
    }
  ]
}

כללים:
- אם אין אתר — domain יהיה null
- score 1-${max_score} (נמוך = מועמד טוב לשדרוג)
- נתונים מציאותיים ככל האפשר`
}

// ── Streaming SSE path (used by frontend) ──────────────────────────────────────
async function handleStream(isAuto: boolean, query: string | null): Promise<Response> {
  const encoder = new TextEncoder()

  function sse(event: string, data: unknown): Uint8Array {
    return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  }

  const readable = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(sse('progress', { step: 1, message: 'טוען הגדרות חיפוש...' }))
        const settings = await loadSettings()
        const { industries, weakness_criteria, max_score } = settings
        const weaknessList = weakness_criteria.map(c => `- ${c}`).join('\n')

        const industry = isAuto
          ? industries[Math.floor(Math.random() * industries.length)]
          : null

        controller.enqueue(sse('progress', {
          step: 2,
          message: isAuto
            ? `בחר תעשייה: ${industry}`
            : `מכין חיפוש עבור: "${query}"`,
        }))

        const prompt = buildPrompt(isAuto, query, industry, weaknessList, max_score)

        controller.enqueue(sse('progress', { step: 3, message: 'שולח פניה לסוכן Claude...' }))
        controller.enqueue(sse('progress', {
          step: 4,
          message: isAuto
            ? `הסוכן סורק עסקים בתחום ${industry}...`
            : 'הסוכן מנתח עסקים רלוונטיים...',
        }))

        const message = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1200,
          system: 'You are a JSON API. Respond with valid JSON only. No markdown, no explanations, no warnings, no extra text — just the raw JSON object.',
          messages: [{ role: 'user', content: prompt }],
        })

        controller.enqueue(sse('progress', { step: 5, message: 'מעבד ומנתח תוצאות...' }))

        const raw = (message.content[0] as { type: string; text: string }).text.trim()
        const match = raw.match(/\{[\s\S]*\}/)
        if (!match) {
          controller.enqueue(sse('error', { error: 'no JSON in response' }))
          controller.close()
          return
        }

        const parsed = JSON.parse(match[0])
        controller.enqueue(sse('done', { ...parsed, auto_industry: industry }))
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        const isCredits = msg.includes('credit') || msg.includes('billing') || msg.includes('quota')
        controller.enqueue(sse('error', { error: isCredits ? 'no_credits' : msg }))
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { query, mode, stream: wantStream } = body
  const isAuto = mode === 'auto' || !query?.trim()

  if (wantStream) return handleStream(isAuto, query ?? null)

  // ── Legacy JSON path (used by cron) ───────────────────────────────────────
  const settings = await loadSettings()
  const { industries, weakness_criteria, max_score } = settings
  const weaknessList = weakness_criteria.map(c => `- ${c}`).join('\n')

  const industry = isAuto
    ? industries[Math.floor(Math.random() * industries.length)]
    : null

  const prompt = buildPrompt(isAuto, query, industry, weaknessList, max_score)

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      system: 'You are a JSON API. Respond with valid JSON only. No markdown, no explanations, no warnings, no extra text — just the raw JSON object.',
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = (message.content[0] as { type: string; text: string }).text.trim()
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) return NextResponse.json({ error: 'no JSON in response' }, { status: 500 })

    const parsed = JSON.parse(match[0])
    return NextResponse.json({ ...parsed, auto_industry: industry })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg.includes('credit') || msg.includes('billing') || msg.includes('quota')) {
      return NextResponse.json({ error: 'no_credits' }, { status: 402 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
