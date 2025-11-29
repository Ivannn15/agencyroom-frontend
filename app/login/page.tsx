"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Введите email и пароль");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: заменить на реальный вызов API /auth/login
      console.log("Login with", { email, password });
      // фейковая задержка, чтобы было ощущение загрузки
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push("/app");
    } catch {
      setError("Неверный email или пароль");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8">
        <CardHeader className="mb-6 text-center">
          <CardTitle className="text-2xl mb-1">Вход в AgencyRoom</CardTitle>
          <p className="text-sm text-slate-500">
            Клиентский кабинет и отчеты для performance-агентств.
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

          <div className="mt-4 text-center text-xs text-slate-500">
            Еще нет аккаунта?{" "}
            <span className="text-sky-600">Регистрация появится позже</span>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
