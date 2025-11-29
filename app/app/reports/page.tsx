"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  mockClients,
  mockReports,
  type MockClient,
  type MockReport,
} from "../../../lib/mockData";

type ClientFilter = "all" | string;

export default function ReportsPage() {
  const [clientId, setClientId] = useState<ClientFilter>("all");
  const [search, setSearch] = useState("");

  const clientsById = useMemo(() => {
    const map = new Map<string, MockClient>();
    for (const c of mockClients) {
      map.set(c.id, c);
    }
    return map;
  }, []);

  const filteredReports = mockReports.filter((report) => {
    const clientOk = clientId === "all" || report.clientId === clientId;
    const query = search.trim().toLowerCase();
    const searchOk =
      !query ||
      report.projectName.toLowerCase().includes(query) ||
      report.clientName.toLowerCase().includes(query) ||
      report.summary.toLowerCase().includes(query);

    return clientOk && searchOk;
  });

  const totalReports = mockReports.length;
  const clientsWithReports = new Set(mockReports.map((r) => r.clientId)).size;
  const avgRoas =
    mockReports.reduce((sum, r) => sum + (r.roas ?? 0), 0) /
    (mockReports.filter((r) => r.roas != null).length || 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Отчеты</h1>
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
          <h2 className="text-sm font-semibold text-slate-900">
            Список отчетов
          </h2>
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
                {mockClients.map((client) => (
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
      </div>
    </div>
  );
}
