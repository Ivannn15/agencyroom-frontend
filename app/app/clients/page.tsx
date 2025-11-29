"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { mockClients, type MockClient } from "../../../lib/mockData";

export default function ClientsPage() {
  const [clients, setClients] = useState<MockClient[]>(mockClients);
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

    const newClient: MockClient = {
      id: "c" + Date.now().toString(),
      name,
      company: company || undefined,
      contactEmail: email,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setClients((prev) => [newClient, ...prev]);
    setName("");
    setCompany("");
    setEmail("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Клиенты</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Добавить клиента
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
        >
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Имя клиента
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Анна"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Компания
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Store"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@company.com"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full rounded-lg bg-sky-600 text-white text-sm font-medium py-2.5 hover:bg-sky-700 mt-5"
            >
              Добавить
            </button>
          </div>
        </form>
        {error && (
          <div className="mt-2 text-xs text-red-600">
            {error}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Список клиентов
        </h2>
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
          {clients.length === 0 && (
            <div className="py-4 text-xs text-slate-500">
              Пока нет клиентов. Добавьте первого с помощью формы выше.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
