import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/db";
import { deleteProject } from "./actions";
import DeleteProjectButton from "./DeleteProjectButton";

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectDetailsPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  if (!projectId) {
    notFound();
  }
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: true,
      reports: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!project) {
    notFound();
  }

  const statusLabel =
    project.status === "active"
      ? "Активен"
      : project.status === "paused"
      ? "Пауза"
      : "Завершен";

  const deleteProjectAction = deleteProject.bind(null, project.id);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{project.name}</h1>
          <p className="text-sm text-slate-500">
            Клиент: {project.client?.company || project.client?.name || "Неизвестный клиент"} · Статус: {statusLabel}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
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

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-2">
          Что делаем в этом месяце
        </h2>
        <p className="text-sm text-slate-700">
          Подготовка кампаний, оптимизация ключевых слов и посадочных страниц, регулярный анализ конверсий и бюджетов.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">Отчеты по проекту</h2>
        </div>
        {project.reports.length === 0 ? (
          <p className="text-xs text-slate-500">По этому проекту пока нет отчетов.</p>
        ) : (
          <div className="divide-y divide-slate-100 text-sm">
            {project.reports.map((report) => (
              <div key={report.id} className="py-3 flex items-start justify-between gap-4">
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
  );
}
