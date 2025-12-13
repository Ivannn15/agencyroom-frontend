"use client";

import { FormEvent, useState } from "react";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { useAdminAuth } from "../../../../components/admin/AdminAuthProvider";
import { createClientInvite } from "../../../../lib/admin-api";

export default function InviteClientCard({ clientId, defaultEmail }: { clientId: string; defaultEmail?: string | null }) {
  const { token } = useAdminAuth();
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [expiresInDays, setExpiresInDays] = useState("7");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState<"copy" | "copied">("copy");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setInviteUrl(null);
    setCopyLabel("copy");
    setExpiresAt(null);

    if (!token) {
      setMessage("Нет токена авторизации.");
      return;
    }

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setMessage("Введите email клиента.");
      return;
    }

    const expiresNum = Number(expiresInDays);
    const expiresIn = Number.isFinite(expiresNum) ? expiresNum : undefined;

    setLoading(true);
    try {
      const res = await createClientInvite(token, clientId, {
        email: normalizedEmail,
        expiresInDays: expiresIn,
      });
      setInviteUrl(res.inviteUrl);
      setExpiresAt(res.expiresAt);
      setMessage("Ссылка создана. Отправьте ее клиенту.");
    } catch (err: any) {
      console.error(err);
      if (err?.status === 404) {
        setMessage("Клиент не найден или недоступен.");
      } else {
        setMessage("Не удалось создать приглашение. Попробуйте позже.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopyLabel("copied");
      setTimeout(() => setCopyLabel("copy"), 2000);
    } catch {
      setMessage("Не удалось скопировать ссылку. Скопируйте вручную.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Приглашение клиента</h2>
        <p className="text-xs text-slate-500">
          Сгенерируйте ссылку, чтобы клиент задал пароль и увидел опубликованные отчеты.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Email клиента</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@company.com"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Срок действия (дней)</label>
            <Input
              type="number"
              min={1}
              max={60}
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Создаем..." : "Сгенерировать приглашение"}
          </Button>
          {message && <span className="text-xs text-slate-600">{message}</span>}
        </div>
      </form>

      {inviteUrl && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
          <div className="text-xs font-medium text-slate-600">Ссылка приглашения</div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-slate-800 break-all">{inviteUrl}</div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={handleCopy}>
                {copyLabel === "copied" ? "Скопировано" : "Скопировать"}
              </Button>
              {expiresAt && (
                <span className="text-[11px] text-slate-500">
                  Действительно до {new Date(expiresAt).toLocaleString("ru-RU")}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
