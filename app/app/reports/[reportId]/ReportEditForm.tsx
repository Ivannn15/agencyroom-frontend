"use client";

import { useTransition } from "react";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";

type ReportEditFormProps = {
  report: {
    id: string;
    period: string;
    summary: string;
    spend: number | null;
    revenue: number | null;
    leads: number | null;
    cpa: number | null;
    roas: number | null;
    whatWasDone: string[] | null;
    nextPlan: string[] | null;
  };
  updateReport: (formData: FormData) => Promise<void>;
};

export default function ReportEditForm({ report, updateReport }: ReportEditFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleAction = (formData: FormData) => {
    startTransition(() => updateReport(formData));
  };

  const whatWasDoneText = report.whatWasDone?.join("\n") ?? "";
  const nextPlanText = report.nextPlan?.join("\n") ?? "";

  return (
    <form action={handleAction} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 max-w-3xl">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Период отчета
          </label>
          <Input
            name="period"
            defaultValue={report.period}
            placeholder="Например, сентябрь 2025 или 01.09.2025–30.09.2025"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Расход
          </label>
          <Input
            name="spend"
            type="number"
            step="0.01"
            defaultValue={report.spend ?? undefined}
            placeholder="50000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Выручка
          </label>
          <Input
            name="revenue"
            type="number"
            step="0.01"
            defaultValue={report.revenue ?? undefined}
            placeholder="120000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Лиды
          </label>
          <Input
            name="leads"
            type="number"
            step="1"
            defaultValue={report.leads ?? undefined}
            placeholder="60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            CPA
          </label>
          <Input
            name="cpa"
            type="number"
            step="0.01"
            defaultValue={report.cpa ?? undefined}
            placeholder="833"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            ROAS
          </label>
          <Input
            name="roas"
            type="number"
            step="0.01"
            defaultValue={report.roas ?? undefined}
            placeholder="2.4"
          />
        </div>
      </div>
      <p className="text-xs text-slate-500 max-w-3xl">
        Числовые показатели используются для краткого KPI-блока, который видит клиент в отчете.
      </p>

      <div className="grid gap-4 max-w-3xl">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Краткое резюме
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Это первый блок, который читает клиент — опишите самое важное простым языком.
          </p>
          <textarea
            name="summary"
            defaultValue={report.summary}
            placeholder="1–2 абзаца о ключевых результатах за период."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 min-h-[80px]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Что делали (по одному пункту в строке)
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Перечислите основные действия за период — каждое с новой строки.
          </p>
          <textarea
            name="whatWasDone"
            defaultValue={whatWasDoneText}
            placeholder={
              "Добавили новые креативы\nОптимизировали частоту показов\nПеренастроили гео на ключевые районы"
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 min-h-[120px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Выводы и план (по одному пункту в строке)
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Опишите план на следующий период: что будете тестировать и улучшать.
          </p>
          <textarea
            name="nextPlan"
            defaultValue={nextPlanText}
            placeholder={
              "Запустить оффлайн-конверсии\nПротестировать look-alike аудитории\nПодготовить спецпредложение к сезону"
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 min-h-[120px]"
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Сохраняем..." : "Сохранить изменения"}
      </Button>
    </form>
  );
}
