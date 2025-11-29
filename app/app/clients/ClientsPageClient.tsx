"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Card, CardTitle } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";

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
  const [clients, setClients] = useState<ClientForUi[]>(initialClients);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email) {
      setError("Укажите имя клиента и email");
      return;
    }

    const newClient: ClientForUi = {
      id: "tmp_" + Date.now().toString(),
      name,
      company: company || null,
      contactEmail: email,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setClients((prev) => [newClient, ...prev]);
    setName("");
    setCompany("");
    setEmail("");
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
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
        >
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Имя клиента
            </label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Анна" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Компания
            </label>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Store"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@company.com"
            />
          </div>
          <div>
            <Button type="submit" className="w-full mt-5">
              Добавить
            </Button>
          </div>
        </form>
        {error && (
          <div className="mt-2 text-xs text-red-600">
            {error}
          </div>
        )}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
