import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { AppUser } from "../types";
import { APP_USERS } from "../data/seed";

const AUTH_STORAGE_KEY = "vaad-finance-current-user-v1";

interface AuthContextValue {
  currentUser: AppUser | null;
  users: AppUser[];
  login: (userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadSavedUser(): AppUser | null {
  const savedId = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!savedId) return null;
  return APP_USERS.find((u) => u.id === savedId) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(loadSavedUser);

  const login = (userId: string) => {
    const user = APP_USERS.find((u) => u.id === userId);
    if (!user) return;
    // Role is fixed per account and cannot be chosen at runtime;
    // selecting the account below is the only degree of freedom.
    setCurrentUser(user);
    localStorage.setItem(AUTH_STORAGE_KEY, user.id);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ currentUser, users: APP_USERS, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
