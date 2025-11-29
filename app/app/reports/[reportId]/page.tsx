import {
  mockReports,
  mockProjects,
  mockClients,
} from "../../../../lib/mockData";

type ReportPageProps = {
  params: Promise<{ reportId: string }>;
};

export default async function ReportDetailsPage({ params }: ReportPageProps) {
  const { reportId } = await params;
  const report = mockReports.find((r) => r.id === reportId);

  if (!report) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-slate-900">
          Отчет не найден
        </h1>
        <p className="text-sm text-slate-500">
          Возможно, ссылка устарела или отчет был удален.
        </p>
      </div>
    );
  }

  const project = report.projectId
    ? mockProjects.find((p) => p.id === report.projectId)
    : undefined;
  const client = mockClients.find((c) => c.id === report.clientId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          {report.projectName}
        </h1>
        <p className="text-sm text-slate-500">
          Клиент: {client?.company || client?.name || report.clientName} ·{" "}
          Период: {report.period}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Краткое резюме
        </h2>
        <p className="text-sm text-slate-700">{report.summary}</p>
      </div>

      {project && (
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Информация о проекте
          </h2>
          <p className="text-sm text-slate-700">
            Проект: {project.name}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Статус:{" "}
            {project.status === "active"
              ? "Активен"
              : project.status === "paused"
              ? "Пауза"
              : "Завершен"}
          </p>
        </div>
      )}
    </div>
  );
}
