"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "../../../components/ui/Button";

const statusOptions = [
  { value: "all", label: "Все статусы" },
  { value: "active", label: "Активные" },
  { value: "paused", label: "Пауза" },
  { value: "completed", label: "Завершенные" },
] as const;

type StatusFilter = (typeof statusOptions)[number]["value"];

type ProjectForUi = {
  id: string;
  name: string;
  status: "active" | "paused" | "completed";
  clientId: string;
  clientName: string;
};

type ClientForUi = {
  id: string;
  name: string;
  company: string | null;
};

const statusBadgeStyles: Record<ProjectForUi["status"], string> = {
  active:
    "border-emerald-100 bg-emerald-50 text-emerald-700",
  paused:
    "border-amber-100 bg-amber-50 text-amber-700",
  completed:
    "border-slate-200 bg-slate-50 text-slate-600",
};

function getStatusLabel(status: ProjectForUi["status"]) {
  switch (status) {
    case "active":
      return "Активен";
    case "paused":
      return "Пауза";
    case "completed":
      return "Завершен";
  }
}

export default function ProjectsPageClient({
  projects,
  clients,
  total,
  activeCount,
  pausedCount,
}: {
  projects: ProjectForUi[];
  clients: ClientForUi[];
  total: number;
  activeCount: number;
  pausedCount: number;
}) {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [clientId, setClientId] = useState<string>("all");

  const clientsById = useMemo(() => {
    const map = new Map<string, ClientForUi>();
    for (const c of clients) {
      map.set(c.id, c);
    }
    return map;
  }, [clients]);

  const filteredProjects = projects.filter((project) => {
    const statusOk = status === "all" || project.status === status;
    const clientOk = clientId === "all" || project.clientId === clientId;
    return statusOk && clientOk;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Проекты</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="text-xs text-slate-500 mb-1">Всего проектов</div>
          <div className="text-2xl font-semibold">{total}</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="text-xs text-slate-500 mb-1">Активные</div>
          <div className="text-2xl font-semibold">{activeCount}</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="text-xs text-slate-500 mb-1">На паузе</div>
          <div className="text-2xl font-semibold">{pausedCount}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Список проектов
            </h2>
            <Link href="/app/projects/new">
              <Button>Создать проект</Button>
            </Link>
          </div>
          <div className="flex flex-col md:flex-row gap-3 text-sm">
            <div>
              <div className="text-xs font-medium text-slate-700 mb-1">
                Клиент
              </div>
              <select
                className="w-full md:w-48 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                <option value="all">Все клиенты</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.company || client.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-700 mb-1">
                Статус
              </div>
              <select
                className="w-full md:w-48 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusFilter)}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b">
                <th className="py-2 pr-4">Проект</th>
                <th className="py-2 pr-4">Клиент</th>
                <th className="py-2 pr-4">Статус</th>
                <th className="py-2 pr-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => {
                const client = clientsById.get(project.clientId);
                return (
                  <tr
                    key={project.id}
                    className="border-b last:border-0 hover:bg-slate-50"
                  >
                    <td className="py-2 pr-4">{project.name}</td>
                    <td className="py-2 pr-4">
                      {client
                        ? client.company || client.name
                        : "Неизвестный клиент"}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${statusBadgeStyles[project.status]}`}
                      >
                        {getStatusLabel(project.status)}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <Link
                        href={`/app/projects/${project.id}`}
                        className="text-xs px-3 py-1 rounded-full border border-sky-200 text-sky-700 hover:bg-sky-50"
                      >
                        Открыть
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredProjects.length === 0 && (
            <div className="py-4 text-xs text-slate-500">
              По выбранным фильтрам проекты не найдены.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
