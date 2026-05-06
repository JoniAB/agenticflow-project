import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  const supabase = getSupabaseAdmin()

  const url        = new URL(req.url)
  const companyId  = url.searchParams.get('company_id')

  let company: Record<string, unknown>
  let queueRemaining = 0

  if (companyId) {
    // Direct mode: generate for a specific company
    const { data, error } = await supabase
      .from('companies')
      .select('*, content(*)')
      .eq('id', companyId)
      .single()
    if (error || !data) return NextResponse.json({ error: error?.message ?? 'not_found' }, { status: 404 })
    company = data
  } else {
    // 1. Get oldest potential company with no content
    const { data: companies, error: fetchErr } = await supabase
      .from('companies')
      .select('*, content(*)')
      .eq('status', 'potential')
      .order('created_at', { ascending: true })
      .limit(20)

    if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 })

    const queue = (companies ?? []).filter(
      (c: { content?: unknown[] }) => !c.content || (c.content as unknown[]).length === 0
    )
    if (queue.length === 0) {
      return NextResponse.json({ message: 'no_pending', detail: 'אין לקוחות בתור' })
    }

    company        = queue[0]
    queueRemaining = queue.length - 1
  }
  const name    = String(company.name ?? '')
  const slug    = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 40) || `lead-${String(company.id).slice(0, 8)}`

  // 2. Generate all content in one Claude call
  const prompt = `אתה מומחה שיווק ו-AI לעסקים קטנים בישראל. שמך יוני אלוני.
המשימה: צור תוכן שיווקי מלא עבור עסק שאנחנו פונים אליו בcold outreach.

פרטי העסק:
- שם: ${name}
- תחום: ${company.industry ?? 'לא ידוע'}
- אתר: ${company.domain ?? 'לא ידוע'}
- איש קשר: ${company.contact_name ?? 'לא ידוע'}
- נתוני מחקר: ${company.notes ?? 'אין'}

צור JSON בלבד (ללא markdown) עם המבנה הבא:

{
  "email_subject": "נושא מייל קצר וספציפי (עד 8 מילים)",
  "email_body": "מייל cold outreach ב-3-4 משפטים. מתייחס לחולשה ספציפית. מסתיים בהצעה לשיחה של 10 דקות.",
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

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: 'You are a JSON API. Return only valid JSON, no markdown, no extra text.',
      messages: [{ role: 'user', content: prompt }],
    })

    const raw   = (message.content[0] as { type: string; text: string }).text.trim()
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) return NextResponse.json({ error: 'bad_response' }, { status: 500 })

    const generated = JSON.parse(match[0])
    const baseUrl   = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://lead-platform-yoni.vercel.app'

    // 3. Save to content table
    const { data: content, error: contentErr } = await supabase
      .from('content')
      .insert({
        company_id:          company.id,
        company_slug:        slug,
        email_subject:       generated.email_subject,
        email_body:          generated.email_body,
        page_url:            `${baseUrl}/leads/${slug}`,
        report_url:          `${baseUrl}/leads/${slug}/report`,
        report_content:      JSON.stringify({ page: generated.page, report: generated.report }),
        page_status:         'deployed',
        report_status:       'ready',
        landing_page_failed: false,
      })
      .select()
      .single()

    if (contentErr) return NextResponse.json({ error: contentErr.message }, { status: 500 })

    // 4. Advance company status
    await supabase
      .from('companies')
      .update({ status: 'awaiting_approval' })
      .eq('id', company.id)

    // 5. Log
    await supabase.from('agent_log').insert({
      company_id: company.id,
      agent_name: 'content-generator',
      action:     'generate_full_content',
      status:     'success',
      payload:    { email_subject: generated.email_subject, slug, content_id: content.id },
    })

    return NextResponse.json({
      company:         { id: company.id, name: company.name, industry: company.industry },
      content:         { email_subject: generated.email_subject, page_url: `${baseUrl}/leads/${slug}`, report_url: `${baseUrl}/leads/${slug}/report` },
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
