"use client";

import { useClientAuth } from "./ClientAuthProvider";
import { Button } from "../ui/Button";

export function ClientHeader() {
  const { user, agency, logout } = useClientAuth();

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 font-semibold">
            AR
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Client Portal</div>
            <div className="text-xs text-slate-500">{agency?.name || "AgencyRoom"}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden text-right md:block">
            <div className="text-sm font-medium text-slate-900">{user?.name || user?.email}</div>
            <div className="text-xs text-slate-500">
              {agency?.currency ? `Валюта: ${agency.currency}` : "Клиент"}
            </div>
          </div>
          <Button variant="outline" onClick={logout}>
            Выйти
          </Button>
        </div>
      </div>
    </header>
  );
}
