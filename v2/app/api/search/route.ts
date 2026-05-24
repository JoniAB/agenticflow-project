import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Static system prompt — cached for repeated calls
const SEARCH_SYSTEM = [
  {
    type: 'text' as const,
    text: `אתה סוכן מחקר שמאתר עסקים ישראלים קטנים עם נוכחות דיגיטלית חלשה.
החזר JSON בלבד. ללא markdown. ללא הסברים.

פורמט תשובה:
{
  "businesses": [
    {
      "business_name": "שם העסק",
      "contact_name": "שם איש הקשר אם ידוע",
      "address": "כתובת אם ידועה",
      "website_url": null,
      "social_links": [],
      "industry": "תחום",
      "city": "עיר",
      "score": 2,
      "weakness_summary": "תיאור קצר של החולשות הדיגיטליות"
    }
  ]
}

כללים:
- score 1-4 בלבד (אנחנו רוצים עסקים שצריכים עזרה דיגיטלית)
- ציון 1-2 = אין אתר בכלל. ציון 3-4 = אתר ישן/חלש
- website_url = null אם אין אתר
- נתונים מציאותיים ואמינים בלבד`,
    cache_control: { type: 'ephemeral' as const },
  },
]

function buildPrompt(params: {
  industry: string; location: string; max_results: number;
  no_website: boolean; old_website: boolean; weak_socials: boolean;
}): string {
  const criteria = [
    params.no_website   && 'עסקים ללא אתר אינטרנט',
    params.old_website  && 'עסקים עם אתר ישן או לא מעודכן',
    params.weak_socials && 'עסקים עם נוכחות חלשה ברשתות חברתיות',
  ].filter(Boolean).join(', ')

  return `מצא ${params.max_results} עסקים ${params.industry ? `בתחום "${params.industry}"` : 'בכל תחום'} באזור ${params.location}.
קריטריונים: ${criteria || 'חולשה דיגיטלית כלשהי'}.
החזר JSON עם מבנה businesses[].`
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { industry = '', location = 'ישראל', max_results = 20, no_website = true, old_website = true, weak_socials = true, stream: wantStream = false } = body

  const prompt = buildPrompt({ industry, location, max_results, no_website, old_website, weak_socials })

  const encoder = new TextEncoder()

  function sse(event: string, data: unknown): Uint8Array {
    return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  }

  if (wantStream) {
    const readable = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(sse('progress', { message: 'שולח בקשה לסוכן חיפוש...' }))
          const message = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1200,
            system: SEARCH_SYSTEM,
            messages: [{ role: 'user', content: prompt }],
          })
          controller.enqueue(sse('progress', { message: 'מעבד תוצאות...' }))

          const raw = (message.content[0] as { type: string; text: string }).text.trim()
          const match = raw.match(/\{[\s\S]*\}/)
          if (!match) throw new Error('תשובה לא תקינה מהסוכן')

          const { businesses } = JSON.parse(match[0]) as { businesses: Record<string, unknown>[] }
          if (!businesses?.length) throw new Error('לא נמצאו עסקים')

          const supabase = getSupabaseAdmin()
          let saved = 0
          for (const biz of businesses) {
            controller.enqueue(sse('progress', { message: `שומר: ${biz.business_name}...` }))
            const { error } = await supabase.from('leads').insert({
              business_name:    biz.business_name,
              contact_name:     biz.contact_name ?? null,
              address:          biz.address ?? null,
              website_url:      biz.website_url ?? null,
              social_links:     biz.social_links ?? [],
              industry:         biz.industry ?? industry,
              city:             biz.city ?? null,
              score:            biz.score ?? 3,
              weakness_summary: biz.weakness_summary ?? null,
              status:           'new_lead',
            })
            if (!error) saved++
            await supabase.from('agent_logs').insert({
              agent_name: 'search-agent',
              action: 'found_lead',
              result: String(biz.business_name),
              error: error?.message ?? null,
            })
          }
          controller.enqueue(sse('done', { message: `נמצאו ונשמרו ${saved} עסקים`, count: saved }))
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : 'Unknown error'
          controller.enqueue(sse('error', { error: msg }))
          await getSupabaseAdmin().from('agent_logs').insert({ agent_name: 'search-agent', action: 'search_failed', error: msg })
        }
        controller.close()
      },
    })
    return new Response(readable, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
    })
  }

  // Non-streaming fallback
  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      system: SEARCH_SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (message.content[0] as { type: string; text: string }).text.trim()
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) return Response.json({ error: 'bad_response' }, { status: 500 })
    return Response.json(JSON.parse(match[0]))
  } catch (e: unknown) {
    return Response.json({ error: e instanceof Error ? e.message : 'Unknown' }, { status: 500 })
  }
}
