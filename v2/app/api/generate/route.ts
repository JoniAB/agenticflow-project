import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { Lead } from '@/lib/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Cached static schema — saves ~90% on input tokens for repeated calls
const GENERATE_SYSTEM = [
  {
    type: 'text' as const,
    text: `אתה מומחה שיווק ו-AI לעסקים קטנים בישראל. שמך יוני אלוני. JSON API בלבד.

החזר JSON עם המבנה הבא:
{
  "email_subject": "נושא מייל (עד 8 מילים)",
  "email_body": "מייל cold outreach ב-3-4 משפטים. אישי, מכיל ממצא ספציפי, מסתיים בהצעה לשיחה של 10 דקות. ללא לינקים.",
  "report_html": "דוח HTML מלא — ראה הוראות",
  "landing_html": "עמוד נחיתה HTML מלא — ראה הוראות",
  "slug": "slug-kebab-case-מהשם"
}

הוראות לדוח HTML (report_html):
- עמוד HTML עצמאי עם כל ה-CSS inline
- כולל: כותרת עם שם העסק, ציון דיגיטלי עם ring animation, סיכום מנהלים, ממצאים (high/medium/low), המלצות ממוספרות, CTA לשיחה עם יוני
- עיצוב: רקע לבן (#F8FAFC), כרטיסי ממצאים עם border-top צבעוני, כותרות בפונט Frank Ruhl Libre
- RTL, עברית

הוראות לעמוד נחיתה HTML (landing_html):
בחר סגנון לפי תחום העסק:
- מוסך/רכב/מכניקה → סגנון editorial: טיפוגרפיה ענקית, dark mode, אקסנט כתום, grid layout א-סימטרי
- קליניקה/וטרינר/רפואה → סגנון clean professional: לבן + ירוק, serif headings, חצאי עיגולים, תחושת אמון
- מספרה/יופי/קוסמטיקה → סגנון luxury editorial: שחור + זהב, serif italic, whitespace גדול, תמונות מלאות
- מסעדה/קפה/אוכל → סגנון warm artisan: קרם + חום כהה, serif headings, texture background
- ספורט/כושר → סגנון high-energy: שחור + ניאון, condensed font, diagonal cuts
- ברירת מחדל → סגנון brutalist minimal: שחור + לבן + אקסנט חד, typography-first, borders בולטים
דרישות לכל העמודים: hero דרמטי עם animation, pain points, solutions, CTA חד וברור, RTL`,
    cache_control: { type: 'ephemeral' as const },
  },
]

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'lead'
}

function sse(event: string, data: unknown): Uint8Array {
  return new TextEncoder().encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const leadId = url.searchParams.get('lead_id')
  const wantStream = url.searchParams.get('stream') === 'true'
  return handleGenerate(leadId, wantStream)
}

export async function POST(req: NextRequest) {
  const url  = new URL(req.url)
  const body = await req.json()
  const leadId = url.searchParams.get('lead_id') ?? body.lead_id
  const wantStream = url.searchParams.get('stream') === 'true' || body.stream === true
  return handleGenerate(leadId, wantStream)
}

async function handleGenerate(leadId: string | null, wantStream: boolean): Promise<Response> {
  const supabase = getSupabaseAdmin()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(sse('progress', { message: 'טוען ליד...' }))

        let lead: Lead
        if (leadId) {
          const { data, error } = await supabase.from('leads').select('*').eq('id', leadId).single()
          if (error || !data) throw new Error('ליד לא נמצא')
          lead = data as Lead
        } else {
          const { data } = await supabase.from('leads').select('*').eq('status', 'search_complete').order('created_at', { ascending: true }).limit(1).single()
          if (!data) { controller.enqueue(sse('done', { message: 'no_pending' })); controller.close(); return }
          lead = data as Lead
        }

        // Mark as researching
        await supabase.from('leads').update({ status: 'researching' }).eq('id', lead.id)
        controller.enqueue(sse('progress', { message: `מחקר עבור ${lead.business_name}...` }))

        const prompt = `פרטי העסק:
- שם: ${lead.business_name}
- תחום: ${lead.industry ?? 'לא ידוע'}
- עיר: ${lead.city ?? 'לא ידוע'}
- אתר: ${lead.website_url ?? 'אין'}
- איש קשר: ${lead.contact_name ?? 'לא ידוע'}
- חולשות: ${lead.weakness_summary ?? 'חולשה דיגיטלית כללית'}
- ציון: ${lead.score ?? 3}/10

צור תוכן שיווקי מלא לפי ההוראות שקיבלת.`

        controller.enqueue(sse('progress', { message: 'מייצר תוכן עם Claude...' }))

        const message = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 8000,
          system: GENERATE_SYSTEM,
          messages: [{ role: 'user', content: prompt }],
        })

        controller.enqueue(sse('progress', { message: 'מעבד תוצאות...' }))

        const raw = (message.content[0] as { type: string; text: string }).text.trim()
        const match = raw.match(/\{[\s\S]*\}/)
        if (!match) throw new Error('תשובה לא תקינה מהסוכן')

        let generated: Record<string, unknown>
        try { generated = JSON.parse(match[0]) }
        catch { throw new Error('JSON לא תקין בתשובה') }

        const slug = String(generated.slug ?? slugify(lead.business_name))
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://agenticflow-pages.vercel.app'
        const reportUrl = `${baseUrl}/v2/${slug}/report.html`
        const landingUrl = `${baseUrl}/v2/${slug}/index.html`

        controller.enqueue(sse('progress', { message: 'שומר קבצים...' }))

        // Save HTML files to public/demos (for local/Vercel static serving)
        // In production these would be written to Vercel Blob or similar
        // For now we store the HTML content in the DB and link to an API route
        await supabase.from('leads').update({
          status:          'content_ready',
          email_subject:   String(generated.email_subject ?? ''),
          email_draft:     `${generated.email_body}\n\n---\n📊 דוח: ${reportUrl}\n🔗 עמוד: ${landingUrl}`,
          report_url:      reportUrl,
          landing_page_url: landingUrl,
          research_notes:  JSON.stringify({ report_html: generated.report_html, landing_html: generated.landing_html }),
        }).eq('id', lead.id)

        await supabase.from('agent_logs').insert({
          lead_id:    lead.id,
          agent_name: 'content-generator',
          action:     'generate_full_content',
          result:     `slug=${slug}`,
        })

        controller.enqueue(sse('done', { message: `תוכן מוכן עבור ${lead.business_name}`, lead_id: lead.id, slug }))
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error'
        controller.enqueue(sse('error', { error: msg }))
        if (leadId) {
          const supabase2 = getSupabaseAdmin()
          await supabase2.from('leads').update({ status: 'error' }).eq('id', leadId)
          await supabase2.from('agent_logs').insert({ lead_id: leadId, agent_name: 'content-generator', action: 'generate_failed', error: msg })
        }
      }
      controller.close()
    },
  })

  if (wantStream) {
    return new Response(readable, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
    })
  }

  // Non-streaming: consume the stream and return JSON
  const reader = readable.getReader()
  const decoder = new TextDecoder()
  let result: Record<string, unknown> = {}
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const text = decoder.decode(value)
    for (const line of text.split('\n')) {
      if (line.startsWith('data: ')) {
        try { result = JSON.parse(line.slice(6)) } catch {}
      }
    }
  }
  return Response.json(result)
}
