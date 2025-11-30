"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "./AdminAuthProvider";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { loading, token, user, logout } = useAdminAuth();

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (user?.role === "client") {
      logout();
      router.replace("/client");
    }
  }, [loading, logout, router, token, user?.role]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Загружаем…
      </div>
    );
  }

  if (!token || user?.role === "client") {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Перенаправляем в клиентский кабинет…
      </div>
    );
  }

  return <>{children}</>;
}
