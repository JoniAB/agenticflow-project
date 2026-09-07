export type Role = "committee" | "admin";

export interface AppUser {
  id: string;
  name: string;
  role: Role;
}

export interface Balance {
  amount: number;
  lastUpdated: string; // ISO date
}

export interface Category {
  id: string;
  name: string;
  totalSpent: number;
}

export interface PaymentRecord {
  id: string;
  date: string; // ISO date
  amount: number;
  note: string;
}

export type ApartmentStatus = "שולם" | "חוב";

export interface Apartment {
  id: number; // 1-50
  residentName: string;
  phone: string;
  email: string;
  status: ApartmentStatus;
  debtAmount: number;
  paymentHistory: PaymentRecord[];
}
