import {
  mockClients,
  mockProjects,
  mockReports,
} from "../../../../lib/mockData";

type ClientPageProps = {
  params: Promise<{ clientId: string }>;
};

export default async function ClientDetailsPage({ params }: ClientPageProps) {
  const { clientId } = await params;
  const client = mockClients.find((c) => c.id === clientId);

  if (!client) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-slate-900">
          Клиент не найден
        </h1>
        <p className="text-sm text-slate-500">
          Возможно, ссылка устарела или клиент был удален.
        </p>
      </div>
    );
  }

  const projects = mockProjects.filter((p) => p.clientId === client.id);
  const reports = mockReports.filter((r) => r.clientId === client.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          {client.company || client.name}
        </h1>
        <p className="text-sm text-slate-500">
          Клиент: {client.name} · Email: {client.contactEmail}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          В системе с {client.createdAt}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Проекты
          </h2>
          {projects.length === 0 ? (
            <p className="text-xs text-slate-500">
              Пока нет активных проектов.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-slate-900">
                      {project.name}
                    </div>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full border border-slate-200 text-slate-600"
                  >
                    {project.status === "active"
                      ? "Активен"
                      : project.status === "paused"
                      ? "Пауза"
                      : "Завершен"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Последние отчеты
          </h2>
          {reports.length === 0 ? (
            <p className="text-xs text-slate-500">
              По этому клиенту отчётов пока нет.
            </p>
          ) : (
            <ul className="space-y-3 text-sm">
              {reports.map((report) => (
                <li key={report.id}>
                  <div className="font-medium text-slate-900">
                    {report.projectName}
                  </div>
                  <div className="text-xs text-slate-500">
                    Период: {report.period}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {report.summary}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
