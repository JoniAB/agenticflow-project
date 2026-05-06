# AgenticFlow — Cold Outreach Automation System

**Owner:** יוני אלוני (aloni.yoni@gmail.com)
**Purpose:** מערכת אוטומציה מלאה לאיתור עסקים ישראלים לא-מושקעים, מחקר, יצירת תוצרים מותאמים אישית, ושליחת cold outreach — עם אישור אנושי לכל שליחה.

---

## קרא את האפיון המלא

**`SOP-001-cold-outreach.md`** בשורש הפרויקט — זה המסמך הכי חשוב. הוא מגדיר:
- 10 boards ומה קורה בכל אחד
- Field schema מלא לכל record
- כל הצעדים (שלב 1–8) עם constraints קשיחים
- Error handling + Success Criteria

**MUST** לקרוא את ה-SOP לפני כל עבודה על ה-backend.

---

## ארכיטקטורה

```
agenticflow-project/
├── lead-platform/          ← Next.js 16 app — ה-backend + dashboard
│   ├── app/
│   │   ├── api/            ← REST API endpoints לסוכנים
│   │   │   ├── companies/  ← CRUD לחברות (leads)
│   │   │   ├── research/   ← שמירת research_report + pain_points
│   │   │   ├── content/    ← שמירת email + report + landing page
│   │   │   ├── outreach/   ← שליחת מיילים + follow-ups
│   │   │   └── agent-log/  ← לוג פעולות סוכנים
│   │   └── boards/         ← UI: 10 boards לפי SOP
│   └── lib/
│       ├── types.ts        ← TypeScript types (יש לעדכן לפי SOP)
│       └── supabase.ts     ← Supabase client
├── SOP-001-cold-outreach.md ← האפיון המלא
└── outreach-pages/         ← עמודי נחיתה שנוצרים לכל חברה
```

---

## נקודת ההתחלה — Backend API

הנקודה הכי טבעית להתחיל ממנה היא **`lead-platform/app/api/`**.

### מה צריך לבנות / לשפר:

**1. Webhook endpoint (חסר)**
```
POST /api/v1/webhook/cowork
```
מקבל payload מ-Cowork, בודק כפילות לפי `company_id`, יוצר record ב-B-01.

**2. Schema alignment**
ה-types.ts הנוכחי לא תואם ל-SOP. צריך להוסיף:
- `cowork_raw_data`, `scoring_result`, `scoring_notes`
- `research_report` (JSON), `pain_points` (string[])
- `landing_page_url`, `landing_page_failed`, `company_slug`
- `followup_subject`, `followup_body`, `rejection_reason`
- Board IDs: B-01 עד B-10

**3. Board routing endpoints**
```
PATCH /api/v1/companies/:id/board   ← העברה בין boards
PATCH /api/v1/companies/:id/status  ← עדכון status
```

**4. Cron triggers**
```
POST /api/v1/cron/daily-pull        ← 08:00 IL — משיכה מ-Cowork
POST /api/v1/cron/followup-check    ← 08:00/13:00/18:00 IL
```

---

## Constraints קריטיים (מה-SOP)

- **NEVER** לשלוח מייל ללא `status: "approved"` מפורש
- **NEVER** ליצור record אם `company_id` כבר קיים
- **NEVER** לשלוח follow-up לפני 72 שעות
- **ALWAYS** לשמור `first_email_sent_at` לפני שינוי status ל-`sent`
- **ALWAYS** לתעד כל פעולת agent ב-`agent_log`

---

## Stack

- **Framework:** Next.js 16 (App Router) — יש breaking changes, קרא `node_modules/next/dist/docs/`
- **DB:** Supabase (PostgreSQL)
- **Email:** Gmail API מ-`yoniautomation@gmail.com`
- **Deploys:** Vercel — עמודי נחיתה תחת `/leads/{company_slug}`
- **Language:** TypeScript

---

## Open Questions (מה-SOP)

לפני שמממשים שלב 1 — צריך מיוני:
1. Endpoint + פורמט payload של Cowork API
2. אילו שדות Cowork מחזיר על חברה / איש קשר
3. Vercel project name + דומיין סופי
