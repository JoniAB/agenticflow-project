import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Apartment, Balance, Category } from "../types";
import { DEFAULT_BALANCE, DEFAULT_CATEGORIES, generateApartments } from "../data/seed";

const STORAGE_KEY = "vaad-finance-state-v1";

interface PersistedState {
  balance: Balance;
  categories: Category[];
  apartments: Apartment[];
}

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PersistedState;
  } catch {
    // corrupted storage, fall through to fresh seed
  }
  return {
    balance: DEFAULT_BALANCE,
    categories: DEFAULT_CATEGORIES,
    apartments: generateApartments(),
  };
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

interface AppDataContextValue {
  balance: Balance;
  categories: Category[];
  apartments: Apartment[];
  updateBalance: (amount: number) => void;
  updateCategoryAmount: (categoryId: string, amount: number) => void;
  addCategory: (name: string) => void;
  removeCategory: (categoryId: string) => void;
  addPayment: (apartmentId: number, amount: number, date: string, note: string) => void;
  updateResidentInfo: (
    apartmentId: number,
    info: { residentName: string; phone: string; email: string }
  ) => void;
  addApartment: () => void;
  removeApartment: (apartmentId: number) => void;
  resetDemoData: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(loadInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateBalance = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      balance: { amount, lastUpdated: todayIso() },
    }));
  }, []);

  const updateCategoryAmount = useCallback((categoryId: string, amount: number) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === categoryId ? { ...c, totalSpent: amount } : c
      ),
    }));
  }, []);

  const addCategory = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        { id: `cat-${Date.now()}`, name, totalSpent: 0 },
      ],
    }));
  }, []);

  const removeCategory = useCallback((categoryId: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== categoryId),
    }));
  }, []);

  const addPayment = useCallback(
    (apartmentId: number, amount: number, date: string, note: string) => {
      setState((prev) => ({
        ...prev,
        apartments: prev.apartments.map((apt) => {
          if (apt.id !== apartmentId) return apt;
          const newHistory = [
            ...apt.paymentHistory,
            { id: `p-${apartmentId}-${Date.now()}`, date, amount, note },
          ].sort((a, b) => (a.date < b.date ? 1 : -1));
          const newDebt = Math.max(0, apt.debtAmount - amount);
          return {
            ...apt,
            paymentHistory: newHistory,
            debtAmount: newDebt,
            status: newDebt <= 0 ? "שולם" : "חוב",
          };
        }),
      }));
    },
    []
  );

  const updateResidentInfo = useCallback(
    (apartmentId: number, info: { residentName: string; phone: string; email: string }) => {
      setState((prev) => ({
        ...prev,
        apartments: prev.apartments.map((apt) =>
          apt.id === apartmentId ? { ...apt, ...info } : apt
        ),
      }));
    },
    []
  );

  const addApartment = useCallback(() => {
    setState((prev) => {
      const nextId = prev.apartments.length
        ? Math.max(...prev.apartments.map((a) => a.id)) + 1
        : 1;
      return {
        ...prev,
        apartments: [
          ...prev.apartments,
          {
            id: nextId,
            residentName: "",
            phone: "",
            email: "",
            status: "שולם",
            debtAmount: 0,
            paymentHistory: [],
          },
        ],
      };
    });
  }, []);

  const removeApartment = useCallback((apartmentId: number) => {
    setState((prev) => ({
      ...prev,
      apartments: prev.apartments.filter((a) => a.id !== apartmentId),
    }));
  }, []);

  const resetDemoData = useCallback(() => {
    const fresh = {
      balance: DEFAULT_BALANCE,
      categories: DEFAULT_CATEGORIES,
      apartments: generateApartments(),
    };
    setState(fresh);
  }, []);

  const value = useMemo<AppDataContextValue>(
    () => ({
      balance: state.balance,
      categories: state.categories,
      apartments: state.apartments,
      updateBalance,
      updateCategoryAmount,
      addCategory,
      removeCategory,
      addPayment,
      updateResidentInfo,
      addApartment,
      removeApartment,
      resetDemoData,
    }),
    [
      state,
      updateBalance,
      updateCategoryAmount,
      addCategory,
      removeCategory,
      addPayment,
      updateResidentInfo,
      addApartment,
      removeApartment,
      resetDemoData,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
