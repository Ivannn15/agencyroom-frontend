"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useClientAuth } from "../../../components/client/ClientAuthProvider";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { ClientReportsResponse, ClientSummaryResponse, Report } from "../../../lib/types";
import { fetchClientReports, fetchClientSummary } from "../../../lib/client-api";
import { formatCurrency, formatNumber, formatPeriod } from "../../../lib/format";

type Filters = {
  fromPeriod?: string;
  toPeriod?: string;
};

export default function ClientDashboardPage() {
  const router = useRouter();
  const { token, agency, logout } = useClientAuth();
  const [filters, setFilters] = useState<Filters>({});
  const [appliedFilters, setAppliedFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const [summary, setSummary] = useState<ClientSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [reports, setReports] = useState<ClientReportsResponse | null>(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const currency = agency?.currency ?? "RUB";

  const loadSummary = async (currentFilters: Filters = appliedFilters) => {
    if (!token) return;
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const data = await fetchClientSummary(token, currentFilters);
      setSummary(data);
    } catch (err: any) {
      console.error(err);
      if (err?.message === "unauthorized") {
        logout();
        router.replace("/client/login");
      } else {
        setSummaryError("Не удалось загрузить сводку");
      }
    } finally {
      setSummaryLoading(false);
    }
  };

  const loadReports = async (nextPage = page, currentFilters: Filters = appliedFilters) => {
    if (!token) return;
    setReportsLoading(true);
    setReportsError(null);
    try {
      const data = await fetchClientReports(token, { ...currentFilters, page: nextPage, pageSize });
      setReports(data);
    } catch (err: any) {
      console.error(err);
      if (err?.message === "unauthorized") {
        logout();
        router.replace("/client/login");
      } else {
        setReportsError("Не удалось загрузить отчеты");
      }
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    loadSummary(appliedFilters);
  }, [token, appliedFilters]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadReports(page, appliedFilters);
  }, [token, appliedFilters, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = useMemo(() => {
    if (!reports) return 1;
    return Math.max(1, Math.ceil(reports.total / reports.pageSize));
  }, [reports]);

  const handleApplyFilters = () => {
    setPage(1);
    setAppliedFilters(filters);
    loadSummary(filters);
    loadReports(1, filters);
  };

  const handleResetFilters = () => {
    setFilters({});
    setAppliedFilters({});
    setPage(1);
    loadSummary({});
    loadReports(1, {});
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-slate-500">Клиентский кабинет</p>
        <h1 className="text-2xl font-semibold text-slate-900">Обзор рекламных результатов</h1>
        <p className="text-sm text-slate-600">
          Здесь вы видите сводные показатели и опубликованные отчеты по вашим кампаниям.
        </p>
      </div>

      <Filters
        filters={filters}
        onChange={setFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        loading={summaryLoading || reportsLoading}
      />

      <SummaryGrid
        summary={summary}
        currency={currency}
        loading={summaryLoading}
        error={summaryError}
        onRetry={loadSummary}
      />

      <ReportsTable
        reports={reports}
        loading={reportsLoading}
        error={reportsError}
        currency={currency}
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        onRetry={loadReports}
      />
    </div>
  );
}

function Filters({
  filters,
  onChange,
  onApply,
  onReset,
  loading,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onApply: () => void;
  onReset: () => void;
  loading: boolean;
}) {
  return (
    <Card className="p-4 md:p-5 border border-slate-200">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Период с</label>
            <input
              type="month"
              value={filters.fromPeriod || ""}
              onChange={(e) => onChange({ ...filters, fromPeriod: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">По</label>
            <input
              type="month"
              value={filters.toPeriod || ""}
              onChange={(e) => onChange({ ...filters, toPeriod: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-sky-400 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onReset} disabled={loading}>
            Сбросить
          </Button>
          <Button onClick={onApply} disabled={loading}>
            {loading ? "Обновляем..." : "Применить"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function SummaryGrid({
  summary,
  currency,
  loading,
  error,
  onRetry,
}: {
  summary: ClientSummaryResponse | null;
  currency: string;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const cards = [
    { label: `Total Spend (${currency})`, value: formatCurrency(summary?.totalSpend, currency) },
    { label: `Total Revenue (${currency})`, value: formatCurrency(summary?.totalRevenue, currency) },
    { label: "Leads", value: formatNumber(summary?.totalLeads, 0) },
    { label: `Avg CPA (${currency})`, value: formatCurrency(summary?.avgCpa, currency) },
    { label: "Avg ROAS", value: formatNumber(summary?.avgRoas, 2) },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, idx) => (
          <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-8 w-32 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between">
        <span>{error}</span>
        <Button variant="outline" onClick={onRetry}>
          Повторить
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-slate-500">{card.label}</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</div>
          <div className="text-xs text-slate-500 mt-1">за выбранный период</div>
        </div>
      ))}
    </div>
  );
}

function ReportsTable({
  reports,
  loading,
  error,
  currency,
  page,
  totalPages,
  onPrev,
  onNext,
  onRetry,
}: {
  reports: ClientReportsResponse | null;
  loading: boolean;
  error: string | null;
  currency: string;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <Card className="p-4 md:p-5 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">Опубликованные отчеты</h2>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="grid grid-cols-2 gap-3 rounded-lg border border-slate-100 p-3 shadow-xs">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-20 animate-pulse rounded bg-slate-200 justify-self-end" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 md:p-5 border border-red-200 bg-red-50">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-red-800">{error}</div>
          <Button variant="outline" onClick={onRetry}>
            Повторить
          </Button>
        </div>
      </Card>
    );
  }

  if (!reports || reports.total === 0) {
    return (
      <Card className="p-4 md:p-5 border border-slate-200">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Опубликованные отчеты</h2>
        <EmptyState
          title="Пока нет опубликованных отчетов"
          description="Как только агентство опубликует первый отчет, он появится здесь."
        />
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-5 border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-900">Опубликованные отчеты</h2>
        <div className="text-xs text-slate-500">
          Страница {page} из {totalPages}
        </div>
      </div>
      <div className="hidden md:grid grid-cols-9 text-xs font-semibold text-slate-500 px-2 py-2">
        <div className="col-span-2">Период</div>
        <div className="col-span-2">Проект</div>
        <div>Spend</div>
        <div>Revenue</div>
        <div>Leads</div>
        <div>CPA</div>
        <div>ROAS</div>
        <div className="text-right">Действие</div>
      </div>
      <div className="divide-y divide-slate-100">
        {reports.items.map((report) => (
          <ReportRow key={report.id} report={report} currency={currency} />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Button variant="outline" onClick={onPrev} disabled={page <= 1}>
          Назад
        </Button>
        <span className="text-xs text-slate-500">
          Страница {page} из {totalPages}
        </span>
        <Button variant="outline" onClick={onNext} disabled={page >= totalPages}>
          Вперед
        </Button>
      </div>
    </Card>
  );
}

function ReportRow({ report, currency }: { report: Report; currency: string }) {
  return (
    <div className="flex flex-col gap-3 px-2 py-3 md:grid md:grid-cols-9 md:items-center">
      <div className="md:col-span-2">
        <div className="text-sm font-semibold text-slate-900">{formatPeriod(report.period)}</div>
        <div className="text-xs text-slate-500">{report.period}</div>
      </div>
      <div className="md:col-span-2">
        <div className="text-sm font-medium text-slate-900">{report.project?.name ?? "Проект"}</div>
        <div className="text-xs text-slate-500">
          {report.project?.client?.company || report.project?.client?.name || ""}
        </div>
      </div>
      <div className="text-sm text-slate-900">{formatCurrency(report.spend, currency)}</div>
      <div className="text-sm text-slate-900">{formatCurrency(report.revenue, currency)}</div>
      <div className="text-sm text-slate-900">{formatNumber(report.leads, 0)}</div>
      <div className="text-sm text-slate-900">{formatCurrency(report.cpa, currency)}</div>
      <div className="text-sm text-slate-900">{formatNumber(report.roas, 2)}</div>
      <div className="md:justify-self-end">
        <Link
          href={`/client/reports/${report.id}`}
          className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Открыть
        </Link>
      </div>
    </div>
  );
}
