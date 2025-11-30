"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Agency, User } from "../../lib/types";
import { loginRequest, LoginPayload, LoginResponse } from "../../lib/client-api";

type AuthState = {
  token: string;
  user: User;
  agency: Agency;
};

type ClientAuthContextValue = {
  loading: boolean;
  token: string | null;
  user: User | null;
  agency: Agency | null;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  logout: () => void;
  isClient: boolean;
};

const STORAGE_KEY = "client_auth_state";

const ClientAuthContext = createContext<ClientAuthContextValue | undefined>(undefined);

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(true);

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

  const persistState = useCallback((next: AuthState | null) => {
    if (typeof window === "undefined") return;
    if (next) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const logout = useCallback(() => {
    setState(null);
    persistState(null);
    router.push("/client/login");
  }, [persistState, router]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setLoading(true);
      try {
        const res = await loginRequest(payload);
        if (res.user.role !== "client") {
          throw new Error("not-client");
        }
        const nextState: AuthState = {
          token: res.accessToken,
          user: res.user,
          agency: res.agency,
        };
        setState(nextState);
        persistState(nextState);
        return res;
      } finally {
        setLoading(false);
      }
    },
    [persistState]
  );

  const value = useMemo<ClientAuthContextValue>(
    () => ({
      loading,
      token: state?.token ?? null,
      user: state?.user ?? null,
      agency: state?.agency ?? null,
      login,
      logout,
      isClient: !!state?.user && state.user.role === "client",
    }),
    [loading, login, logout, state]
  );

  return <ClientAuthContext.Provider value={value}>{children}</ClientAuthContext.Provider>;
}

export function useClientAuth() {
  const ctx = useContext(ClientAuthContext);
  if (!ctx) {
    throw new Error("useClientAuth must be used within ClientAuthProvider");
  }
  return ctx;
}
