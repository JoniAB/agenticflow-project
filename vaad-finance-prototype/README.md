# שקיפות כספית לוועד בית — פרוטוטייפ

פרוטוטייפ React (Vite + TypeScript + Tailwind) המדגים את ה-UX וזרימת ההרשאות של
מערכת שקיפות כספית לוועד בית, לפני חיבור ל-Supabase אמיתי. הנתונים נשמרים באופן
זמני ב-`localStorage` של הדפדפן (לא בשרת).

## הרצה מקומית

```bash
npm install
npm run dev
```

## מה יש כאן

- **דף כניסה** עם רשימת חשבונות קבועים מראש — כל חשבון נושא תפקיד קבוע
  (ועד בית / אדמין), ללא בחירת תפקיד חופשית בזמן ריצה.
- **יתרת קופה** — תצוגה + עדכון (ועד/אדמין).
- **הוצאות לפי קטגוריה** — עמודות יחסיות לסכום, עדכון סכום (ועד/אדמין),
  הוספה/הסרה של קטגוריה (אדמין בלבד).
- **טבלת 50 דירות** עם accordion להיסטוריית תשלומים מלאה, הוספת תשלום
  שמעדכנת אוטומטית סטטוס/חוב (ועד/אדמין), ועריכת פרטי דייר / הוספה-הסרה
  של דירה (אדמין בלבד).

## מבנה קוד

```
src/
├── types/           טיפוסי TypeScript לפי מודל הנתונים באיפיון
├── data/seed.ts      נתוני דמו (50 דירות, קטגוריות ברירת מחדל, משתמשים)
├── context/          AuthContext (הרשאות) + AppDataContext (state + localStorage)
└── components/       Login, Dashboard, BalanceHeader, CategoriesSection,
                      ApartmentsTable, ApartmentRow, Modal, TopBar
```

## השלב הבא

חיבור ל-Supabase אמיתי (טבלאות `apartments`, `categories`, `balance`, `payments`,
`users` + Row Level Security לפי תפקיד) ומעבר מ-localStorage לנתונים חיים,
כמתואר באיפיון.
