import { prisma } from "../../lib/db";

export default async function AppDashboardPage() {
  const [clientsCount, projects, reports] = await Promise.all([
    prisma.client.count(),
    prisma.project.findMany({ select: { status: true } }),
    prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        project: {
          include: { client: true },
        },
      },
    }),
  ]);

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const reportsCount = await prisma.report.count();

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-8">
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">AgencyRoom</p>
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
          Обзор агентства
        </h1>
        <p className="text-sm text-slate-500">
          Быстрый взгляд на клиентов, проекты и последние отчеты.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">Клиенты</div>
            <span className="text-lg">👥</span>
          </div>
          <div className="text-3xl font-semibold mt-1 text-slate-900">{clientsCount}</div>
          <div className="text-xs text-slate-400 mt-1">
            Активных в системе
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">Активные проекты</div>
            <span className="text-lg">🚀</span>
          </div>
          <div className="text-3xl font-semibold mt-1 text-slate-900">{activeProjects}</div>
          <div className="text-xs text-slate-400 mt-1">
            В работе прямо сейчас
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">Отчеты за период</div>
            <span className="text-lg">📊</span>
          </div>
          <div className="text-3xl font-semibold mt-1 text-slate-900">{reportsCount}</div>
          <div className="text-xs text-slate-400 mt-1">
            Готово к отправке клиентам
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Последние отчеты
          </h2>
        </div>
        <div className="divide-y divide-slate-100 text-sm">
          {reports.map((report) => (
            <div
              key={report.id}
              className="py-3 flex items-start justify-between gap-4 transition hover:bg-slate-50 rounded-lg px-2 -mx-2"
            >
              <div>
                <div className="font-medium text-slate-900">
                  {report.project?.name || "Отчет"}
                </div>
                <div className="text-xs text-slate-500">
                  {report.project?.client?.company || report.project?.client?.name || ""} · {report.period}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {report.summary}
                </div>
              </div>
              <div className="text-xs px-3 py-1 rounded-full border border-sky-200 text-sky-700">
                Отчет
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
