"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardTitle } from "../../../../components/ui/Card";
import { Input } from "../../../../components/ui/Input";
import { Button } from "../../../../components/ui/Button";

type ClientsNewFormProps = {
  createClient: (formData: FormData) => Promise<void>;
};

export default function ClientsNewForm({ createClient }: ClientsNewFormProps) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAction = async (formData: FormData) => {
    setError("");
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();

    if (!name || !email) {
      setError("Укажите имя клиента и email");
      return;
    }

    startTransition(async () => {
      try {
        await createClient(formData);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Ошибка сохранения";
        setError(message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Новый клиент</h1>
      </div>

      <Card>
        <CardTitle className="mb-3">Данные клиента</CardTitle>
        <CardContent>
          <form action={handleAction} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Имя клиента
              </label>
              <Input name="name" placeholder="Анна" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Компания
              </label>
              <Input name="company" placeholder="Acme Store" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                name="email"
                placeholder="client@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Button type="submit" variant="primary" disabled={isPending}>
                {isPending ? "Сохранение…" : "Сохранить клиента"}
              </Button>
              {error && <div className="text-xs text-red-600">{error}</div>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
