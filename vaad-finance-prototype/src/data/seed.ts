import type { Apartment, AppUser, Balance, Category, PaymentRecord } from "../types";

const FIRST_NAMES = [
  "יוסי", "דנה", "משה", "רותם", "אבי", "מיכל", "עידן", "שירה", "רון", "טל",
  "אורית", "גיל", "נועה", "עומר", "ליאת", "אלון", "הדר", "אריאל", "יעל", "דור",
  "שרה", "יעקב", "רבקה", "דוד", "רחל", "בני", "אסתר", "צבי", "חנה", "שמעון",
  "מירי", "אלי", "תמר", "גדעון", "אפרת", "נדב", "קרן", "עידו", "מאיה", "רועי",
  "אביגיל", "יונתן", "שני", "אורי", "נטע", "אמיר", "ליאור", "שלומית", "בועז", "אנה",
];

const LAST_NAMES = [
  "כהן", "לוי", "מזרחי", "פרץ", "ביטון", "אברהם", "פרידמן", "אזולאי", "דהן", "חדד",
  "וייס", "גבאי", "עמר", "מלכה", "בן דוד", "שפירא", "רוזן", "אוחיון", "טל", "נחום",
];

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function formatPhone(rand: () => number) {
  const num = Math.floor(rand() * 9000000) + 1000000;
  return `050-${num}`;
}

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function buildHistory(apartmentId: number, rand: () => number): { history: PaymentRecord[]; debt: number } {
  const history: PaymentRecord[] = [];
  const monthlyFee = 350;
  const numPayments = 2 + Math.floor(rand() * 4);
  let daysAgo = 170;

  for (let i = 0; i < numPayments; i++) {
    daysAgo -= Math.floor(rand() * 30) + 15;
    if (daysAgo < 0) break;
    history.push({
      id: `p-${apartmentId}-${i}`,
      date: isoDaysAgo(daysAgo),
      amount: monthlyFee,
      note: i === 0 ? "ועד בית - תשלום חודשי" : "ועד בית",
    });
  }

  const owesDebt = rand() < 0.28;
  const debt = owesDebt ? Math.round((Math.floor(rand() * 3) + 1) * monthlyFee) : 0;

  return { history, debt };
}

export function generateApartments(): Apartment[] {
  const apartments: Apartment[] = [];
  for (let id = 1; id <= 50; id++) {
    const rand = seededRandom(id * 7919 + 13);
    const first = FIRST_NAMES[id % FIRST_NAMES.length];
    const last = LAST_NAMES[(id * 3) % LAST_NAMES.length];
    const residentName = `${first} ${last}`;
    const { history, debt } = buildHistory(id, rand);

    apartments.push({
      id,
      residentName,
      phone: formatPhone(rand),
      email: `${first}.${last}${id}@example.com`.replace(/\s/g, ""),
      status: debt > 0 ? "חוב" : "שולם",
      debtAmount: debt,
      paymentHistory: history,
    });
  }
  return apartments;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "insurance", name: "ביטוחים", totalSpent: 3200 },
  { id: "fixed", name: "תשלומים קבועים", totalSpent: 5400 },
  { id: "repairs", name: "תיקונים ותחזוקה", totalSpent: 1800 },
  { id: "gardening", name: "גינון", totalSpent: 900 },
  { id: "other", name: "אחר", totalSpent: 450 },
];

export const DEFAULT_BALANCE: Balance = {
  amount: 42300,
  lastUpdated: isoDaysAgo(2),
};

export const APP_USERS: AppUser[] = [
  { id: "u-committee-1", name: "דנה כהן (ועד בית)", role: "committee" },
  { id: "u-committee-2", name: "אבי לוי (ועד בית)", role: "committee" },
  { id: "u-admin-1", name: "יוני אלוני (אדמין)", role: "admin" },
];
