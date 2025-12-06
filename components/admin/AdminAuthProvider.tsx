"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Agency, User } from "../../lib/types";
import { LoginPayload, LoginResponse } from "../../lib/client-api";

type AuthState = {
  token: string;
  user: User;
  agency: Agency;
};

type AdminAuthContextValue = {
  loading: boolean;
  token: string | null;
  user: User | null;
  agency: Agency | null;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  logout: () => void;
};

const STORAGE_KEY = "admin_auth_state";

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(true);

  const persistState = useCallback((next: AuthState | null) => {
    if (typeof window === "undefined") return;
    if (next) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AuthState;
        setState(parsed);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // If there's no local state but cookie-based session exists, restore it to avoid flicker on /app.
    if (loading) return;
    if (state) return;
    if (typeof window === "undefined") return;
    if (!window.location.pathname.startsWith("/app")) return;

    let cancelled = false;
    const restore = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/session", { method: "GET" });
        if (!res.ok) return;
        const data = (await res.json()) as LoginResponse;
        const next: AuthState = { token: data.accessToken, user: data.user, agency: data.agency };
        if (!cancelled) {
          setState(next);
          persistState(next);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    restore();
    return () => {
      cancelled = true;
    };
  }, [loading, persistState, state]);

  const logout = useCallback(() => {
    setState(null);
    persistState(null);
    fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/login");
  }, [persistState, router]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = (await res.json()) as LoginResponse;

        if (!res.ok) {
          const message = (data as any)?.message;
          throw new Error(message || "login-failed");
        }

        if (data.user.role === "client") {
          throw new Error("client-account");
        }

        const next: AuthState = { token: data.accessToken, user: data.user, agency: data.agency };
        setState(next);
        persistState(next);
        return data;
      } finally {
        setLoading(false);
      }
    },
    [persistState]
  );

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      loading,
      token: state?.token ?? null,
      user: state?.user ?? null,
      agency: state?.agency ?? null,
      login,
      logout
    }),
    [loading, login, logout, state]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
