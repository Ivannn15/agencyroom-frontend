import { prisma } from "../../../lib/db";
import ProjectsPageClient from "./ProjectsPageClient";

export default async function ProjectsPage() {
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
    status: p.status,
    clientId: p.clientId,
    clientName: p.client?.company ?? p.client?.name ?? "",
  }));

  const clientsForUi = clients.map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company,
  }));

  const total = projects.length;
  const activeCount = projects.filter((p) => p.status === "active").length;
  const pausedCount = projects.filter((p) => p.status === "paused").length;

  return (
    <ProjectsPageClient
      projects={projectsForUi}
      clients={clientsForUi}
      total={total}
      activeCount={activeCount}
      pausedCount={pausedCount}
    />
  );
}
