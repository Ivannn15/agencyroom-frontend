"use client";

import { ClientGuard } from "../../../components/client/ClientGuard";
import { ClientHeader } from "../../../components/client/ClientHeader";

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <ClientHeader />
      <ClientGuard>
        <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
          {children}
        </main>
      </ClientGuard>
    </div>
  );
}
