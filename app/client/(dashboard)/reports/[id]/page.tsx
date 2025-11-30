"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "../../../../../components/ui/Button";
import { Card } from "../../../../../components/ui/Card";
import { useClientAuth } from "../../../../../components/client/ClientAuthProvider";
import { Report } from "../../../../../lib/types";
import { fetchClientReport } from "../../../../../lib/client-api";
import { formatCurrency, formatNumber, formatPeriod } from "../../../../../lib/format";

export default function ClientReportDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token, agency, logout } = useClientAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currency = agency?.currency ?? "RUB";

  useEffect(() => {
    const id = params?.id;
    if (!id || !token) return;
    setLoading(true);
    setError(null);
    fetchClientReport(token, id as string)
      .then(setReport)
      .catch((err: any) => {
        console.error(err);
        if (err?.message === "unauthorized") {
          logout();
          router.replace("/client/login");
        } else {
          setError("Отчет не найден или недоступен");
        }
      })
      .finally(() => setLoading(false));
  }, [logout, params?.id, router, token]);

  const renderList = (items?: string[], emptyText?: string) => {
    if (!items || items.length === 0) {
      return <p className="text-sm text-slate-500">{emptyText || "Нет данных"}</p>;
    }
    return (
      <ul className="list-disc space-y-2 pl-4 text-sm text-slate-800">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    );
  };

  const backToList = () => router.push("/client");

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-40 animate-pulse rounded bg-slate-200" />
        <Card className="p-4 space-y-3">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        </Card>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={backToList}>
          ← Назад к отчетам
        </Button>
        <Card className="p-6 border-red-200 bg-red-50">
          <h2 className="text-lg font-semibold text-red-800">Отчет не найден</h2>
          <p className="text-sm text-red-700 mt-2">Возможно, он удален или у вас нет к нему доступа.</p>
          <div className="mt-4">
            <Button onClick={backToList}>Вернуться к списку</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={backToList}>
          ← Назад к отчетам
        </Button>
        <div className="text-xs text-slate-500">
          Опубликован: {report.publishedAt ? new Date(report.publishedAt).toLocaleString("ru-RU") : "—"}
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Отчет за {formatPeriod(report.period)}</h1>
        <p className="text-sm text-slate-600">
          Кампания: {report.project?.name || "—"} · Бизнес:{" "}
          {report.project?.client?.company || report.project?.client?.name || "—"}
        </p>
      </div>

      <Card className="p-4 md:p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Kpi title="Spend" value={formatCurrency(report.spend, currency)} />
          <Kpi title="Revenue" value={formatCurrency(report.revenue, currency)} />
          <Kpi title="Leads" value={formatNumber(report.leads, 0)} />
          <Kpi title="CPA" value={formatCurrency(report.cpa, currency)} />
          <Kpi title="ROAS" value={formatNumber(report.roas, 2)} />
        </div>
      </Card>

      <Card className="p-4 md:p-5 space-y-3">
        <div className="text-sm font-semibold text-slate-900">Краткое резюме</div>
        <p className="text-sm text-slate-700 leading-relaxed">{report.summary}</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4 md:p-5 space-y-3">
          <div className="text-sm font-semibold text-slate-900">Что делали в этом периоде</div>
          {renderList(report.whatWasDone, "Агентство не добавило деталей по выполненной работе.")}
        </Card>
        <Card className="p-4 md:p-5 space-y-3">
          <div className="text-sm font-semibold text-slate-900">План на следующий период</div>
          {renderList(report.nextPlan, "План на следующий период не указан.")}
        </Card>
      </div>

      <Card className="p-4 md:p-5 text-xs text-slate-500">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-green-50 px-3 py-1 text-green-700 border border-green-200">
            Статус: Опубликован
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 border border-slate-200">
            ID отчета: {report.id}
          </span>
        </div>
      </Card>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 text-xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}
