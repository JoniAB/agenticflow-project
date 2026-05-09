import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildSlug(name: string, id: string): string {
  const raw = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 40)
  return raw || `lead-${String(id).slice(0, 8)}`
}

function buildPrompt(company: Record<string, unknown>): string {
  return `אתה מומחה שיווק ו-AI לעסקים קטנים בישראל. שמך יוני אלוני.
המשימה: צור תוכן שיווקי מלא עבור עסק שאנחנו פונים אליו בcold outreach.

פרטי העסק:
- שם: ${company.name}
- תחום: ${company.industry ?? 'לא ידוע'}
- אתר: ${company.domain ?? 'לא ידוע'}
- איש קשר: ${company.contact_name ?? 'לא ידוע'}
- נתוני מחקר: ${company.notes ?? 'אין'}

צור JSON בלבד (ללא markdown) עם המבנה הבא:

{
  "email_subject": "נושא מייל קצר וספציפי (עד 8 מילים)",
  "email_body": "מייל cold outreach ב-3-4 משפטים. מתייחס לחולשה ספציפית של העסק. מסתיים בהצעה לשיחה של 10 דקות. אל תכלול לינקים — הם יתווספו אוטומטית בסוף.",
  "page": {
    "template_type": "בחר תבנית: hair-salon (מספרה/סלון שיער/ברבר), vet-clinic (וטרינר/מרפאה לחיות), beauty (ציפורניים/קוסמטיקה/ספא/מכון יופי), auto (מוסך/מכניקה/רכב/גרר/פחחות), photographer (צלם/צילום/וידאו/קמרמן/הפקה), generic (כל שאר התחומים)",
    "brand_color": "צבע HEX ראשי שמתאים לתחום העסק ומרגיש מקצועי (לדוגמה: #1B6CA8 לקליניקה, #2D7D46 לטבע ובריאות, #C0392B לאוכל, #7B2D8B ליופי). אל תשתמש בגוונים בהירים מדי.",
    "brand_light": "גרסה בהירה מאוד של brand_color לרקע (לדוגמה: #EEF6FF, #EDFBF3). חייב להיות בהיר מאוד, כמעט לבן.",
    "tagline": "משפט אחד חזק שמתייחס לבעיה העיקרית של העסק (בעברית)",
    "hero_description": "2-3 משפטים שמסבירים מה אנחנו מציעים לעסק הזה ספציפית",
    "pain_points": [
      {"title": "כותרת חוסר 1", "description": "הסבר קצר"},
      {"title": "כותרת חוסר 2", "description": "הסבר קצר"},
      {"title": "כותרת חוסר 3", "description": "הסבר קצר"}
    ],
    "solutions": [
      {"title": "פתרון 1", "description": "מה אנחנו נעשה"},
      {"title": "פתרון 2", "description": "מה אנחנו נעשה"},
      {"title": "פתרון 3", "description": "מה אנחנו נעשה"}
    ],
    "result_promise": "משפט אחד על מה שהעסק ירוויח"
  },
  "report": {
    "executive_summary": "פסקה קצרה — מצב העסק הדיגיטלי היום",
    "score": ${(company.score as number) ?? 4},
    "findings": [
      {"title": "ממצא 1", "severity": "high", "details": "הסבר מפורט"},
      {"title": "ממצא 2", "severity": "medium", "details": "הסבר מפורט"},
      {"title": "ממצא 3", "severity": "low", "details": "הסבר מפורט"}
    ],
    "recommendations": [
      {"priority": 1, "title": "המלצה ראשונה", "impact": "גבוה", "description": "מה לעשות ולמה"},
      {"priority": 2, "title": "המלצה שנייה", "impact": "בינוני", "description": "מה לעשות ולמה"},
      {"priority": 3, "title": "המלצה שלישית", "impact": "בינוני", "description": "מה לעשות ולמה"}
    ],
    "quick_wins": ["פעולה מהירה 1", "פעולה מהירה 2", "פעולה מהירה 3"],
    "potential_impact": "תיאור הפוטנציאל של העסק אם ישתפר דיגיטלית"
  }
}`
}

async function resolveCompany(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  companyId: string | null,
): Promise<{ company: Record<string, unknown>; queueRemaining: number } | { error: string; status: number } | { noPending: true }> {
  if (companyId) {
    const { data, error } = await supabase
      .from('companies')
      .select('*, content(*)')
      .eq('id', companyId)
      .single()
    if (error || !data) return { error: error?.message ?? 'not_found', status: 404 }
    return { company: data, queueRemaining: 0 }
  }

  const { data: companies, error: fetchErr } = await supabase
    .from('companies')
    .select('*, content(*)')
    .eq('status', 'high_score')
    .order('created_at', { ascending: true })
    .limit(20)

  if (fetchErr) return { error: fetchErr.message, status: 500 }

  const queue = (companies ?? []).filter(
    (c: { content?: unknown[] }) => !c.content || (c.content as unknown[]).length === 0
  )
  if (queue.length === 0) return { noPending: true }

  return { company: queue[0], queueRemaining: queue.length - 1 }
}

