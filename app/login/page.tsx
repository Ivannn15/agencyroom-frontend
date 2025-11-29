"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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
    } catch (err) {
      setError("Неверный email или пароль");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-2xl p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold mb-1">Вход в AgencyRoom</h1>
          <p className="text-sm text-slate-500">
            Клиентский кабинет и отчеты для performance-агентств.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@agency.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Пароль
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-sky-600 text-white text-sm font-medium py-2.5 hover:bg-sky-700 disabled:opacity-60"
          >
            {isSubmitting ? "Входим..." : "Войти"}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-500">
          Еще нет аккаунта?{" "}
          <span className="text-sky-600">Регистрация появится позже</span>
        </div>
      </div>
    </main>
  );
}
