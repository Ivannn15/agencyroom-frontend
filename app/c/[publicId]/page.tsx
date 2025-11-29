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
    <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-slate-50">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-sm p-6 space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{project?.name || "Отчет"}</h1>
          <p className="text-sm text-slate-500">
            Клиент: {client?.company || client?.name || ""} · Период: {report.period}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100">
            <div className="text-xs text-slate-500 mb-1">ROAS</div>
            <div className="text-2xl font-semibold">
              {report.roas != null ? report.roas.toFixed(1) : "—"}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100">
            <div className="text-xs text-slate-500 mb-1">Расход</div>
            <div className="text-2xl font-semibold">
              {report.spend != null ? report.spend.toLocaleString("ru-RU") + " ₽" : "—"}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100">
            <div className="text-xs text-slate-500 mb-1">Выручка</div>
            <div className="text-2xl font-semibold">
              {report.revenue != null
                ? report.revenue.toLocaleString("ru-RU") + " ₽"
                : "—"}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100">
            <div className="text-xs text-slate-500 mb-1">Лиды</div>
            <div className="text-2xl font-semibold">
              {report.leads != null ? report.leads.toLocaleString("ru-RU") : "—"}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100">
            <div className="text-xs text-slate-500 mb-1">CPA</div>
            <div className="text-2xl font-semibold">
              {report.cpa != null ? report.cpa.toLocaleString("ru-RU") + " ₽" : "—"}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Краткое резюме</h2>
            <p className="text-sm text-slate-700">{report.summary}</p>
          </div>

          {whatWasDone && whatWasDone.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Что делали</h2>
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                {whatWasDone.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {nextPlan && nextPlan.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Выводы и план</h2>
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                {nextPlan.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {project && (
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
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
        </div>
      </div>
    </main>
  );
}
