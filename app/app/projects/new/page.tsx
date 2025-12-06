import { redirect } from "next/navigation";
import { fetchClients } from "../../../../lib/admin-api";
import { getAdminTokenFromCookies } from "../../../../lib/admin-token";
import ProjectsNewForm from "./ProjectsNewForm";
import { createProject } from "./actions";

type NewProjectPageProps = {
  searchParams: Promise<{ clientId?: string }>;
};

export default async function NewProjectPage({ searchParams }: NewProjectPageProps) {
  const { clientId: initialClientId } = await searchParams;
  const token = await getAdminTokenFromCookies();
  if (!token) {
    redirect("/login");
  }

  const clients = await fetchClients(token);
  const clientsForUi = clients.map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company,
  }));

  return (
    <ProjectsNewForm
      clients={clientsForUi}
      createProject={createProject}
      initialClientId={initialClientId}
    />
  );
}
