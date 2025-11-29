"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardTitle } from "../../../../components/ui/Card";
import { Input } from "../../../../components/ui/Input";
import { Button } from "../../../../components/ui/Button";

const statusOptions = [
  { value: "active", label: "Активный" },
  { value: "paused", label: "Пауза" },
  { value: "completed", label: "Завершен" },
] as const;

type Status = (typeof statusOptions)[number]["value"];

type ProjectsNewFormProps = {
  clients: Array<{ id: string; name: string; company: string | null }>;
  createProject: (formData: FormData) => Promise<void>;
  initialClientId?: string;
};

export default function ProjectsNewForm({ clients, createProject, initialClientId }: ProjectsNewFormProps) {
  const [error, setError] = useState("");
  const [status, setStatus] = useState<Status>("active");
  const [clientId, setClientId] = useState<string>(initialClientId ?? "");
  const [isPending, startTransition] = useTransition();

  const handleAction = (formData: FormData) => {
    setError("");
    const name = String(formData.get("name") ?? "").trim();
    const cId = String(formData.get("clientId") ?? "").trim();
    if (!name || !cId) {
      setError("Укажите клиента и название проекта");
      return;
    }
    startTransition(async () => {
      try {
        await createProject(formData);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Ошибка сохранения";
        setError(message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Новый проект</h1>
      </div>

      <Card>
        <CardTitle className="mb-3">Данные проекта</CardTitle>
        <CardContent>
          <form action={handleAction} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Клиент
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                name="clientId"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
              >
                <option value="">Выберите клиента</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.company || client.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Название проекта
              </label>
              <Input
                name="name"
                placeholder="Performance для Acme"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Статус
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Заметки
              </label>
              <Input name="notes" placeholder="Что делаем в этом месяце" />
            </div>

            <div className="space-y-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Сохранение…" : "Создать проект"}
              </Button>
              {error && <div className="text-xs text-red-600">{error}</div>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
