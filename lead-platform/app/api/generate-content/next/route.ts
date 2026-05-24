import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type ProgressCb = (step: number, message: string) => void

type GenResult =
  | { ok: true;  company: Record<string,unknown>; content: Record<string,unknown>; queueRemaining: number }
  | { ok: false; error: string; status: number }
  | { ok: 'no_pending' }

async function runGeneration(
  companyId: string | null,
  instructions: string | null,
  onProgress: ProgressCb,
): Promise<GenResult> {
  const supabase = getSupabaseAdmin()
  let company: Record<string, unknown>
  let queueRemaining = 0

  onProgress(1, 'מאתר חברה...')

  if (companyId) {
    const { data, error } = await supabase
      .from('companies')
      .select('*, content(*)')
      .eq('id', companyId)
      .single()
    if (error || !data) return { ok: false, error: error?.message ?? 'not_found', status: 404 }
    company = data
  } else {
    // Priority 1: content_ready leads without content (user explicitly moved them here)
    // Priority 2: high_score leads without content (auto-discovery flow)
    const [contentReadyRes, highScoreRes] = await Promise.all([
      supabase
        .from('companies')
        .select('*, content(*)')
        .eq('status', 'content_ready')
        .order('kanban_position', { ascending: true })
        .order('created_at',      { ascending: true })
        .limit(50),
      supabase
        .from('companies')
        .select('*, content(*)')
        .eq('status', 'high_score')
        .order('created_at', { ascending: true })
        .limit(50),
    ])

    if (contentReadyRes.error) return { ok: false, error: contentReadyRes.error.message, status: 500 }
    if (highScoreRes.error)    return { ok: false, error: highScoreRes.error.message,    status: 500 }

    const withoutContent = (arr: unknown[]) =>
      arr.filter((c: unknown) => {
        const company = c as { content?: unknown[] }
        return !company.content || (company.content as unknown[]).length === 0
      })

    const contentReadyQueue = withoutContent(contentReadyRes.data ?? [])
    const highScoreQueue    = withoutContent(highScoreRes.data    ?? [])
    const queue = [...contentReadyQueue, ...highScoreQueue]

    if (queue.length === 0) return { ok: 'no_pending' }

    company        = queue[0] as Record<string, unknown>
    queueRemaining = queue.length - 1
  }

  const name    = String(company.name ?? '')
  const rawSlug = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 40)
  const slug = rawSlug || `lead-${String(company.id).slice(0, 8)}`

  onProgress(2, `בונה תוכן עבור ${name}...`)

  const instructionsBlock = instructions?.trim()
    ? `\n\n**הנחיות מיוחדות מהמשתמש — חשוב ליישם:**\n${instructions.trim()}\nיש לשקף הנחיות אלו בעיצוב, בנרטיב, ובכל היבט ויזואלי של העמוד.`
    : ''

  // Static schema moved to system prompt (cached) — only dynamic company data goes here
  const prompt = `פרטי העסק:
- שם: ${name}
- תחום: ${company.industry ?? 'לא ידוע'}
- אתר: ${company.domain ?? 'לא ידוע'}
- איש קשר: ${company.contact_name ?? 'לא ידוע'}
- נתוני מחקר: ${company.notes ?? 'אין'}
- ציון נוכחי: ${(company.score as number) ?? 4}${instructionsBlock}

צור JSON עם המבנה שקיבלת בהוראות המערכת.`

  onProgress(3, 'מייצר תוכן עם Claude...')

  // Guard against concurrent generation: re-check that no content was saved
  // between our initial query and now (e.g. cron + AutoContentRunner overlap).
  const { data: alreadyExists } = await supabase
    .from('content')
    .select('id')
    .eq('company_id', company.id)
    .maybeSingle()
  if (alreadyExists) return { ok: 'no_pending' }

  const message = await client.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: 2048,
    system: [
      {
        type: 'text',
        // Static schema is cached — saves ~90% on input tokens for this block on repeated calls
        text: `אתה מומחה שיווק ו-AI לעסקים קטנים בישראל. שמך יוני אלוני. אתה JSON API — החזר JSON בלבד, ללא markdown.

המשימה: צור תוכן שיווקי מלא עבור עסק שאנחנו פונים אליו בcold outreach.

החזר JSON עם המבנה הבא בדיוק:
{
  "email_subject": "נושא מייל קצר וספציפי (עד 8 מילים)",
  "email_body": "מייל cold outreach ב-3-4 משפטים. מתייחס לחולשה ספציפית של העסק. מסתיים בהצעה לשיחה של 10 דקות. אל תכלול לינקים — הם יתווספו אוטומטית בסוף.",
  "page": {
    "template_type": "בחר תבנית: hair-salon (מספרה/סלון שיער/ברבר), vet-clinic (וטרינר/מרפאה לחיות), beauty (ציפורניים/קוסמטיקה/ספא/מכון יופי), auto (מוסך/מכניקה/רכב/גרר/פחחות), photographer (צלם/צילום/וידאו/קמרמן/הפקה), generic (כל שאר התחומים)",
    "brand_color": "צבע HEX ראשי שמתאים לתחום העסק",
    "brand_light": "גרסה בהירה מאוד של brand_color לרקע — כמעט לבן",
    "tagline": "משפט אחד חזק שמתייחס לבעיה העיקרית של העסק",
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
    "score": <השתמש בציון שקיבלת>,
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
}`,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages:   [{ role: 'user', content: prompt }],
  })

  onProgress(4, 'שומר תוכן...')

  const raw   = (message.content[0] as { type: string; text: string }).text.trim()
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) return { ok: false, error: 'bad_response', status: 500 }

  let jsonStr   = match[0]
  let generated: Record<string, unknown>
  try {
    generated = JSON.parse(jsonStr)
  } catch {
    const lastBrace = jsonStr.lastIndexOf('}')
    if (lastBrace < 0) return { ok: false, error: 'bad_json', status: 500 }
    jsonStr = jsonStr.slice(0, lastBrace + 1)
    try { generated = JSON.parse(jsonStr) }
    catch { return { ok: false, error: 'bad_json', status: 500 } }
  }

  const baseUrl   = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://lead-platform-yoni.vercel.app'
  const pageUrl   = `${baseUrl}/leads/${slug}`
  const reportUrl = `${baseUrl}/leads/${slug}/report`

  const emailBodyWithLinks = `${generated.email_body}

---
🔗 העמוד שבנינו עבורך: ${pageUrl}
📊 הדוח המלא: ${reportUrl}`

  const { data: content, error: contentErr } = await supabase
    .from('content')
    .upsert({
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
    }, { onConflict: 'company_id' })
    .select()
    .single()

  if (contentErr) return { ok: false, error: contentErr.message, status: 500 }

  // Only advance status when generating for the first time (from high_score queue).
  // When regenerating a company already in approval/sent flow, preserve its current status.
  if (String(company.status ?? '') === 'high_score') {
    await supabase
      .from('companies')
      .update({ status: 'content_ready' })
      .eq('id', company.id)
  }

  await supabase.from('agent_log').insert({
    company_id: company.id,
    agent_name: 'content-generator',
    action:     'generate_full_content',
    status:     'success',
    payload:    { email_subject: generated.email_subject, slug, content_id: content.id },
  })

  return {
    ok: true,
    company: { id: company.id, name: company.name, industry: company.industry },
    content: { email_subject: generated.email_subject, page_url: pageUrl, report_url: reportUrl },
    queueRemaining,
  }
}

