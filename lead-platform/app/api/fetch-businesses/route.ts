import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const AUTO_INDUSTRIES = [
  'רפואת שיניים', 'פיזיותרפיה', 'מוסך רכב', 'ספא ועיסוי', 'קוסמטיקאית',
  'שיעורי נגינה', 'גן ילדים פרטי', 'מאפייה', 'משרד עורכי דין', 'מכבסה',
  'חנות ספרים', 'בית קפה', 'אופטיקאי', 'ראיית חשבון', 'מספרה לגברים',
]

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { query, mode } = body
  const isAuto = mode === 'auto' || !query?.trim()

  const industry = isAuto
    ? AUTO_INDUSTRIES[Math.floor(Math.random() * AUTO_INDUSTRIES.length)]
    : null

  const prompt = isAuto
    ? `אתה סוכן מחקר שמאתר עסקים ישראלים קטנים עם נוכחות דיגיטלית חלשה.

חפש 6 עסקים ישראלים בתחום "${industry}" שיש להם אתר חלש או מיושן.

החזר JSON בלבד בפורמט:
{
  "searched_industry": "${industry}",
  "businesses": [
    {
      "name": "שם העסק",
      "domain": "example.co.il",
      "industry": "${industry}",
      "contact_phone": "050-1234567",
      "contact_email": "email@example.com",
      "score": 3,
      "weakness_summary": "אתר מ-2017, אין WhatsApp, אין הזמנות אונליין, אין ביקורות גוגל",
      "city": "תל אביב"
    }
  ]
}

כללים:
- score 1-5 בלבד (אנחנו מחפשים חלשים!)
- אתרים ישנים (pre-2020), אין הזמנה אונליין, אין WhatsApp, אין ביקורות
- נתונים מציאותיים ככל האפשר`
    : `אתה סוכן מחקר שמאתר עסקים ישראלים קטנים עם נוכחות דיגיטלית חלשה.

המשתמש מחפש: "${query}"

מצא 5-7 עסקים ישראלים המתאימים לשאילתה עם אתרים ישנים או חלשים.

החזר JSON בלבד בפורמט:
{
  "businesses": [
    {
      "name": "שם העסק",
      "domain": "example.co.il",
      "industry": "תחום",
      "contact_phone": "050-1234567",
      "contact_email": "email@example.com",
      "score": 4,
      "weakness_summary": "תיאור קצר — אין whatsapp, עיצוב ישן, אין הזמנות",
      "city": "תל אביב"
    }
  ]
}

כללים:
- score 1-10 (נמוך = מועמד טוב לשדרוג)
- אתר ישן, אין הזמנה אונליין, אין WhatsApp, אין ביקורות Google
- נתונים מציאותיים ככל האפשר`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: 'You are a JSON API. Respond with valid JSON only. No markdown, no explanations, no warnings, no extra text — just the raw JSON object.',
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = (message.content[0] as { type: string; text: string }).text.trim()

    // Extract the first {...} block found anywhere in the response
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
