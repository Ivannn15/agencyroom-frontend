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
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
      <div className="space-y-1 mb-2">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
          Создание клиента
        </h1>
        <p className="text-sm text-slate-500">
          Основные данные клиента для ведения проектов и отчетов.
        </p>
      </div>

      <Card>
        <CardTitle className="mb-3">Данные клиента</CardTitle>
        <CardContent>
          <form action={handleAction} className="space-y-5 max-w-xl">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Имя контакта
                </label>
                <Input
                  name="name"
                  placeholder="Например, Иван Петров"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Компания
                </label>
                <Input name="company" placeholder="ООО Ромашка" />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  placeholder="client@example.com"
                  required
                />
              </div>
              <p className="text-xs text-slate-500">
                Контактные данные используются только для работы с отчетами и не передаются третьим лицам.
              </p>
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
