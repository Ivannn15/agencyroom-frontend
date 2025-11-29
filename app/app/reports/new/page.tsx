import { prisma } from "../../../../lib/db";
import ReportsNewForm from "./ReportsNewForm";
import { createReport } from "./actions";

type NewReportPageProps = {
  searchParams: Promise<{ projectId?: string }>;
};

export default async function NewReportPage({ searchParams }: NewReportPageProps) {
  const { projectId: initialProjectId } = await searchParams;

  const [projects, clients] = await Promise.all([
    prisma.project.findMany({
      include: { client: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const projectsForUi = projects.map((p) => ({
    id: p.id,
    name: p.name,
    clientId: p.clientId,
    clientName: p.client?.company ?? p.client?.name ?? "",
  }));

  const clientsForUi = clients.map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company,
  }));

  return (
    <ReportsNewForm
      projects={projectsForUi}
      clients={clientsForUi}
      initialProjectId={initialProjectId}
      createReport={createReport}
    />
  );
}
