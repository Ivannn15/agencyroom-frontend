"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardTitle, CardContent } from "../../../../components/ui/Card";
import { Input } from "../../../../components/ui/Input";
import { Button } from "../../../../components/ui/Button";
import { mockClients, mockProjects } from "../../../../lib/mockData";

export default function NewReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectFromQuery = searchParams.get("projectId") ?? "";

  const projectMatched = mockProjects.find((p) => p.id === projectFromQuery);

  const [clientId, setClientId] = useState<string>(projectMatched?.clientId ?? "");
  const [projectId, setProjectId] = useState<string>(projectFromQuery);
  const [period, setPeriod] = useState("");
  const [summary, setSummary] = useState("");
  const [spend, setSpend] = useState("");
  const [revenue, setRevenue] = useState("");
  const [leads, setLeads] = useState("");
  const [cpa, setCpa] = useState("");
  const [roas, setRoas] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const projectsForClient = useMemo(() => {
    if (!clientId) return mockProjects;
    return mockProjects.filter((p) => p.clientId === clientId);
  }, [clientId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!clientId || !projectId || !period || !summary) {
      setError("Укажите клиента, проект, период и резюме");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Create report", {
        clientId,
        projectId,
        period,
        summary,
        kpi: {
          spend: spend ? Number(spend) : undefined,
          revenue: revenue ? Number(revenue) : undefined,
          leads: leads ? Number(leads) : undefined,
          cpa: cpa ? Number(cpa) : undefined,
          roas: roas ? Number(roas) : undefined,
        },
      });
      await new Promise((resolve) => setTimeout(resolve, 400));
      router.push("/app/reports");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClientChange = (value: string) => {
    setClientId(value);
    if (value) {
      const currentProject = mockProjects.find((p) => p.id === projectId);
      if (!currentProject || currentProject.clientId !== value) {
        setProjectId("");
      }
    } else {
      setProjectId("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Новый отчет</h1>
      </div>

      <Card>
        <CardTitle className="mb-3">Данные отчета</CardTitle>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Клиент
                </label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                  value={clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
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
                  Проект
                </label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                >
                  <option value="">Выберите проект</option>
                  {projectsForClient.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Период
              </label>
              <Input
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="Январь 2025"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Краткое резюме
              </label>
              <textarea
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white min-h-[120px]"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Ключевые результаты кампании"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Расход
                </label>
                <Input
                  type="number"
                  value={spend}
                  onChange={(e) => setSpend(e.target.value)}
                  placeholder="120000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Выручка
                </label>
                <Input
                  type="number"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  placeholder="300000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Лиды
                </label>
                <Input
                  type="number"
                  value={leads}
                  onChange={(e) => setLeads(e.target.value)}
                  placeholder="120"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  CPA
                </label>
                <Input
                  type="number"
                  value={cpa}
                  onChange={(e) => setCpa(e.target.value)}
                  placeholder="600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ROAS
                </label>
                <Input
                  type="number"
                  value={roas}
                  onChange={(e) => setRoas(e.target.value)}
                  placeholder="3.5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Сохранение…" : "Создать отчет"}
              </Button>
              {error && <div className="text-xs text-red-600">{error}</div>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
