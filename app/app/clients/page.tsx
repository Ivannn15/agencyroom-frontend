import { redirect } from "next/navigation";
import { fetchClients } from "../../../lib/admin-api";
import { getAdminTokenFromCookies } from "../../../lib/admin-token";
import ClientsPageClient from "./ClientsPageClient";

export default async function ClientsPage() {
  const token = await getAdminTokenFromCookies();
  if (!token) {
    redirect("/login");
  }

  const clients = await fetchClients(token);

  const clientsForUi = clients.map((client) => ({
    id: client.id,
    name: client.name,
    company: client.company,
    contactEmail: client.contactEmail,
    createdAt: client.createdAt?.slice(0, 10) ?? "",
  }));

  return <ClientsPageClient initialClients={clientsForUi} />;
}
