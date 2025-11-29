import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/db";

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

  const clientName = report.project?.client?.company || report.project?.client?.name || "";

  const whatWasDone = Array.isArray(report.whatWasDone)
    ? (report.whatWasDone as string[])
    : null;
  const nextPlan = Array.isArray(report.nextPlan)
    ? (report.nextPlan as string[])
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          {report.project?.name || "Отчет"}
        </h1>
        <p className="text-sm text-slate-500">
          Клиент: {clientName} · Период: {report.period}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="text-xs text-slate-500 mb-1">ROAS</div>
          <div className="text-2xl font-semibold">
            {report.roas != null ? report.roas.toFixed(1) : "—"}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="text-xs text-slate-500 mb-1">Расход</div>
          <div className="text-2xl font-semibold">
            {report.spend != null ? report.spend.toLocaleString("ru-RU") + " ₽" : "—"}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="text-xs text-slate-500 mb-1">Выручка</div>
          <div className="text-2xl font-semibold">
            {report.revenue != null
              ? report.revenue.toLocaleString("ru-RU") + " ₽"
              : "—"}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="text-xs text-slate-500 mb-1">Лиды</div>
          <div className="text-2xl font-semibold">
            {report.leads != null ? report.leads.toLocaleString("ru-RU") : "—"}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="text-xs text-slate-500 mb-1">CPA</div>
          <div className="text-2xl font-semibold">
            {report.cpa != null ? report.cpa.toLocaleString("ru-RU") + " ₽" : "—"}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Краткое резюме
        </h2>
        <p className="text-sm text-slate-700">{report.summary}</p>
      </div>

      {whatWasDone && whatWasDone.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-4">
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
        <div className="bg-white rounded-2xl shadow-sm p-4">
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
        <div className="bg-white rounded-2xl shadow-sm p-4">
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
  );
}
