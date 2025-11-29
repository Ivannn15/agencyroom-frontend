"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardTitle, CardContent } from "../../../../components/ui/Card";
import { Input } from "../../../../components/ui/Input";
import { Button } from "../../../../components/ui/Button";
import { mockClients } from "../../../../lib/mockData";

const statusOptions = [
  { value: "active", label: "Активный" },
  { value: "paused", label: "Пауза" },
  { value: "completed", label: "Завершен" },
] as const;

type Status = (typeof statusOptions)[number]["value"];

export default function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientFromQuery = searchParams.get("clientId") ?? "";

  const [clientId, setClientId] = useState<string>(clientFromQuery);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status>("active");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!clientId || !name) {
      setError("Укажите клиента и название проекта");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Create project", { clientId, name, status });
      await new Promise((resolve) => setTimeout(resolve, 400));
      router.push("/app/projects");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Новый проект</h1>
      </div>

      <Card>
        <CardTitle className="mb-3">Данные проекта</CardTitle>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Клиент
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                <option value="">Выберите клиента</option>
                {mockClients.map((client) => (
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Performance для Acme"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Статус
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
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

            <div className="space-y-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Сохранение…" : "Создать проект"}
              </Button>
              {error && <div className="text-xs text-red-600">{error}</div>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