// ── SSE streaming path ─────────────────────────────────────────────────────────
function handleStream(companyId: string | null, instructions: string | null): Response {
  const encoder = new TextEncoder()

  function sse(event: string, data: unknown): Uint8Array {
    return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  }

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const result = await runGeneration(companyId, instructions, (step, message) => {
          controller.enqueue(sse('progress', { step, message }))
        })
        if (result.ok === 'no_pending') {
          controller.enqueue(sse('done', { message: 'no_pending' }))
        } else if (result.ok === true) {
          controller.enqueue(sse('done', {
            company:         result.company,
            content:         result.content,
            queue_remaining: result.queueRemaining,
          }))
        } else {
          controller.enqueue(sse('error', { error: result.error }))
        }
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

// ── GET — used by EventSource (AutoContentRunner) ─────────────────────────────
export async function GET(req: Request) {
  const url       = new URL(req.url)
  const companyId = url.searchParams.get('company_id')
  return handleStream(companyId, null)
}

// ── POST ───────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const url        = new URL(req.url)
  const companyId  = url.searchParams.get('company_id')
  const wantStream = url.searchParams.get('stream') === 'true'

  let instructions: string | null = null
  try {
    const body = await req.json()
    instructions = (body?.instructions as string) ?? null
  } catch { /* body may be empty */ }

  if (wantStream) return handleStream(companyId, instructions)

  // ── Legacy JSON path (used by cron) ─────────────────────────────────────────
  try {
    const result = await runGeneration(companyId, instructions, () => {})
    if (result.ok === 'no_pending') return NextResponse.json({ message: 'no_pending' })
    if (result.ok === false) return NextResponse.json({ error: result.error }, { status: result.status })
    return NextResponse.json({
      company:         result.company,
      content:         result.content,
      queue_remaining: result.queueRemaining,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg.includes('credit') || msg.includes('billing') || msg.includes('quota')) {
      return NextResponse.json({ error: 'no_credits' }, { status: 402 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
