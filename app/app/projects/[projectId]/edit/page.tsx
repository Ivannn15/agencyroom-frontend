import { notFound, redirect } from "next/navigation";
import { fetchClients, fetchProject } from "../../../../../lib/admin-api";
import { getAdminTokenFromCookies } from "../../../../../lib/admin-token";
import ProjectEditForm from "../ProjectEditForm";
import { updateProject } from "../actions";

type ProjectEditPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectEditPage({ params }: ProjectEditPageProps) {
  const { projectId } = await params;

  if (!projectId) {
    notFound();
  }

  const token = await getAdminTokenFromCookies();
  if (!token) {
    redirect("/login");
  }

  const [project, clients] = await Promise.all([
    fetchProject(token, projectId).catch((err: any) => {
      if (err?.status === 404) {
        notFound();
      }
      throw err;
    }),
    fetchClients(token),
  ]);

  if (!project) {
    notFound();
  }

  const clientsForUi = clients.map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company,
  }));

  const updateProjectAction = updateProject.bind(null, project.id);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
          Редактирование проекта
        </h1>
        <p className="text-sm text-slate-500">
          Измените статус и описание проекта для актуальной картины.
        </p>
      </div>

      <ProjectEditForm
        project={project}
        clients={clientsForUi}
        updateProject={updateProjectAction}
      />
    </div>
  );
}
