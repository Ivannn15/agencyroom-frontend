"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { useClientAuth } from "../../../components/client/ClientAuthProvider";

export default function ClientLoginPage() {
  const router = useRouter();
  const { login, isClient, loading } = useClientAuth();
  const search = useSearchParams();
  const prefillEmail = useMemo(() => search.get("email") || "client@alpharetail.com", [search]);
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isClient) {
      router.replace("/client");
    }
  }, [isClient, loading, router]);

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
      if (res.user.role !== "client") {
        setError("Этот аккаунт относится к админской панели. Используйте клиентский логин.");
        return;
      }
      router.replace("/client");
    } catch (err: any) {
      if (err?.message === "not-client") {
        setError("Этот аккаунт относится к админской панели. Используйте клиентский доступ.");
      } else if (err?.message === "unauthorized") {
        setError("Неверный email или пароль");
      } else {
        setError("Не удалось войти. Попробуйте еще раз.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <Card className="max-w-md w-full p-8 shadow-sm border border-slate-100">
        <CardHeader className="mb-6 text-center space-y-2">
          <CardTitle className="text-2xl">Вход для клиентов</CardTitle>
          <p className="text-sm text-slate-500">
            Авторизуйтесь, чтобы увидеть опубликованные отчеты вашего бизнеса.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Пароль</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Входим..." : "Войти в кабинет"}
            </Button>
          </form>
          <div className="mt-4 text-center text-xs text-slate-500">
            Демо: client@alpharetail.com / password123
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
