"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAdminAuth } from "../../components/admin/AdminAuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login, token, user, logout } = useAdminAuth();
  const [email, setEmail] = useState("demo@agency.com");
  const [password, setPassword] = useState("password123");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token && user && user.role !== "client") {
      let cancelled = false;
      const verifySession = async () => {
        // Avoid redirect loop when localStorage has a stale token but the httpOnly cookie expired.
        try {
          const res = await fetch("/api/auth/session");
          if (!res.ok) {
            logout();
            return;
          }
          if (!cancelled) {
            router.replace("/app");
          }
        } catch {
          logout();
        }
      };

      verifySession();
      return () => {
        cancelled = true;
      };
    }
  }, [logout, router, token, user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Введите email и пароль");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login({ email, password });
      if (res.user.role === "client") {
        setError("Этот аккаунт относится к клиентскому кабинету. Войдите через /client/login.");
        return;
      }
      router.replace("/app");
    } catch (err: any) {
      if (err?.message === "client-account") {
        setError("Этот аккаунт относится к клиентскому кабинету. Войдите через /client/login.");
      } else {
        setError("Неверный email или пароль");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <Card className="max-w-md w-full p-8">
        <CardHeader className="mb-6 text-center">
          <CardTitle className="text-2xl mb-1">Вход в AgencyRoom</CardTitle>
          <p className="text-sm text-slate-500">
            Админка агентства. Клиенты авторизуются через /client/login.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@agency.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Пароль
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Входим..." : "Войти"}
            </Button>
          </form>

          <div className="mt-4 text-center text-xs text-slate-500 space-y-1">
            <div>
              Клиент?{" "}
              <Link href="/client/login" className="text-sky-600 hover:text-sky-700">
                Перейти в клиентский кабинет
              </Link>
            </div>
            <div>Демо: demo@agency.com / password123</div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
