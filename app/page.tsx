"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-2xl p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">AgencyRoom</h1>
        <p className="text-sm text-slate-500 mb-6">
          Клиентский кабинет и отчеты для performance-агентств.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-700"
        >
          Перейти к входу
        </Link>
      </div>
    </main>
  );
}
