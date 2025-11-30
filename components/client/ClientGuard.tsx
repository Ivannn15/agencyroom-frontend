"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useClientAuth } from "./ClientAuthProvider";
import { Button } from "../ui/Button";

export function ClientGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { loading, token, user, isClient, logout } = useClientAuth();

  useEffect(() => {
    if (!loading && !token) {
      router.replace("/client/login");
    }
  }, [loading, token, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
        Загружаем кабинет...
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
        Перенаправляем в форму входа...
      </div>
    );
  }

  if (!isClient || !user?.clientId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center">
        <div className="text-lg font-semibold text-slate-900">Этот кабинет только для клиентов</div>
        <p className="text-sm text-slate-600 max-w-sm">
          Похоже, вы вошли под аккаунтом для админки или без привязки к клиенту. Выйдите и используйте клиентский доступ.
        </p>
        <Button onClick={logout}>Выйти</Button>
      </div>
    );
  }

  return <>{children}</>;
}
