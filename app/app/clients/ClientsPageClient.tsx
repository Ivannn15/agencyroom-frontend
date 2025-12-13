"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Card, CardTitle } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { useAdminAuth } from "../../../components/admin/AdminAuthProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ClientForUi = {
  id: string;
  name: string;
  company: string | null;
  contactEmail: string;
  createdAt: string;
};

type ClientsPageClientProps = {
  initialClients: ClientForUi[];
};

export default function ClientsPageClient({ initialClients }: ClientsPageClientProps) {
  const router = useRouter();
  const { token } = useAdminAuth();
  const [clients, setClients] = useState<ClientForUi[]>(initialClients);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});

  const mapClient = useMemo(
    () => (client: any): ClientForUi => ({
      id: client.id,
      name: client.name,
      company: client.company ?? null,
      contactEmail: client.contactEmail,
      createdAt: client.createdAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    }),
    []
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setActionError("");

    if (!name || !email) {
      setError("Укажите имя клиента и email");
      return;
    }

    if (!token) {
      setError("Нет активной сессии администратора.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          company: company || null,
          contactEmail: email,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const message = (data as any)?.message ?? "Не удалось создать клиента.";
        setError(message);
        return;
      }

      const created = mapClient(data);
      setClients((prev) => [created, ...prev]);
      setName("");
      setCompany("");
      setEmail("");
    } catch {
      setError("Не удалось создать клиента. Попробуйте снова.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm("Удалить клиента? Сначала убедитесь, что у него нет проектов и отчетов.")) {
      return;
    }
    setActionError("");

    if (!token) {
      setActionError("Нет активной сессии администратора.");
      return;
    }

    setDeleting((prev) => ({ ...prev, [clientId]: true }));
    try {
      const res = await fetch(`${API_URL}/clients/${clientId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        if (res.status === 400) {
          setActionError("Нельзя удалить клиента, пока у него есть проекты. Сначала удалите проекты и их отчеты.");
        } else {
          const message = (data as any)?.message ?? "Не удалось удалить клиента.";
          setActionError(message);
        }
        return;
      }

      setClients((prev) => prev.filter((client) => client.id !== clientId));
    } catch {
      setActionError("Не удалось удалить клиента. Попробуйте снова.");
    } finally {
      setDeleting((prev) => {
        const next = { ...prev };
        delete next[clientId];
        return next;
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Клиенты</h1>
          <p className="text-sm text-slate-500">
            Управляйте контактами клиентов и создавайте проекты для отчетов.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/app/clients/new")}>
          + New client
        </Button>
      </div>

      <Card>
        <CardTitle className="mb-3">Добавить клиента</CardTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="md:col-span-2 space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Имя контакта
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например, Иван Петров"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Компания
              </label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="ООО Ромашка"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@example.com"
            />
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Контактные данные используются только для работы с отчетами и не передаются третьим лицам.
        </p>
        <div className="space-y-2">
          <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
            {isSubmitting ? "Сохраняем…" : "Добавить"}
          </Button>
          {error && (
            <div className="text-xs text-red-600">
              {error}
            </div>
          )}
        </div>
      </form>
    </Card>

      <Card>
        <CardTitle className="mb-3">Список клиентов</CardTitle>
        {clients.length === 0 ? (
          <EmptyState
            title="У вас пока нет клиентов"
            description="Добавьте первого клиента, чтобы начать вести проекты и отчеты по ним."
            action={
              <Link href="/app/clients/new">
                <Button className="px-3 py-2 text-sm">Добавить клиента</Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b">
                  <th className="py-2 pr-4">Клиент</th>
                  <th className="py-2 pr-4">Компания</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Добавлен</th>
                  <th className="py-2 pr-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b last:border-0 hover:bg-slate-50"
                  >
                    <td className="py-2 pr-4">
                      <Link
                        href={`/app/clients/${client.id}`}
                        className="text-sky-700 hover:underline"
                      >
                        {client.name}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">
                      {client.company || <span className="text-slate-400">—</span>}
                    </td>
                    <td className="py-2 pr-4">{client.contactEmail}</td>
                    <td className="py-2 pr-4">{client.createdAt}</td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/app/clients/${client.id}`}
                          className="text-sky-700 hover:underline"
                        >
                          Открыть
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(client.id)}
                          disabled={!!deleting[client.id]}
                          className="text-red-600 hover:text-red-700 disabled:opacity-60"
                        >
                          {deleting[client.id] ? "Удаляем…" : "Удалить"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {actionError && (
        <div className="text-xs text-red-600">
          {actionError}
        </div>
      )}
    </div>
  );
}
