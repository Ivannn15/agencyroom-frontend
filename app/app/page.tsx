import {
  mockClients,
  mockProjects,
  mockReports,
} from "../../lib/mockData";

export default function AppDashboardPage() {
  const totalClients = mockClients.length;
  const activeProjects = mockProjects.filter(
    (p) => p.status === "active"
  ).length;
  const reportsThisMonth = mockReports.length; // пока так

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">
        Обзор агентства
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="text-xs text-slate-500 mb-1">Клиенты</div>
          <div className="text-2xl font-semibold">{totalClients}</div>
          <div className="text-xs text-slate-400 mt-1">
            Активных в системе
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="text-xs text-slate-500 mb-1">Активные проекты</div>
          <div className="text-2xl font-semibold">{activeProjects}</div>
          <div className="text-xs text-slate-400 mt-1">
            В работе прямо сейчас
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="text-xs text-slate-500 mb-1">
            Отчетов за последний период
          </div>
          <div className="text-2xl font-semibold">{reportsThisMonth}</div>
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
          {mockReports.map((report) => (
            <div
              key={report.id}
              className="py-3 flex items-start justify-between gap-4"
            >
              <div>
                <div className="font-medium text-slate-900">
                  {report.projectName}
                </div>
                <div className="text-xs text-slate-500">
                  {report.clientName} · {report.period}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {report.summary}
                </div>
              </div>
              <button className="text-xs px-3 py-1 rounded-full border border-sky-200 text-sky-700 hover:bg-sky-50">
                Открыть
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
