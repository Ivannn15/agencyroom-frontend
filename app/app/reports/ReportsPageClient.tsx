"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/EmptyState";

type ReportForUi = {
  id: string;
  projectName: string;
  clientName: string;
  period: string;
  summary: string;
  roas: number | null;
  clientId: string;
};

type ClientForUi = {
  id: string;
  name: string;
  company: string | null;
};

type ClientFilter = "all" | string;

export default function ReportsPageClient({
  reports,
  clients,
}: {
  reports: ReportForUi[];
  clients: ClientForUi[];
}) {
  const [clientId, setClientId] = useState<ClientFilter>("all");
  const [search, setSearch] = useState("");

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reports.filter((report) => {
      const clientOk = clientId === "all" || report.clientId === clientId;
      const searchOk =
        !query ||
        report.projectName.toLowerCase().includes(query) ||
        report.clientName.toLowerCase().includes(query) ||
        report.summary.toLowerCase().includes(query);
      return clientOk && searchOk;
    });
  }, [reports, clientId, search]);

  const totalReports = reports.length;
  const clientsWithReports = new Set(reports.map((r) => r.clientId)).size;
  const avgRoas =
    reports.reduce((sum, r) => sum + (r.roas ?? 0), 0) /
    (reports.filter((r) => r.roas != null).length || 1);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Отчеты</h1>
          <p className="text-sm text-slate-500">
            Сводка отчетов по проектам и клиентам, с возможностью быстрого поиска.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="text-xs text-slate-500 mb-1">Всего отчетов</div>
          <div className="text-2xl font-semibold">{totalReports}</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="text-xs text-slate-500 mb-1">
            Клиентов с отчетами
          </div>
          <div className="text-2xl font-semibold">{clientsWithReports}</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="text-xs text-slate-500 mb-1">Средний ROAS</div>
          <div className="text-2xl font-semibold">
            {avgRoas.toFixed(1)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Список отчетов
            </h2>
            <Link href="/app/reports/new">
              <Button>Создать отчет</Button>
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
                onChange={(e) => setClientId(e.target.value as ClientFilter)}
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
                Поиск
              </div>
              <input
                className="w-full md:w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="Название проекта или клиента"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {reports.length === 0 ? (
          <EmptyState
            title="У вас пока нет отчетов"
            description="Создайте первый отчет по проекту, чтобы начать делиться результатами с клиентами."
            action={
              <Link href="/app/reports/new">
                <Button className="px-3 py-2 text-sm">Создать отчет</Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b">
                  <th className="py-2 pr-4">Отчет</th>
                  <th className="py-2 pr-4">Клиент</th>
                  <th className="py-2 pr-4">Период</th>
                  <th className="py-2 pr-4">Краткое резюме</th>
                  <th className="py-2 pr-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b last:border-0 hover:bg-slate-50"
                  >
                    <td className="py-2 pr-4">{report.projectName}</td>
                    <td className="py-2 pr-4">{report.clientName}</td>
                    <td className="py-2 pr-4">{report.period}</td>
                    <td className="py-2 pr-4 max-w-md">
                      <span className="line-clamp-2">{report.summary}</span>
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <Link
                        href={`/app/reports/${report.id}`}
                        className="text-xs px-3 py-1 rounded-full border border-sky-200 text-sky-700 hover:bg-sky-50"
                      >
                        Открыть
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredReports.length === 0 && (
              <div className="py-4 text-xs text-slate-500">
                По выбранным фильтрам отчеты не найдены.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
