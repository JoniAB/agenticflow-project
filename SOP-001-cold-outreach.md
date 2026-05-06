# SOP-001 — B2B Cold Outreach Automation
**Version:** 1.0 | **Date:** 2025-05-04 | **Status:** Draft | **Executor:** Claude Code Agents | **Owner:** יוני אלוני

---

## Overview

מערכת אוטומציה מלאה לאיתור עסקים "לא מושקעים" בישראל, מחקר עליהם, יצירת חומרים מותאמים אישית, ושליחת cold outreach מאושרת. יוני מאשר כל שליחה — הסוכנים עושים הכל מלבד לחיצת הכפתור הסופית.

**עיקרון הציון:** ציון נמוך = עסק שצריך עזרה = לקוח פוטנציאלי מעולה. ציון גבוה = עסק מושקע = פחות רלוונטי.

---

## Table of Contents

1. [Board Map](#board-map)
2. [Field Schema](#field-schema)
3. [Scoring Criteria](#scoring-criteria)
4. [Steps](#steps)
5. [Error Handling](#error-handling)
6. [Expected Output](#expected-output)
7. [Success Criteria](#success-criteria)
8. [Notes & Edge Cases](#notes--edge-cases)
9. [Open Questions](#open-questions)

---

## Trigger

**Time-based:** Cron job — פעם ביום, 08:00 שעון ישראל (UTC+3).
**Webhook:** Cowork שולח `POST` ל-`/api/v1/webhook/cowork` על כל חברה או איש קשר חדש שנכנס → מופעל מיידית.

---

## Board Map

| Board | שם | בעלות | תיאור |
|---|---|---|---|
| B-01 | Raw Leads | Research Agent | חברות שנמשכו מ-Cowork, טרם עובדו |
| B-02 | Scoring | Research Agent | בתהליך ניקוד |
| B-03 | Potentials | Research Agent | ציון 1–5 — מטרות מועדפות לפנייה |
| B-04 | High Score | Research Agent | ציון 6–10 — נשמרים, פחות דחוף |
| B-05 | In Research | Research Agent | מחקר מעמיק פעיל |
| B-06 | Ready to Send | Yoni (Human) | ממתין לאישור יוני — מיילים ו-follow-ups |
| B-07 | Sent | Follow-up Agent | נשלח, ממתין לתגובה |
| B-08 | Replied | Yoni (Human) | חזרה — יוני מטפל |
| B-09 | Follow-up Sent | Follow-up Agent | Follow-up נשלח, ממתין |
| B-10 | Archive | System | ללא מענה אחרי מקסימום follow-ups / נדחו |

---

## Field Schema

### Base Fields (כל הבורדים)

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `lead_id` | string (UUID) | Auto | — | מזהה ייחודי — נוצר אוטומטית |
| `company_id` | string | ✅ | — | מזהה החברה מ-Cowork |
| `company_name` | string | ✅ | — | שם החברה |
| `website` | string (URL) | ❌ | null | אתר החברה |
| `contact_name` | string | ❌ | null | שם איש קשר ראשי |
| `contact_email` | string (email) | ❌ | null | מייל איש קשר |
| `contact_phone` | string | ❌ | null | טלפון |
| `contact_linkedin` | string (URL) | ❌ | null | LinkedIn של איש הקשר |
| `source` | enum | ✅ | — | `cowork_api` / `cowork_webhook` |
| `cowork_raw_data` | JSON object | ✅ | — | כל הנתונים הגולמיים מ-Cowork |
| `current_board` | string | Auto | — | הבורד הנוכחי |
| `status` | enum | ✅ | `new` | סטטוס בתוך הבורד |
| `assigned_agent` | string | Auto | — | הסוכן האחראי |
| `created_at` | ISO 8601 | Auto | — | זמן יצירת הרשומה |
| `updated_at` | ISO 8601 | Auto | — | זמן עדכון אחרון |

### Stage-Specific Fields

| Field | Board | Type | Description |
|---|---|---|---|
| `scoring_result` | B-02+ | integer (1–10) | ציון שנקבע על ידי Research Agent |
| `scoring_notes` | B-02+ | string | הנמקה לפי קריטריון |
| `research_report` | B-05+ | JSON object | ממצאי המחקר המעמיק לפי מקור |
| `pain_points` | B-05+ | string[] | רשימת כאבים ספציפיים שזוהו |
| `missing_sources` | B-05+ | string[] | מקורות שנכשלו בסריקה |
| `report_url` | B-06+ | string (URL) | קישור לדוח המותאם |
| `landing_page_url` | B-06+ | string (URL) | קישור לעמוד הנחיתה ב-Vercel |
| `landing_page_failed` | B-06+ | boolean | true אם Deploy נכשל |
| `company_slug` | B-06+ | string | slug לעמוד הנחיתה |
| `email_subject` | B-06+ | string | נושא המייל |
| `email_body` | B-06+ | string | גוף המייל |
| `first_email_sent_at` | B-07+ | ISO 8601 | זמן שליחת המייל הראשון |
| `reply_received_at` | B-08 | ISO 8601 | זמן קבלת התגובה |
| `reply_body` | B-08 | string | תוכן המייל שחזר |
| `followup_count` | B-09 | integer | מספר follow-ups שנשלחו |
| `last_followup_at` | B-09 | ISO 8601 | זמן ה-follow-up האחרון |
| `followup_subject` | B-06 | string | נושא ה-follow-up (לאישור) |
| `followup_body` | B-06 | string | גוף ה-follow-up (לאישור) |
| `rejection_reason` | B-10 | string | סיבת ארכיב |

---

## Scoring Criteria

ציון 1–10. **ציון נמוך = עסק לא מושקע = לקוח מועדף.**

| קריטריון | משקל | ציון נמוך (1–3) | ציון בינוני (4–6) | ציון גבוה (7–10) |
|---|---|---|---|---|
| מצב האתר | 30% | לא קיים / ישן / לא מובייל / איטי | קיים אבל לא מתוחזק | מהיר, מעוצב, מובייל-friendly |
| זמני תגובה | 25% | אין טלפון / טופס לא עובד / לא עונים | מגיבים לאט | מגיבים מהר בכל ערוץ |
| ביקורות גוגל | 25% | דירוג < 3.5 / ביקורות שליליות לא מטופלות | דירוג 3.5–4.2 | דירוג > 4.2 + מענה לביקורות |
| נוכחות דיגיטלית | 20% | אין סושיאל / אין Google Business / פרופיל ריק | נוכחות חלקית | נוכחות מלאה ומעודכנת |

**Routing:**
- ציון 1–5 → B-03 (Potentials) — מטרות ראשוניות
- ציון 6–10 → B-04 (High Score) — נשמרים לעתיד

---

## Steps

### שלב 1 — משיכת נתונים מ-Cowork

**Trigger A (Time):**
1. Cron job מופעל ב-08:00 IL
2. שולח `GET` ל-Cowork API עם פרמטר `since: last_run_timestamp`
3. מושך חברות ואנשי קשר חדשים

**Trigger B (Webhook):**
1. Cowork שולח `POST` ל-`/api/v1/webhook/cowork`
2. Payload מכיל נתוני חברה + איש קשר

**עבור כל רשומה שנמשכה:**

| Step | Action | On Failure |
|---|---|---|
| 1.1 | בדוק כפילות לפי `company_id` — אם קיים → דלג | — |
| 1.2 | צור record חדש ב-B-01 עם `status: "new"` | Retry 3×, התראה ל-יוני |
| 1.3 | שמור `cowork_raw_data` מלא ב-record | Retry 3× |

**Constraints:**
- MUST NOT ליצור record אם `company_id` כבר קיים במערכת
- MUST שמור `source` כדי לדעת מאיפה הגיעה הרשומה

---

### שלב 2 — Scoring

**Trigger:** Research Agent קורא כל record ב-B-01 עם `status: "new"` → מעביר ל-B-02, `status: "scoring"`.

| Step | Action | On Failure |
|---|---|---|
| 2.1 | סרוק אתר (`website`) — מהירות, עיצוב, מובייל | סמן `website_scan_failed` |
| 2.2 | סרוק Google Business — דירוג, ביקורות, מענה | סמן `google_scan_failed` |
| 2.3 | בדוק ערוצי יצירת קשר — טלפון, טופס, WhatsApp | סמן `contact_scan_failed` |
| 2.4 | בדוק נוכחות סושיאל — Facebook, Instagram, LinkedIn | סמן `social_scan_failed` |
| 2.5 | חשב ציון 1–10 לפי הקריטריונים + כתוב `scoring_notes` | אם אין מספיק מידע → `status: "insufficient_data"` → נשאר ב-B-01 |
| 2.6 | שמור `scoring_result` + `scoring_notes` ב-record | Retry 3× |
| 2.7 | ציון 1–5 → העבר ל-B-03. ציון 6–10 → העבר ל-B-04 | Retry 2×, התראה |

---

### שלב 3 — מחקר מעמיק

**Trigger:** Research Agent קורא records ב-B-03 עם `status: "potential"` → מעביר ל-B-05, `status: "in_research"`.

| מקור | מה מחפשים | Output Field |
|---|---|---|
| LinkedIn (חברה) | גודל, ענף, פוסטים אחרונים, engagement | `research_report.linkedin` |
| אתר החברה | גיל, טכנולוגיה, UX, copywriting, תמונות | `research_report.website` |
| Google Reviews | ביקורות שליליות, נושאים חוזרים, תשובות | `research_report.google_reviews` |
| Google Business | שלמות פרופיל, שעות, תמונות, Q&A | `research_report.google_business` |
| גוגל (חדשות) | אזכורים, כתבות, כשלונות ציבוריים | `research_report.news` |

**Output:** `research_report` (JSON) + `pain_points` (מערך של 3–7 כאבים ספציפיים).

**Constraint:** MUST זהה לפחות 3 `pain_points` לפני המשך. אם פחות — `status: "research_incomplete"`, סמן לבדיקה ידנית.

---

### שלב 4 — יצירת תוצרים (מקביל)

שתי זרועות רצות בו-זמנית אחרי שלב 3.

#### 4א — דוח מותאם אישית

**Action:** הסוכן מייצר דוח HTML/PDF הכולל:
- שם החברה + לוגו (אם נמצא)
- סיכום מצב העסק הנוכחי
- 3–5 כאבים ספציפיים שזוהו עם דוגמאות
- המלצות לשיפור (ללא תמחור)
- Branded עם לוגו יוני אוטומציה + `yoniautomation@gmail.com`

**Output:** `report_url` — קישור לדוח.

#### 4ב — עמוד נחיתה

**Action:** הסוכן מייצר קובץ HTML מותאם לחברה:
- כותרת עם שם החברה
- הצעת ערך ספציפית לכאבים שזוהו
- קישור לדוח (`report_url`)
- CTA: "בואו נדבר — 15 דקות"

**Action:** `POST` ל-Vercel API → Deploy ל-`/leads/{company_slug}`.

**Output:** `landing_page_url`.

**On Failure (4ב):** Retry 2× → אם נכשל → `landing_page_failed: true` → ממשיך ללא עמוד נחיתה.

**Constraint:** MUST NOT להמשין לשלב 5 לפני ששתי הזרועות סיימו (או נכשלו ותועדו).

---

### שלב 5 — כתיבת מייל

**Action:** הסוכן כותב מייל בעברית מבוסס על `pain_points`, `report_url`, `landing_page_url`.

| חלק | הנחיה |
|---|---|
| `email_subject` | ספציפי לכאב הגדול ביותר שזוהה — לא גנרי |
| פתיח | אזכור ספציפי של החברה — משהו שמראה שעשינו שיעורי בית |
| גוף | 2–3 כאבים ספציפיים + מה יוני יכול לתרום |
| קישורים | `landing_page_url` ראשון, `report_url` שני |
| סגירה | CTA: שיחת 15 דקות — לא לחץ, הצעה |
| חתימה | יוני אלוני · יוני אוטומציה · yoniautomation@gmail.com |

**Constraint:**
- MUST NOT להשתמש בשפה גנרית — כל מייל חייב להכיל לפחות 2 פרטים ספציפיים על החברה
- MUST שמור `email_subject` + `email_body` ב-record לפני המעבר לשלב 6

---

### שלב 6 — אישור אנושי

**Action:** Record עובר ל-B-06 עם `status: "awaiting_approval"`.

**מה יוני רואה ב-B-06 לכל רשומה:**
- שם החברה + ציון
- תקציר `pain_points`
- תצוגה מקדימה של `email_subject` + `email_body`
- קישורים: `report_url` + `landing_page_url`

**יוני משנה `status` ל:**

| סטטוס | תוצאה |
|---|---|
| `approved` | הסוכן שולח מיידית (שלב 7) |
| `rejected` | Record עובר ל-B-10 עם `rejection_reason` |
| `edit_required` | יוני עורך ידנית → לאחר מכן משנה ל-`approved` |

**Constraint:** MUST NOT לשלוח מייל ללא `status: "approved"` מפורש. אין חריגים.

---

### שלב 7 — שליחת מייל

**Action:** הסוכן מזהה records עם `status: "approved"` ב-B-06.

| Step | Action | On Failure |
|---|---|---|
| 7.1 | שלח מייל מ-`yoniautomation@gmail.com` דרך Gmail API | Retry 3× עם 2 דקות המתנה |
| 7.2 | שמור `first_email_sent_at` ב-record | Retry 3× |
| 7.3 | העבר record ל-B-07 עם `status: "sent"` | Retry 2× |

**On Failure (לאחר 3 retries):** `status: "send_failed"` → התראה ל-יוני → STOP.

**Constraint:** MUST NOT לשלוח אם `first_email_sent_at` כבר מאוכלס (מניעת כפילות).

---

### שלב 8 — מעקב חכם

**Trigger:** Cron job — 08:00 / 13:00 / 18:00 שעון ישראל.

**Action:** Follow-up Agent בודק Gmail inbox לכל reply על מיילים מ-B-07 ו-B-09.

#### מסלול א — חזר מייל ✅

| Step | Action |
|---|---|
| 8א.1 | שמור `reply_received_at` + `reply_body` ב-record |
| 8א.2 | בדוק אם זה auto-reply — אם כן, אל תעביר ל-B-08, המתן |
| 8א.3 | העבר record ל-B-08 עם `status: "replied"` |
| 8א.4 | שלח התראה ל-יוני |

**מה יוני רואה ב-B-08:** קליק על הרשומה פותח `reply_body` המלא.

#### מסלול ב — לא חזר תוך 72 שעות ❌

| Step | Action | On Failure |
|---|---|---|
| 8ב.1 | בדוק אם עברו 72 שעות מאז `first_email_sent_at` או `last_followup_at` | — |
| 8ב.2 | אם `followup_count` ≥ 3 → `status: "exhausted"` → B-10 | — |
| 8ב.3 | כתוב follow-up מותאם (שונה מהמייל הראשון) | — |
| 8ב.4 | שמור `followup_subject` + `followup_body` ב-record | Retry 3× |
| 8ב.5 | העבר ל-B-06 עם `status: "awaiting_followup_approval"` | Retry 2× |

**יוני מאשר ב-B-06:**

| סטטוס | תוצאה |
|---|---|
| `approved` | הסוכן שולח Follow-up, מעדכן `followup_count` + `last_followup_at`, מעביר ל-B-09 |
| `rejected` | Record עובר ל-B-10 |

**Constraint:** MUST NOT לשלוח follow-up לפני 72 שעות מהמייל הקודם.
**Constraint:** MUST NOT לשלוח follow-up ללא `status: "approved"` מפורש.

---

## Error Handling

| שגיאה | תנאי | פעולה | Retry | Escalate |
|---|---|---|---|---|
| Cowork API down | HTTP 5xx | המתן 5 דקות | 3× | התראה ל-יוני |
| Cowork Webhook כפול | `company_id` קיים | דלג, לא יוצר record | לא | — |
| ציון לא ניתן לחישוב | חסר מידע בסיסי | `insufficient_data`, נשאר ב-B-01 | לא | — |
| פחות מ-3 pain points | מחקר דליל | `research_incomplete`, ממתין לבדיקה | לא | — |
| Vercel deploy נכשל | HTTP error | `landing_page_failed: true`, ממשיך | 2× | מסמן ב-record |
| Gmail send נכשל | SMTP/API error | `status: "send_failed"` | 3× | התראה ל-יוני |
| Reply מזוהה כ-auto-reply | גוף מכיל "auto-reply" / "out of office" | לא מעביר ל-B-08, ממתין | — | — |
| Agent crash באמצע עיבוד | record עם `status: "in_research"` / `"scoring"` | בהפעלה מחדש: ממשיך מאותו record | — | — |
| Gmail rate limit | 500 מיילים/יום | עצור שליחות, המשך למחרת | — | התראה ל-יוני |

---

## Expected Output

על כל חברה שעוברת את התהליך המלא:

- ✅ Record מלא ב-board הנכון עם כל השדות מאוכלסים
- ✅ `scoring_result` + `scoring_notes` על כל חברה
- ✅ `research_report` + `pain_points` על כל חברה ב-B-03
- ✅ דוח מותאם אישית נגיש ב-`report_url`
- ✅ עמוד נחיתה live ב-Vercel תחת `/leads/{company_slug}` (אם Deploy הצליח)
- ✅ מייל נשלח רק לאחר `status: "approved"` מפורש
- ✅ Follow-up נשלח רק לאחר `status: "approved"` מפורש
- ✅ כל reply מתועד עם `reply_received_at` + `reply_body` מלא

---

## Success Criteria

- אין מייל שנשלח ללא `status: "approved"` — אפס חריגים
- אין כפילויות — אותה חברה לפי `company_id` לא מופיעה פעמיים
- כל record עם `status: "sent"` מכיל `first_email_sent_at`
- Follow-up לא נשלח לפני 72 שעות מהמייל הקודם — אפס חריגים
- יוני יכול לראות בלחיצה אחת: מה נשלח, לאיזו חברה, מתי, ומה התגובה
- כל agent crash מתאושש אוטומטית ללא אובדן נתונים

---

## Notes & Edge Cases

- עמוד נחיתה ב-Vercel נשאר live אחרי השליחה — לשקול מחיקה אוטומטית אחרי 90 יום
- אם חברה ב-B-04 (High Score) מצבה מתדרדר בעתיד — ניתן להעביר ידנית ל-B-03
- Gmail API מגביל 500 מיילים ביום — אם הנפח גדל, לשקול Google Workspace
- Follow-up חייב להיות שונה תוכנית מהמייל הראשון — MUST NOT copy-paste
- אם `contact_email` חסר ב-Cowork — record נכנס למערכת אך לא יכול להתקדם מעבר ל-B-03 ללא התערבות ידנית

---

## Open Questions

| # | שאלה | השפעה |
|---|---|---|
| 1 | מה ה-endpoint המדויק של Cowork API + פורמט ה-payload שלהם? | גבוהה — תלוי בזה שלב 1 כולו |
| 2 | איזה שדות Cowork מחזיר על חברה / איש קשר? | גבוהה — קובע את ה-schema |
| 3 | מה ה-Vercel project name + דומיין סופי? | בינונית — ניתן לחבר אחר כך |
| 4 | מה פורמט הדוח המועדף — PDF או עמוד HTML נפרד? | בינונית |
| 5 | כמה חברות צפויות להיכנס ביום? (משפיע על rate limiting) | בינונית |

---

*Version 1.0 · יוני אלוני | אוטומציה עסקית · 2025-05-04*
