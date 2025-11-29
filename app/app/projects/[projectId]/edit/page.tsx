import { notFound } from "next/navigation";
import { prisma } from "../../../../../lib/db";
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

  const [project, clients] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId } }),
    prisma.client.findMany({ orderBy: { createdAt: "desc" } }),
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
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">
        Редактировать проект
      </h1>

      <ProjectEditForm
        project={project}
        clients={clientsForUi}
        updateProject={updateProjectAction}
      />
    </div>
  );
}
