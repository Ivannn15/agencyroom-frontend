"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { AdminAuthProvider } from "./AdminAuthProvider";
import { AdminGuard } from "./AdminGuard";

const navItems = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/clients", label: "Clients" },
  { href: "/app/projects", label: "Projects" },
  { href: "/app/reports", label: "Reports" },
  { href: "/app/settings", label: "Settings" }
];

export default function AdminAppShell({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminGuard>
        <div className="min-h-screen bg-slate-50 flex">
          <aside className="w-64 bg-white border-r flex flex-col">
            <div className="h-14 border-b flex items-center px-4 font-semibold text-slate-900">
              AgencyRoom
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="px-4 py-3 border-t text-xs text-slate-400">v0.1 · internal</div>
          </aside>

          <div className="flex-1 flex flex-col">
            <header className="h-14 bg-white border-b flex items-center justify-between px-6">
              <div className="text-sm text-slate-500">Agency dashboard</div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-500">Аккаунт агентства</span>
                <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-semibold">
                  AR
                </div>
              </div>
            </header>

            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </AdminGuard>
    </AdminAuthProvider>
  );
}
