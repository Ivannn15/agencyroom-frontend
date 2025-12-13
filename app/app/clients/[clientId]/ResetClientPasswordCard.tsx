"use client";

import { useState } from "react";
import { useAdminAuth } from "../../../../components/admin/AdminAuthProvider";
import { Card, CardTitle } from "../../../../components/ui/Card";
import { Input } from "../../../../components/ui/Input";
import { Button } from "../../../../components/ui/Button";
import { resetClientPassword } from "../../../../lib/admin-api";

type Props = {
  clientId: string;
  email?: string | null;
};

export default function ResetClientPasswordCard({ clientId, email }: Props) {
  const { token } = useAdminAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!password || password.length < 6) {
      setError("Пароль должен быть не короче 6 символов.");
      return;
    }

    if (!token) {
      setError("Нет активной сессии администратора.");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetClientPassword(token, clientId, password);
      setSuccess("Пароль сброшен. Передайте новый пароль клиенту.");
      setPassword("");
    } catch (err: any) {
      const message = err?.message || "Не удалось сбросить пароль.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4 space-y-3">
      <CardTitle>Сброс пароля клиента</CardTitle>
      <p className="text-sm text-slate-600">
        Установите новый пароль для клиентского пользователя{email ? ` (${email})` : ""}. После сохранения передайте
        пароль клиенту.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Новый пароль</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Не менее 6 символов"
          />
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        {success && <div className="text-sm text-green-700">{success}</div>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Сохраняем…" : "Сбросить пароль"}
        </Button>
      </form>
    </Card>
  );
}
