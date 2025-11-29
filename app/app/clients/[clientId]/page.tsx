import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/db";
import DeleteClientButton from "./DeleteClientButton";
import { deleteClient } from "./actions";
import { Alert } from "../../../../components/ui/Alert";

type ClientPageProps = {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function ClientDetailsPage({ params, searchParams }: ClientPageProps) {
  const [{ clientId }, { error }] = await Promise.all([params, searchParams]);
  if (!clientId) {
    notFound();
  }
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { projects: true },
  });

  if (!client) {
    notFound();
  }

  const deleteError =
    error === "hasProjects"
      ? "Нельзя удалить клиента, пока у него есть проекты. Сначала удалите проекты и их отчеты."
      : null;

  const deleteClientAction = deleteClient.bind(null, client.id);

  const reports = await prisma.report.findMany({
    where: { project: { clientId } },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
      {deleteError && (
        <Alert variant="warning">
          {deleteError}
        </Alert>
      )}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            {client.company || client.name}
          </h1>
          <p className="text-sm text-slate-500">
            Клиент: {client.name} · Email: {client.contactEmail}
          </p>
          <p className="text-xs md:text-sm text-slate-400">
            В системе с {client.createdAt.toISOString().slice(0, 10)}
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2">
          <Link
            href={`/app/clients/${client.id}/edit`}
            className="inline-flex items-center text-sm text-sky-600 hover:text-sky-700"
          >
            Редактировать
          </Link>
        <Link
            href={`/app/projects/new?clientId=${client.id}`}
            className="shrink-0 inline-flex items-center rounded-lg border border-slate-300 text-slate-700 text-sm font-medium px-3 py-2 hover:bg-slate-50"
          >
            Создать проект
          </Link>
          <DeleteClientButton action={deleteClientAction} />
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Проекты
            </h2>
            {client.projects.length === 0 ? (
              <p className="text-xs text-slate-500">
                Пока нет активных проектов.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {client.projects.map((project) => (
                  <li
                    key={project.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <Link
                        href={`/app/projects/${project.id}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {project.name}
                      </Link>
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
                      {report.project?.name || report.id}
                    </div>
                    <div className="text-xs text-slate-500">
                      Период: {report.period}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      {report.summary}
                    </div>
                    <div className="mt-1">
                      <Link
                        href={`/app/reports/${report.id}`}
                        className="text-xs text-sky-700 hover:underline"
                      >
                        Открыть отчет
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
