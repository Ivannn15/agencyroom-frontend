import { prisma } from "../../../../lib/db";
import ProjectsNewForm from "./ProjectsNewForm";
import { createProject } from "./actions";

type NewProjectPageProps = {
  searchParams?: { clientId?: string };
};

export default async function NewProjectPage({ searchParams }: NewProjectPageProps) {
  const clients = await prisma.client.findMany({ orderBy: { createdAt: "desc" } });
  const clientsForUi = clients.map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company,
  }));

  return (
    <ProjectsNewForm
      clients={clientsForUi}
      createProject={createProject}
      initialClientId={searchParams?.clientId}
    />
  );
}
