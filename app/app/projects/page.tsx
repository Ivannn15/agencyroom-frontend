import { redirect } from "next/navigation";
import { fetchClients, fetchProjects } from "../../../lib/admin-api";
import { getAdminTokenFromCookies } from "../../../lib/admin-token";
import ProjectsPageClient from "./ProjectsPageClient";

export default async function ProjectsPage() {
  const token = await getAdminTokenFromCookies();
  if (!token) {
    redirect("/login");
  }

  const [projects, clients] = await Promise.all([
    fetchProjects(token),
    fetchClients(token),
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
