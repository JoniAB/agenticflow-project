// generate-demos.mjs — create 6 demo companies (one per template) and generate content for each
const BASE = 'https://lead-platform-yoni.vercel.app'
const KEY  = 'yoni-agent-key-2025'
const H    = { 'Content-Type': 'application/json', 'X-Agent-Key': KEY }

// One company per template type — English names so slugs work cleanly
const DEMOS = [
  {
    name: 'Racheli Hair Salon',
    domain: 'racheli-salon.co.il',
    industry: 'מספרה',
    source: 'google_maps',
    score: 5,
    contact_name: 'רחלי',
    contact_phone: '052-1234567',
    notes: 'סלון שיער ועיצוב של רחלי, 4.9 כוכבים ב-Google עם 120 ביקורות, אין WhatsApp, אין הזמנת תורים אונליין, אין גלריה עבודות. אתר ישן מ-2019 לא מותאם לנייד.',
    _template: 'hair-salon',
  },
  {
    name: 'Shalom Vet Clinic',
    domain: 'shalom-vet.co.il',
    industry: 'וטרינריה',
    source: 'google_maps',
    score: 6,
    contact_name: 'ד״ר שלום',
    contact_phone: '054-7654321',
    notes: 'מרפאה וטרינרית, 5.0 כוכבים, 200 ביקורות, כל קביעת תור בטלפון ידני, אין WhatsApp, אין אתר מקצועי. מתמחה בכלבים וחתולים.',
    _template: 'vet-clinic',
  },
  {
    name: 'Lea Nail Spa',
    domain: 'lea-nails.co.il',
    industry: 'ציפורניים וספא',
    source: 'google_maps',
    score: 5,
    contact_name: 'לאה',
    contact_phone: '050-9876543',
    notes: 'מכון ציפורניים וספא יופי, מיקרובליידינג, הרמת ריסים. אין WhatsApp לתיאום, אין מחירון באתר, אין הזמנות אונליין. פייסבוק פעיל אך ללא כפתור הזמנה.',
    _template: 'beauty',
  },
  {
    name: 'Miriam Auto Garage',
    domain: 'miriam-garage.co.il',
    industry: 'מוסך',
    source: 'google_maps',
    score: 4,
    contact_name: 'מרים',
    contact_phone: '053-1112222',
    notes: 'מוסך רכב ופחחות, 4.7 כוכבים, 180 ביקורות. אתר עם תמונות שבורות, אין מחירון, אין WhatsApp, אין קביעת תור אונליין. עסק פעיל 15 שנה.',
    _template: 'auto',
  },
  {
    name: 'David Levi Photography',
    domain: 'david-levi-photo.com',
    industry: 'צילום',
    source: 'google_maps',
    score: 5,
    contact_name: 'דוד לוי',
    contact_phone: '052-3334444',
    notes: 'צלם אירועים ופורטרטים, 20 שנות ניסיון. אתר ישן עם גלריה לא מעודכנת, אין WhatsApp, אין טופס יצירת קשר, אין אפשרות לקבוע פגישת היכרות אונליין.',
    _template: 'photographer',
  },
  {
    name: 'Cafe Yarok',
    domain: 'cafe-yarok.co.il',
    industry: 'קפה ומסעדות',
    source: 'google_maps',
    score: 4,
    contact_name: 'יוסי',
    contact_phone: '03-5678901',
    notes: 'בית קפה בוטיק, 4.8 כוכבים, גן ישיבה, אין WhatsApp, אין אפשרות הזמנת שולחן אונליין, אין עמוד Instagram פעיל. קהל יעד 25-45.',
    _template: 'generic',
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

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function main() {
  console.log(`\n🚀 Creating 6 demo companies (one per template)...\n`)
  const companies = []

  for (const demo of DEMOS) {
    const { _template, ...companyData } = demo
    const res = await post('/api/companies', companyData)
    if (!res.ok) {
      console.error(`❌ ${demo.name}: ${res.status} — ${JSON.stringify(res.data)}`)
      continue
    }
    const id = res.data?.id || res.data?.[0]?.id
    console.log(`✅ ${demo.name} (${_template}) → ${id}`)
    companies.push({ id, name: demo.name, template: _template })
  }

  console.log(`\n⏳ Waiting 5s for DB to settle...\n`)
  await sleep(5000)

  console.log(`\n🤖 Generating content for each company via Claude...\n`)
  const results = []

  for (const c of companies) {
    console.log(`Generating: ${c.name} (${c.template})...`)
    const res = await post(`/api/generate-content/next?company_id=${c.id}`, {})
    if (!res.ok) {
      console.error(`❌ ${c.name}: ${res.status} — ${JSON.stringify(res.data)}`)
      continue
    }
    const pageUrl   = res.data?.content?.page_url
    const reportUrl = res.data?.content?.report_url
    console.log(`  ✅ ${c.template}: ${pageUrl}`)
    results.push({ name: c.name, template: c.template, pageUrl, reportUrl })
    await sleep(1000)
  }

  console.log(`\n\n═══════════════════════════════════════════════`)
  console.log(`🎨 DEMO PAGES — ALL 6 TEMPLATES`)
  console.log(`═══════════════════════════════════════════════\n`)
  for (const r of results) {
    console.log(`[${r.template}] ${r.name}`)
    console.log(`  עמוד:  ${r.pageUrl}`)
    console.log(`  דוח:   ${r.reportUrl}`)
    console.log()
  }
}

main().catch(console.error)
