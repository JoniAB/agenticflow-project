// inject-round3.mjs — physiotherapy, yoga, osteopathy, personal trainer
const BASE = 'https://lead-platform-yoni.vercel.app'
const KEY  = 'yoni-agent-key-2025'
const H    = { 'Content-Type': 'application/json', 'X-Agent-Key': KEY }

const LEADS = [
  {
    name: 'ארגו פלוס פיזיותרפיה',
    domain: 'ergoplus.co.il',
    industry: 'פיזיותרפיה',
    source: 'google_maps',
    score: 4,
    contact_name: 'מאיר אפל',
    contact_phone: '054-552-5530',
    notes: '40 שנות ניסיון, אתר מיושן 2015-2018, אין whatsapp, אין הזמנת תורים אונליין, אין ביקורות גוגל, אין גלריה. שני סניפים: בן שמן 6 תל אביב + גני תקווה.',
  },
  {
    name: 'מרכז איינגאר יוגה תל אביב',
    domain: 'iyengar-yoga.co.il',
    industry: 'יוגה',
    source: 'google_maps',
    score: 5,
    contact_name: null,
    contact_phone: '03-6020934',
    notes: 'פעיל מ-1990, שדרות נורדאו 63 תל אביב. אתר מיושן עם תמונות שבורות, אין הזמנת שיעורים אונליין, אין ביקורות גוגל, אין גלריה. יש whatsapp (058-7781101) ופייסבוק.',
  },
  {
    name: 'ירון קוניגסברג — אוסטאופתיה',
    domain: 'osteopathyinisrael.com',
    industry: 'אוסטאופתיה',
    source: 'google_maps',
    score: 3,
    contact_name: 'ירון קוניגסברג',
    contact_phone: '050-2270480',
    contact_email: 'osteopathyinisrael@gmail.com',
    notes: 'רפואה אוסטאופתית, טאגור 57 תל אביב. אתר ישן copyright 2021, אין whatsapp, אין הזמנת תורים, אין ביקורות גוגל, אין סושיאל, אין גלריה. טיפול בכאב ותינוקות.',
  },
  {
    name: 'אלון רינג — מאמן כושר אישי',
    domain: 'alonring.co.il',
    industry: 'כושר',
    source: 'google_maps',
    score: 4,
    contact_name: 'אלון רינג',
    contact_phone: '054-4694149',
    contact_email: 'alonringtbf@gmail.com',
    notes: 'מאמן כושר אישי, מרכז תל אביב. אתר מיושן copyright 2017, אין whatsapp, אין הזמנת תורים אונליין, אין ביקורות גוגל. יש גלריה, פייסבוק, אינסטגרם, YouTube.',
  },
]

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: H,
    body: JSON.stringify(body),
  })
  const text = await res.text()
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) } }
  catch { return { ok: res.ok, status: res.status, data: text } }
}

async function main() {
  console.log(`\nInjecting ${LEADS.length} leads...\n`)
  let created = 0, errors = 0

  for (const lead of LEADS) {
    const res = await post('/api/companies', lead)
    if (!res.ok) {
      console.error(`❌ ${lead.name}: ${res.status} — ${JSON.stringify(res.data)}`)
      errors++
    } else {
      const id = res.data?.id || res.data?.[0]?.id
      console.log(`✅ ${lead.name} → ${id}`)
      created++
    }
  }

  console.log(`\n──────────────────────────`)
  console.log(`✅ Created: ${created}  ❌ Errors: ${errors}`)
}

main().catch(console.error)
