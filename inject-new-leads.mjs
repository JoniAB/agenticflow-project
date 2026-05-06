// inject-new-leads.mjs — 6 Israeli businesses with weak websites
const BASE = 'https://lead-platform-yoni.vercel.app'
const KEY  = 'yoni-agent-key-2025'
const H    = { 'Content-Type': 'application/json', 'X-Agent-Key': KEY }

const LEADS = [
  {
    name: 'ד"ר שלמה בירשאן — רפואת שיניים',
    domain: 'drbirshan.com',
    industry: 'רפואת שיניים',
    source: 'google_maps',
    score: 4,
    contact_name: 'ד"ר שלמה בירשאן',
    contact_phone: '03-6025803',
    notes: 'רופא שיניים, אתר מיושן מ-2019, אין whatsapp, אין הזמנת תורים אונליין, אין ביקורות גוגל, אין פעילות סושיאל. כתובת: שדרות נורדאו 89/1, תל אביב. טלפון נוסף: 052-2759861.',
  },
  {
    name: 'זיידה ושות\' — רואה חשבון',
    domain: 'k-w.co.il',
    industry: 'ראיית חשבון',
    source: 'google_maps',
    score: 4,
    contact_name: 'גיל זיידה',
    contact_phone: '052-802-1274',
    contact_email: 'gilzajde@gmail.com',
    notes: 'רואה חשבון, אתר מיושן מ-2018, אין whatsapp, אין הזמנת פגישה אונליין, עיצוב ישן ולא מותאם לניידים. כתובת: דרך מנחם בגין 44, תל אביב.',
  },
  {
    name: 'מוסך רכב דוד',
    domain: 'davidcenter.co.il',
    industry: 'מוסך',
    source: 'google_maps',
    score: 4,
    contact_name: 'דוד',
    contact_phone: '03-5370560',
    notes: 'מוסך רכב, אתר עם תמונות placeholder, עיצוב ישן ולא מקצועי, ביקורות בגוגל. כתובת: נירים 6, תל אביב. WhatsApp: 053-9263565.',
  },
  {
    name: 'מוסך המכונן',
    domain: 'hamechonen.co.il',
    industry: 'מוסך',
    source: 'google_maps',
    score: 4,
    contact_name: null,
    contact_phone: '077-8044-500',
    notes: 'מוסך, אתר מיושן, אין מחירון, אין whatsapp, אין הזמנת תורים, עיצוב לא מקצועי. כתובת: ישראל ב"ק 24, תל אביב.',
  },
  {
    name: 'לשם — משרד עורכי דין',
    domain: 'leshem-law.com',
    industry: 'עורכי דין',
    source: 'google_maps',
    score: 5,
    contact_name: 'דניאל לשם',
    contact_phone: '03-6344550',
    contact_email: 'danielle@leshem-law.com',
    notes: 'משרד עורכי דין, עיצוב 2022, יש whatsapp, אין מחירון, אין אפשרות לקבוע פגישה אונליין, אין ביקורות גוגל. כתובת: מגדל מידטאון, מנחם בגין 144 קומה 29. טלפון נוסף: 054-4540053.',
  },
  {
    name: 'עלית פיטנס',
    domain: 'elite-f.com',
    industry: 'כושר',
    source: 'google_maps',
    score: 4,
    contact_name: null,
    contact_phone: '054-2000995',
    notes: 'אולם כושר, אתר מיושן, אין הזמנת מנויים אונליין, אין whatsapp, עיצוב ישן ולא מותאם לניידים. טלפון נוסף: 077-6500102.',
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
  console.log(`\nInjecting ${LEADS.length} new leads into ${BASE}\n`)
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
