import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/db";
import {
  deleteReport,
  disablePublicLink,
  enablePublicLink,
} from "./actions";
import DeleteReportButton from "./DeleteReportButton";
import ReportActionsPanel from "./ReportActionsPanel";

type ReportPageProps = {
  params: Promise<{ reportId: string }>;
};

export default async function ReportDetailsPage({ params }: ReportPageProps) {
  const { reportId } = await params;
  if (!reportId) {
    notFound();
  }
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      project: {
        include: { client: true },
      },
    },
  });

  if (!report) {
    notFound();
  }

  const publicLink = await prisma.publicReportLink.findFirst({
    where: { reportId: report.id },
  });

  const enablePublicLinkAction = enablePublicLink.bind(null, report.id);
  const disablePublicLinkAction = disablePublicLink.bind(null, report.id);
  const deleteReportAction = deleteReport.bind(null, report.id);

  const clientName = report.project?.client?.company || report.project?.client?.name || "";

  const whatWasDone = Array.isArray(report.whatWasDone)
    ? (report.whatWasDone as string[])
    : null;
  const nextPlan = Array.isArray(report.nextPlan)
    ? (report.nextPlan as string[])
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-1">Отчет</span>
            <span>Период: {report.period}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            {report.project?.name || "Отчет"}
          </h1>
          <p className="text-sm text-slate-500">
            Клиент: {clientName}
          </p>
        </div>
        <div className="flex flex-col gap-2 items-start md:items-end">
          <Link
            href={`/app/reports/${report.id}/edit`}
            className="inline-flex items-center text-sm text-sky-600 hover:text-sky-700"
          >
            Редактировать отчет
          </Link>
          <ReportActionsPanel
            reportId={report.id}
            status={report.status}
            publishedAt={report.publishedAt?.toISOString() ?? null}
          />
          {publicLink && publicLink.isActive ? (
            <div className="space-y-1 text-left md:text-right">
              <div className="text-xs text-slate-500">Публичная ссылка для клиента</div>
              <div className="text-xs font-mono text-slate-700 break-all bg-slate-50 rounded px-2 py-1">
                /c/{publicLink.publicId}
              </div>
              <form action={disablePublicLinkAction}>
                <button
                  type="submit"
                  className="inline-flex items-center text-xs text-amber-600 hover:text-amber-700"
                >
                  Отключить публичную ссылку
                </button>
              </form>
            </div>
          ) : (
            <form action={enablePublicLinkAction}>
              <button
                type="submit"
                className="inline-flex items-center text-xs text-sky-600 hover:text-sky-700"
              >
                Включить публичную ссылку
              </button>
            </form>
          )}
          <DeleteReportButton action={deleteReportAction} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="text-xs text-slate-500 mb-1">ROAS</div>
          <div className="text-2xl font-semibold text-slate-900">
            {report.roas != null ? report.roas.toFixed(1) : "—"}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="text-xs text-slate-500 mb-1">Расход</div>
          <div className="text-2xl font-semibold text-slate-900">
            {report.spend != null ? report.spend.toLocaleString("ru-RU") + " ₽" : "—"}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="text-xs text-slate-500 mb-1">Выручка</div>
          <div className="text-2xl font-semibold text-slate-900">
            {report.revenue != null
              ? report.revenue.toLocaleString("ru-RU") + " ₽"
              : "—"}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="text-xs text-slate-500 mb-1">Лиды</div>
          <div className="text-2xl font-semibold text-slate-900">
            {report.leads != null ? report.leads.toLocaleString("ru-RU") : "—"}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="text-xs text-slate-500 mb-1">CPA</div>
          <div className="text-2xl font-semibold text-slate-900">
            {report.cpa != null ? report.cpa.toLocaleString("ru-RU") + " ₽" : "—"}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Краткое резюме
          </h2>
          <p className="text-sm text-slate-700">{report.summary}</p>
        </div>

        {whatWasDone && whatWasDone.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Что делали
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
              {whatWasDone.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {nextPlan && nextPlan.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Выводы и план
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
              {nextPlan.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {report.project && (
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Информация о проекте
            </h2>
            <p className="text-sm text-slate-700">
              Проект: {report.project.name}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Статус:{" "}
              {report.project.status === "active"
                ? "Активен"
                : report.project.status === "paused"
                ? "Пауза"
                : "Завершен"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
