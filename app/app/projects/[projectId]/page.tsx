import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { fetchProject } from "../../../../lib/admin-api";
import { getAdminTokenFromCookies } from "../../../../lib/admin-token";
import { deleteProject } from "./actions";
import DeleteProjectButton from "./DeleteProjectButton";
import { Alert } from "../../../../components/ui/Alert";

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function ProjectDetailsPage({ params, searchParams }: ProjectPageProps) {
  const [{ projectId }, { error }] = await Promise.all([params, searchParams]);
  if (!projectId) {
    notFound();
  }

  const token = await getAdminTokenFromCookies();
  if (!token) {
    redirect("/login");
  }

  let project;
  try {
    project = await fetchProject(token, projectId);
  } catch (err: any) {
    if (err?.status === 404) {
      notFound();
    }
    throw err;
  }

  if (!project) {
    notFound();
  }

  const deleteError =
    error === "hasReports"
      ? "Нельзя удалить проект, пока у него есть отчеты. Сначала удалите отчеты этого проекта."
      : null;

  const statusLabel =
    project.status === "active"
      ? "Активен"
      : project.status === "paused"
      ? "Пауза"
      : "Завершен";

  const deleteProjectAction = deleteProject.bind(null, project.id);
  const projectReports = project.reports ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
      {deleteError && (
        <Alert variant="warning">
          {deleteError}
        </Alert>
      )}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-1">Проект</span>
            <span>Статус: {statusLabel}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">{project.name}</h1>
          <p className="text-sm text-slate-500">
            Клиент: {project.client?.company || project.client?.name || "Неизвестный клиент"}
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2">
          <Link
            href={`/app/projects/${project.id}/edit`}
            className="inline-flex items-center text-sm text-sky-600 hover:text-sky-700"
          >
            Редактировать проект
          </Link>
          <Link
            href={`/app/reports/new?projectId=${project.id}`}
            className="shrink-0 inline-flex items-center rounded-lg border border-slate-300 text-slate-700 text-sm font-medium px-3 py-2 hover:bg-slate-50"
          >
            Создать отчет
          </Link>
          <DeleteProjectButton action={deleteProjectAction} />
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Что делаем в этом месяце
          </h2>
          <p className="text-sm text-slate-700">
            Подготовка кампаний, оптимизация ключевых слов и посадочных страниц, регулярный анализ конверсий и бюджетов.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">Отчеты по проекту</h2>
          </div>
          {projectReports.length === 0 ? (
            <p className="text-xs text-slate-500">По этому проекту пока нет отчетов.</p>
          ) : (
            <div className="divide-y divide-slate-100 text-sm">
              {projectReports.map((report) => (
                <div key={report.id} className="py-3 flex items-start justify-between gap-4 transition hover:bg-slate-50 rounded-lg px-2 -mx-2">
                  <div>
                    <div className="font-medium text-slate-900">{project.name}</div>
                    <div className="text-xs text-slate-500">Период: {report.period}</div>
                    <div className="text-xs text-slate-600 mt-1">{report.summary}</div>
                  </div>
                  <Link
                    href={`/app/reports/${report.id}`}
                    className="text-xs px-3 py-1 rounded-full border border-sky-200 text-sky-700 hover:bg-sky-50"
                  >
                    Открыть
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
