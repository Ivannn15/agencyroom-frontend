import { redirect } from "next/navigation";
import { fetchClients, fetchProjects } from "../../../../lib/admin-api";
import { getAdminTokenFromCookies } from "../../../../lib/admin-token";
import ReportsNewForm from "./ReportsNewForm";
import { createReport } from "./actions";

type NewReportPageProps = {
  searchParams: Promise<{ projectId?: string }>;
};

export default async function NewReportPage({ searchParams }: NewReportPageProps) {
  const { projectId: initialProjectId } = await searchParams;

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
