import { notFound } from "next/navigation";
import { prisma } from "../../../lib/db";

type PublicReportPageProps = {
  params: Promise<{ publicId: string }>;
};

export default async function PublicReportPage({ params }: PublicReportPageProps) {
  const { publicId } = await params;
  const link = await prisma.publicReportLink.findUnique({
    where: { publicId },
    include: {
      report: {
        include: {
          project: {
            include: { client: true },
          },
        },
      },
    },
  });

  if (!link || !link.isActive || !link.report) {
    notFound();
  }

  const report = link.report;
  const project = report.project;
  const client = project?.client;
  const whatWasDone = Array.isArray(report.whatWasDone)
    ? (report.whatWasDone as string[])
    : null;
  const nextPlan = Array.isArray(report.nextPlan)
    ? (report.nextPlan as string[])
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-6 md:space-y-8">
        <header className="space-y-2 text-center md:text-left">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Отчет по рекламе
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            {project?.name || "Отчет"}
          </h1>
          <p className="text-sm text-slate-500">
            Клиент: {client?.company || client?.name || ""}
            {report.period && <> · Период: {report.period}</>}
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="text-xs text-slate-500 mb-1">ROAS</div>
            <div className="text-2xl font-semibold text-slate-900">
              {report.roas != null ? report.roas.toFixed(1) : "—"}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="text-xs text-slate-500 mb-1">Расход</div>
            <div className="text-2xl font-semibold text-slate-900">
              {report.spend != null ? report.spend.toLocaleString("ru-RU") + " ₽" : "—"}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="text-xs text-slate-500 mb-1">Выручка</div>
            <div className="text-2xl font-semibold text-slate-900">
              {report.revenue != null
                ? report.revenue.toLocaleString("ru-RU") + " ₽"
                : "—"}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="text-xs text-slate-500 mb-1">Лиды</div>
            <div className="text-2xl font-semibold text-slate-900">
              {report.leads != null ? report.leads.toLocaleString("ru-RU") : "—"}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="text-xs text-slate-500 mb-1">CPA</div>
            <div className="text-2xl font-semibold text-slate-900">
              {report.cpa != null ? report.cpa.toLocaleString("ru-RU") + " ₽" : "—"}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">Краткое резюме</h2>
            <p className="text-xs text-slate-500 mb-2">
              Основные выводы по результатам периода в одном блоке.
            </p>
            <p className="text-sm text-slate-700">{report.summary}</p>
          </div>

          {whatWasDone && whatWasDone.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">Что делали</h2>
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                {whatWasDone.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {nextPlan && nextPlan.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">Выводы и план</h2>
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                {nextPlan.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {project && (
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">
                Информация о проекте
              </h2>
              <p className="text-sm text-slate-700">Проект: {project.name}</p>
              <p className="text-xs text-slate-500 mt-1">
                Статус: {project.status === "active"
                  ? "Активен"
                  : project.status === "paused"
                  ? "Пауза"
                  : "Завершен"}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
