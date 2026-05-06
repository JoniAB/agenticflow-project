// inject-leads.mjs — pushes all leads + content to lead-platform API
const BASE = 'https://lead-platform-yoni.vercel.app'
const KEY  = 'yoni-agent-key-2025'
const H    = { 'Content-Type': 'application/json', 'X-Agent-Key': KEY }

const LEADS = [
  {
    company: {
      name: 'אלכס ארט',
      domain: 'agenticflow-pages.vercel.app/alex-art',
      industry: 'צילום',
      source: 'other',
      contact_name: 'אלכס',
      contact_phone: '052-2802386',
      notes: 'סטודיו צילום, ביקורות טובות, חסר WhatsApp ומחירון אוטומטי',
    },
    content: {
      company_slug: 'alex-art',
      page_url: 'https://agenticflow-pages.vercel.app/alex-art/',
      report_url: null,
      email_subject: 'הכנתי משהו עבור אלכס ארט',
      email_body: `שלום אלכס,

בניתי הדגמה של סוכן AI שמטפל בלידים — כולל הצעות מחיר ראשוניות אוטומטיות.

קישור לצפייה ישירה: https://agenticflow-pages.vercel.app/alex-art/

אם מעניין, 10 דקות שיחה ואני מראה לכם הדגמה חיה:
https://cal.com/yoniautomation/אוטומציה-עסקית

יוני אלוני`,
    },
    whatsapp: '052-2802386',
  },
  {
    company: {
      name: 'בן אלבגלי — וטרינר',
      domain: 'agenticflow-pages.vercel.app/ben-albageli',
      industry: 'וטרינריה',
      source: 'other',
      contact_name: 'בן',
      contact_phone: '03-9388824',
      notes: 'וטרינר, 5.0 כוכבים, אין הזמנת תורים אונליין',
    },
    content: {
      company_slug: 'ben-albageli',
      page_url: 'https://agenticflow-pages.vercel.app/ben-albageli/',
      report_url: 'https://agenticflow-pages.vercel.app/ben-albageli/report.html',
      email_subject: null,
      email_body: null,
    },
    whatsapp: '03-9388824',
  },
  {
    company: {
      name: 'מספרת בורוכוב',
      domain: 'agenticflow-pages.vercel.app/borochov',
      industry: 'מספרה',
      source: 'other',
      contact_name: 'קובי/ואלי',
      contact_phone: '050-9707075',
      notes: 'מספרה, מתמחה בשיקום שיער, דירוג 9/10, אין גלריה באתר',
    },
    content: {
      company_slug: 'borochov',
      page_url: 'https://agenticflow-pages.vercel.app/borochov/',
      report_url: 'https://agenticflow-pages.vercel.app/borochov/report.html',
      email_subject: 'בורוכוב — בניתי לכם משהו',
      email_body: `שלום צוות בורוכוב,

שמי יוני, אני עוסק בבניית סוכני AI לעסקים קטנים.

הכנתי לכם הדגמה אישית של מה שאפשר לחסוך בעבודה ידנית.

הנה הקישור לצפייה: https://agenticflow-pages.vercel.app/borochov/

אם אתם רוצים לצלול לעומק — הכנתי גם ניתוח מלא של הפוטנציאל שלכם:
https://agenticflow-pages.vercel.app/borochov/report.html

10 דקות שיחה — ואני מראה לכם בדיוק איך זה נראה בתוך הסלון שלכם.
https://cal.com/yoniautomation/אוטומציה-עסקית

יוני אלוני
אוטומציה ו-AI לעסקים`,
    },
    whatsapp: '050-9707075',
  },
  {
    company: {
      name: 'קליניקת גלית פינר-גולדנברג',
      domain: 'agenticflow-pages.vercel.app/galit-vet',
      industry: 'וטרינריה',
      source: 'other',
      contact_name: 'גלית',
      contact_phone: '054-9447080',
      notes: 'רפואה וטרינרית + משלימה (דיקור, הומיאופתיה, כירופרקטיקה), אין תורים אונליין',
    },
    content: {
      company_slug: 'galit-vet',
      page_url: 'https://agenticflow-pages.vercel.app/galit-vet/',
      report_url: 'https://agenticflow-pages.vercel.app/galit-vet/report.html',
      email_subject: 'הכנתי הדגמה לקליניקת גלית פינר-גולדנברג',
      email_body: `שלום גלית,

הכנתי הדגמה אישית + ניתוח של מה אוטומציה יכולה לחסוך בקליניקה שלכם.

ראו את ההדגמה האישית שבניתי לקליניקה שלכם: https://agenticflow-pages.vercel.app/galit-vet/

הכנתי גם דוח מפורט עם חישוב הפוטנציאל לחיסכון בזמן ועלויות:
https://agenticflow-pages.vercel.app/galit-vet/report.html

רוצים לראות איך זה עובד אצלכם? 10 דקות שיחה:
https://cal.com/yoniautomation/אוטומציה-עסקית

יוני אלוני`,
    },
    whatsapp: '054-9447080',
  },
  {
    company: {
      name: 'קליניקת ד"ר ינבר-בצר',
      domain: 'agenticflow-pages.vercel.app/inbar-vet',
      industry: 'וטרינריה',
      source: 'other',
      contact_name: 'ד"ר ענבר',
      contact_phone: '054-5401202',
      notes: '9.0/10 עם 136 ביקורות, מתמחה בחיות נדירות, אין WhatsApp ולא הזמנה אונליין',
    },
    content: {
      company_slug: 'inbar-vet',
      page_url: 'https://agenticflow-pages.vercel.app/inbar-vet/',
      report_url: 'https://agenticflow-pages.vercel.app/inbar-vet/report.html',
      email_subject: 'הכנתי הדגמה לקליניקת ד"ר ינבר-בצר',
      email_body: `שלום ד"ר ינבר-בצר,

בניתי הדגמה + דוח מותאם לקליניקה שלכם.

ראו את ההדגמה האישית שבניתי לקליניקה שלכם: https://agenticflow-pages.vercel.app/inbar-vet/

הכנתי גם דוח מפורט עם חישוב הפוטנציאל לחיסכון בזמן ועלויות:
https://agenticflow-pages.vercel.app/inbar-vet/report.html

רוצים לראות איך זה עובד אצלכם? 10 דקות שיחה:
https://cal.com/yoniautomation/אוטומציה-עסקית

יוני אלוני`,
    },
    whatsapp: '054-5401202',
  },
  {
    company: {
      name: 'ניר אליאס — מספרה',
      domain: 'agenticflow-pages.vercel.app/nir-elias',
      industry: 'מספרה',
      source: 'other',
      contact_name: 'ניר',
      contact_phone: '050-2249151',
      notes: 'מספרה + חנות מוצרים, שני ערוצי הכנסה ללא חיבור ביניהם, אין הזמנת תורים',
    },
    content: {
      company_slug: 'nir-elias',
      page_url: 'https://agenticflow-pages.vercel.app/nir-elias/',
      report_url: 'https://agenticflow-pages.vercel.app/nir-elias/report.html',
      email_subject: 'ניר אליאס — בניתי לכם משהו',
      email_body: `שלום ניר,

שמי יוני, אני עוסק בבניית סוכני AI לעסקים קטנים.

הכנתי לכם דמו של בוט שמציג מחירים, מזמין תורים ומשיב ללקוחות — אוטומטית.

הנה הקישור לצפייה: https://agenticflow-pages.vercel.app/nir-elias/

אם אתם רוצים לצלול לעומק — הכנתי גם ניתוח מלא של הפוטנציאל שלכם:
https://agenticflow-pages.vercel.app/nir-elias/report.html

10 דקות שיחה — ואני מראה לכם בדיוק איך זה נראה בתוך הסלון שלכם.
https://cal.com/yoniautomation/אוטומציה-עסקית

יוני אלוני`,
    },
    whatsapp: '050-2249151',
  },
  {
    company: {
      name: 'מרכז וטרינרי פסגות',
      domain: 'agenticflow-pages.vercel.app/psagot-vet',
      industry: 'וטרינריה',
      source: 'other',
      contact_name: 'ד"ר פרחי',
      contact_email: 'vetpsagotclinic@gmail.com',
      contact_phone: '052-4562030',
      notes: '4.9 כוכבים, אינסטגרם ופייסבוק פעילים, כל קביעת תור דרך WhatsApp ידני',
    },
    content: {
      company_slug: 'psagot-vet',
      page_url: 'https://agenticflow-pages.vercel.app/psagot-vet/',
      report_url: 'https://agenticflow-pages.vercel.app/psagot-vet/report.html',
      email_subject: 'הכנתי הדגמה לקליניקת מרכז וטרינרי פסגות',
      email_body: `שלום ד"ר פרחי,

הכנתי לכם הדגמה + דוח מלא על איך בוט WhatsApp יכול לקלוט פניות חירום ולקבע תורים 24/7.

ראו את ההדגמה האישית שבניתי לקליניקה שלכם: https://agenticflow-pages.vercel.app/psagot-vet/

הכנתי גם דוח מפורט עם חישוב הפוטנציאל לחיסכון בזמן ועלויות:
https://agenticflow-pages.vercel.app/psagot-vet/report.html

רוצים לראות איך זה עובד אצלכם? 10 דקות שיחה:
https://cal.com/yoniautomation/אוטומציה-עסקית

יוני אלוני`,
    },
    whatsapp: '052-4562030',
  },
  {
    company: {
      name: 'ראן כהן — צלם',
      domain: 'agenticflow-pages.vercel.app/ran-cohen',
      industry: 'צילום',
      source: 'other',
      contact_name: 'ראן כהן',
      contact_phone: '052-4444160',
      notes: '355 ביקורות 4.7 כוכבים, נוכחות דיגיטלית חזקה, אין WhatsApp ולא הזמנה עצמאית',
    },
    content: {
      company_slug: 'ran-cohen',
      page_url: 'https://agenticflow-pages.vercel.app/ran-cohen/',
      report_url: null,
      email_subject: 'הכנתי משהו עבור ראן כהן',
      email_body: `שלום ראן,

הכנתי הדגמה של בוט שמגיב ללידים תוך שניות ומזמין פגישת היכרות אוטומטית.

קישור לצפייה ישירה: https://agenticflow-pages.vercel.app/ran-cohen/

אם מעניין, 10 דקות שיחה ואני מראה לכם הדגמה חיה:
https://cal.com/yoniautomation/אוטומציה-עסקית

יוני אלוני`,
    },
    whatsapp: '052-4444160',
  },
  {
    company: {
      name: 'קליניקת ד"ר אבי שרפתי',
      domain: 'agenticflow-pages.vercel.app/sarfati-vet',
      industry: 'וטרינריה',
      source: 'other',
      contact_name: 'ד"ר צרפתי',
      contact_phone: '054-4416277',
      notes: 'בית חולים וטרינרי, אתר ב-5 שפות, 260 ביקורות 4.8 כוכבים, אין תורים אונליין',
    },
    content: {
      company_slug: 'sarfati-vet',
      page_url: 'https://agenticflow-pages.vercel.app/sarfati-vet/',
      report_url: 'https://agenticflow-pages.vercel.app/sarfati-vet/report.html',
      email_subject: 'הכנתי הדגמה לקליניקת ד"ר אבי שרפתי',
      email_body: `שלום ד"ר שרפתי,

בניתי הדגמה + דוח על חיסכון בשעות עבודה עם סוכן AI לווטרינריה.

ראו את ההדגמה האישית שבניתי לקליניקה שלכם: https://agenticflow-pages.vercel.app/sarfati-vet/

הכנתי גם דוח מפורט עם חישוב הפוטנציאל לחיסכון בזמן ועלויות:
https://agenticflow-pages.vercel.app/sarfati-vet/report.html

רוצים לראות איך זה עובד אצלכם? 10 דקות שיחה:
https://cal.com/yoniautomation/אוטומציה-עסקית

יוני אלוני`,
    },
    whatsapp: '054-4416277',
  },
  {
    company: {
      name: 'שרלי הררי SH',
      domain: 'sharli-harri.com',
      industry: 'מספרה/יופי',
      source: 'other',
      contact_name: 'שרלי',
      contact_email: 'info@sharli-harri.com',
      contact_phone: '03-5758008',
      notes: 'סלון יופי, עבודות מדהימות בפייסבוק, אין WhatsApp ולא הזמנת תורים',
    },
    content: {
      company_slug: 'sharli-harri',
      page_url: 'https://agenticflow-pages.vercel.app/sharli-harri/',
      report_url: 'https://agenticflow-pages.vercel.app/sharli-harri/report.html',
      email_subject: 'שרלי הררי SH — בניתי לכם משהו',
      email_body: `שלום שרלי,

שמי יוני, אני עוסק בבניית סוכני AI לעסקים קטנים.

בניתי לכם הדגמה של סוכן AI שמקבל הזמנות תורים 24/7 — כולל בסופי שבוע.

הנה הקישור לצפייה: https://agenticflow-pages.vercel.app/sharli-harri/

אם אתם רוצים לצלול לעומק — הכנתי גם ניתוח מלא של הפוטנציאל שלכם:
https://agenticflow-pages.vercel.app/sharli-harri/report.html

10 דקות שיחה — ואני מראה לכם בדיוק איך זה נראה בתוך הסלון שלכם.
https://cal.com/yoniautomation/אוטומציה-עסקית

יוני אלוני`,
    },
    whatsapp: '03-5758008',
  },
  {
    company: {
      name: 'סטודיו איריס',
      domain: 'studio-iris.com',
      industry: 'צילום',
      source: 'other',
      contact_name: 'אלדד',
      contact_email: 'studioiris@inter.net.il',
      contact_phone: '050-5586812',
      notes: '40 שנות ניסיון, נוכחות ברשתות, אין ביקורות גוגל, copyright 2019',
    },
    content: {
      company_slug: 'studio-iris',
      page_url: 'https://agenticflow-pages.vercel.app/studio-iris/',
      report_url: null,
      email_subject: 'הכנתי משהו עבור סטודיו איריס',
      email_body: `שלום אלדד,

בניתי לכם עמוד הדגמה שמראה בדיוק מה סוכן AI יכול לעשות לסטודיו שלכם.

קישור לצפייה ישירה: https://agenticflow-pages.vercel.app/studio-iris/

אם מעניין, 10 דקות שיחה ואני מראה לכם הדגמה חיה:
https://cal.com/yoniautomation/אוטומציה-עסקית

יוני אלוני`,
    },
    whatsapp: '050-5586812',
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
  console.log(`\nInjecting ${LEADS.length} leads into ${BASE}\n`)
  let created = 0, errors = 0

  for (const lead of LEADS) {
    // 1. Create company
    const companyRes = await post('/api/companies', lead.company)
    if (!companyRes.ok) {
      console.error(`❌ ${lead.company.name}: ${companyRes.status} — ${JSON.stringify(companyRes.data)}`)
      errors++
      continue
    }
    const companyId = companyRes.data?.id || companyRes.data?.[0]?.id
    console.log(`✅ Company: ${lead.company.name} → ${companyId}`)

    // 2. Create content if we have email/page
    if (lead.content.page_url || lead.content.email_subject) {
      const contentRes = await post('/api/content', {
        company_id: companyId,
        ...lead.content,
        page_status: 'deployed',
        report_status: lead.content.report_url ? 'ready' : 'draft',
      })
      if (!contentRes.ok) {
        console.error(`  ⚠️  Content failed: ${contentRes.status} — ${JSON.stringify(contentRes.data)}`)
      } else {
        console.log(`  📧 Content saved`)
      }
    }

    created++
  }

  console.log(`\n──────────────────────────`)
  console.log(`✅ Created: ${created}  ❌ Errors: ${errors}`)
}

main().catch(console.error)
