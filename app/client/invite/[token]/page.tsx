"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/Card";
import { Input } from "../../../../components/ui/Input";
import { Button } from "../../../../components/ui/Button";
import { useClientAuth } from "../../../../components/client/ClientAuthProvider";
import { LoginResponse } from "../../../../lib/client-api";

type ClientInviteDetails = {
  clientName: string;
  agencyName: string;
  email: string;
  expiresAt: string;
};

type InviteStatus = "loading" | "ready" | "invalid" | "expired" | "used" | "error";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function ClientInvitePage() {
  const params = useParams<{ token?: string | string[] }>();
  const token =
    typeof params?.token === "string" ? params.token : Array.isArray(params?.token) ? params.token[0] : undefined;
  const router = useRouter();
  const { setSessionFromResponse, isClient, loading: authLoading } = useClientAuth();

  const [invite, setInvite] = useState<ClientInviteDetails | null>(null);
  const [status, setStatus] = useState<InviteStatus>("loading");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [existingUserEmail, setExistingUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isClient) {
      router.replace("/client");
    }
  }, [authLoading, isClient, router]);

  useEffect(() => {
    let cancelled = false;
    const loadInvite = async () => {
      if (!token) {
        setStatus("invalid");
        return;
      }
      setStatus("loading");
      setInvite(null);
      try {
        const res = await fetch(`${API_URL}/client/invites/${token}`);
        if (!res.ok) {
          if (cancelled) return;
          if (res.status === 404) setStatus("invalid");
          else if (res.status === 410) setStatus("expired");
          else if (res.status === 409) setStatus("used");
          else setStatus("error");
          return;
        }
        const data = (await res.json()) as ClientInviteDetails;
        if (!cancelled) {
          setInvite(data);
          setStatus("ready");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
        }
      }
    };

    loadInvite();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const expiresLabel = useMemo(() => {
    if (!invite?.expiresAt) return null;
    try {
      return new Date(invite.expiresAt).toLocaleString("ru-RU");
    } catch {
      return invite.expiresAt;
    }
  }, [invite?.expiresAt]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status !== "ready") return;
    if (!password || password.length < 6) {
      setError("Придумайте пароль не короче 6 символов.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Пароли не совпадают.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/client/invite/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          fullName: fullName.trim() || undefined,
        }),
      });

      const data = (await res.json().catch(() => null)) as LoginResponse | { message?: string } | null;

      if (!res.ok) {
        if (res.status === 404) {
          setStatus("invalid");
        } else if (res.status === 410) {
          setStatus("expired");
        } else if (res.status === 409) {
          const msg = (data as any)?.message as string | undefined;
          if (msg && msg.toLowerCase().includes("used")) {
            setStatus("used");
          } else {
            setError("Пользователь с таким email уже существует.");
            setExistingUserEmail(invite?.email ?? null);
          }
        } else {
          setError((data as any)?.message ?? "Не удалось принять приглашение.");
        }
        return;
      }

      setSessionFromResponse(data as LoginResponse);
      router.replace("/client");
    } catch (err) {
      setError("Не удалось принять приглашение. Попробуйте позже.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderState = () => {
    if (status === "loading") {
      return <div className="text-sm text-slate-600">Проверяем приглашение...</div>;
    }

    if (status === "invalid") {
      return <div className="text-sm text-red-600">Приглашение не найдено или ссылка некорректна.</div>;
    }

    if (status === "expired") {
      return <div className="text-sm text-amber-700">Срок действия приглашения истек. Попросите менеджера выслать новую ссылку.</div>;
    }

    if (status === "used") {
      return <div className="text-sm text-slate-700">Эта ссылка уже использована. Попробуйте войти в кабинет или запросите новое приглашение.</div>;
    }

    if (status === "error") {
      return <div className="text-sm text-red-600">Не удалось загрузить приглашение. Попробуйте обновить страницу.</div>;
    }

    if (!invite) return null;

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700 space-y-1">
          <div className="font-medium text-slate-900">{invite.clientName}</div>
          <div className="text-slate-600">Агентство: {invite.agencyName}</div>
          <div className="text-slate-600">Email для входа: {invite.email}</div>
          {expiresLabel && <div className="text-xs text-slate-500">Ссылка активна до {expiresLabel}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ваше имя (необязательно)</label>
          <Input
            type="text"
            placeholder="Алексей Смирнов"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Пароль для входа</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Подтвердите пароль</label>
          <Input
            type="password"
            placeholder="Повторите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
        {existingUserEmail && (
          <div className="flex items-center gap-2 text-sm">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.replace(`/client/login?email=${encodeURIComponent(existingUserEmail)}`)}
            >
              Войти с этим email
            </Button>
            <span className="text-slate-500">или введите другой email у менеджера.</span>
          </div>
        )}

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Подтверждаем..." : "Принять приглашение и войти"}
        </Button>
      </form>
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 flex items-center justify-center">
      <div className="max-w-xl w-full">
        <Card className="p-6 shadow-md">
          <CardHeader className="mb-4 space-y-2">
            <CardTitle className="text-xl">Приглашение в клиентский кабинет</CardTitle>
            <p className="text-sm text-slate-600">
              Установите пароль, чтобы получить доступ к опубликованным отчетам по вашему проекту.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">{renderState()}</CardContent>
        </Card>
      </div>
    </main>
  );
}
