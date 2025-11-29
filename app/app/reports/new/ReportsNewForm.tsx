"use client";

import { useMemo, useState, useTransition } from "react";
import { Card, CardContent, CardTitle } from "../../../../components/ui/Card";
import { Input } from "../../../../components/ui/Input";
import { Button } from "../../../../components/ui/Button";

type ReportsNewFormProps = {
  projects: Array<{ id: string; name: string; clientId: string; clientName: string }>;
  clients: Array<{ id: string; name: string; company: string | null }>;
  initialProjectId?: string;
  createReport: (formData: FormData) => Promise<void>;
};

export default function ReportsNewForm({
  projects,
  clients,
  initialProjectId,
  createReport,
}: ReportsNewFormProps) {
  const initialProject = projects.find((p) => p.id === initialProjectId);
  const [clientId, setClientId] = useState<string>(initialProject?.clientId ?? "");
  const [projectId, setProjectId] = useState<string>(initialProjectId ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const projectsForClient = useMemo(() => {
    if (!clientId) return projects;
    return projects.filter((p) => p.clientId === clientId);
  }, [clientId, projects]);

  const handleClientChange = (value: string) => {
    setClientId(value);
    if (value) {
      const currentProject = projects.find((p) => p.id === projectId);
      if (!currentProject || currentProject.clientId !== value) {
        setProjectId("");
      }
    } else {
      setProjectId("");
    }
  };

  const handleAction = (formData: FormData) => {
    setError("");
    const pId = String(formData.get("projectId") ?? "").trim();
    const period = String(formData.get("period") ?? "").trim();
    const summary = String(formData.get("summary") ?? "").trim();
    if (!pId || !period || !summary) {
      setError("Укажите клиента, проект, период и резюме");
      return;
    }
    startTransition(async () => {
      try {
        await createReport(formData);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Ошибка сохранения";
        setError(message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Новый отчет</h1>
      </div>

      <Card>
        <CardTitle className="mb-3">Данные отчета</CardTitle>
        <CardContent>
          <form action={handleAction} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Клиент
                </label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                  name="clientId"
                  value={clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
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
                  Проект
                </label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                  name="projectId"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  required
                >
                  <option value="">Выберите проект</option>
                  {projectsForClient.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} — {project.clientName}
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
                name="period"
                defaultValue=""
                placeholder="Январь 2025"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Краткое резюме
              </label>
              <textarea
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white min-h-[120px]"
                name="summary"
                placeholder="Ключевые результаты кампании"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Расход
                </label>
                <Input type="number" name="spend" placeholder="120000" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Выручка
                </label>
                <Input type="number" name="revenue" placeholder="300000" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Лиды
                </label>
                <Input type="number" name="leads" placeholder="120" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  CPA
                </label>
                <Input type="number" name="cpa" placeholder="600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ROAS
                </label>
                <Input type="number" name="roas" placeholder="3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Что делали (по одному пункту в строке)
              </label>
              <textarea
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white min-h-[120px]"
                name="whatWasDone"
                placeholder={"Добавили новые креативы\nОптимизировали посадочные\nЗапустили ремаркетинг"}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Выводы и план (по одному пункту в строке)
              </label>
              <textarea
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white min-h-[120px]"
                name="nextPlan"
                placeholder={"Запустить оффлайн-конверсии\nПротестировать новые аудитории"}
              />
            </div>

            <div className="space-y-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Сохранение…" : "Создать отчет"}
              </Button>
              {error && <div className="text-xs text-red-600">{error}</div>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