async function saveContent(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  company: Record<string, unknown>,
  generated: Record<string, unknown>,
) {
  const slug = buildSlug(String(company.name ?? ''), String(company.id))
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://lead-platform-yoni.vercel.app'
  const pageUrl = `${baseUrl}/leads/${slug}`
  const reportUrl = `${baseUrl}/leads/${slug}/report`

  const emailBodyWithLinks = `${generated.email_body}

---
🔗 העמוד שבנינו עבורך: ${pageUrl}
📊 הדוח המלא: ${reportUrl}`

  const { data: content, error: contentErr } = await supabase
    .from('content')
    .insert({
      company_id:          company.id,
      company_slug:        slug,
      email_subject:       generated.email_subject,
      email_body:          emailBodyWithLinks,
      page_url:            pageUrl,
      report_url:          reportUrl,
      report_content:      JSON.stringify({ page: generated.page, report: generated.report }),
      page_status:         'deployed',
      report_status:       'ready',
      landing_page_failed: false,
    })
    .select()
    .single()

  if (contentErr) throw new Error(contentErr.message)

  await supabase
    .from('companies')
    .update({ status: 'content_ready' })
    .eq('id', company.id)

  await supabase.from('agent_log').insert({
    company_id: company.id,
    agent_name: 'content-generator',
    action:     'generate_full_content',
    status:     'success',
    payload:    { email_subject: generated.email_subject, slug, content_id: content.id },
  })

  return { content, slug, pageUrl, reportUrl, emailSubject: generated.email_subject }
}

// ── SSE streaming path ─────────────────────────────────────────────────────────
async function handleStream(companyId: string | null): Promise<Response> {
  const encoder = new TextEncoder()
  function sse(event: string, data: unknown): Uint8Array {
    return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  }

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const supabase = getSupabaseAdmin()

        controller.enqueue(sse('progress', { step: 1, message: 'מאתר את הליד הבא בתור...' }))

        const resolved = await resolveCompany(supabase, companyId)
        if ('noPending' in resolved) {
          controller.enqueue(sse('done', { message: 'no_pending', detail: 'אין לקוחות בתור' }))
          controller.close()
          return
        }
        if ('error' in resolved) {
          controller.enqueue(sse('error', { error: resolved.error }))
          controller.close()
          return
        }

        const { company, queueRemaining } = resolved

        controller.enqueue(sse('progress', {
          step: 2,
          message: `מייצר תוכן עבור ${String(company.name)}...`,
          company_name: String(company.name),
        }))

        const prompt = buildPrompt(company)

        controller.enqueue(sse('progress', { step: 3, message: 'בונה אימייל ועמוד נחיתה...' }))

        const message = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 4096,
          system: 'You are a JSON API. Return only valid JSON, no markdown, no extra text.',
          messages: [{ role: 'user', content: prompt }],
        })

        controller.enqueue(sse('progress', { step: 4, message: 'שומר ומפרסם...' }))

        const raw   = (message.content[0] as { type: string; text: string }).text.trim()
        const match = raw.match(/\{[\s\S]*\}/)
        if (!match) { controller.enqueue(sse('error', { error: 'bad_response' })); controller.close(); return }

        let jsonStr = match[0]
        let generated: Record<string, unknown>
        try {
          generated = JSON.parse(jsonStr)
        } catch {
          const lastBrace = jsonStr.lastIndexOf('}')
          if (lastBrace < 0) { controller.enqueue(sse('error', { error: 'bad_json' })); controller.close(); return }
          jsonStr = jsonStr.slice(0, lastBrace + 1)
          try { generated = JSON.parse(jsonStr) }
          catch { controller.enqueue(sse('error', { error: 'bad_json' })); controller.close(); return }
        }

        const saved = await saveContent(supabase, company, generated)

        controller.enqueue(sse('done', {
          company:         { id: company.id, name: company.name, industry: company.industry },
          content:         { email_subject: saved.emailSubject, page_url: saved.pageUrl, report_url: saved.reportUrl },
          queue_remaining: queueRemaining,
        }))
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
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  })
}

// ── JSON path (used by cron) ───────────────────────────────────────────────────
export async function POST(req: Request) {
  const url       = new URL(req.url)
  const companyId = url.searchParams.get('company_id')

  if (url.searchParams.get('stream') === 'true') {
    return handleStream(companyId)
  }

  const supabase = getSupabaseAdmin()
  const resolved = await resolveCompany(supabase, companyId)

  if ('noPending' in resolved) {
    return NextResponse.json({ message: 'no_pending', detail: 'אין לקוחות בתור' })
  }
  if ('error' in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status })
  }

  const { company, queueRemaining } = resolved

  try {
    const prompt = buildPrompt(company)
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: 'You are a JSON API. Return only valid JSON, no markdown, no extra text.',
      messages: [{ role: 'user', content: prompt }],
    })

    const raw   = (message.content[0] as { type: string; text: string }).text.trim()
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) return NextResponse.json({ error: 'bad_response' }, { status: 500 })

    let jsonStr = match[0]
    let generated: Record<string, unknown>
    try {
      generated = JSON.parse(jsonStr)
    } catch {
      const lastBrace = jsonStr.lastIndexOf('}')
      if (lastBrace < 0) return NextResponse.json({ error: 'bad_json' }, { status: 500 })
      jsonStr = jsonStr.slice(0, lastBrace + 1)
      try { generated = JSON.parse(jsonStr) }
      catch { return NextResponse.json({ error: 'bad_json' }, { status: 500 }) }
    }

    const saved = await saveContent(supabase, company, generated)

    return NextResponse.json({
      company:         { id: company.id, name: company.name, industry: company.industry },
      content:         { email_subject: saved.emailSubject, page_url: saved.pageUrl, report_url: saved.reportUrl },
      queue_remaining: queueRemaining,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg.includes('credit') || msg.includes('billing') || msg.includes('quota')) {
      return NextResponse.json({ error: 'no_credits' }, { status: 402 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
