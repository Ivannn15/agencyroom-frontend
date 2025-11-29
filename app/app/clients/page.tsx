import { prisma } from "../../../lib/db";
import ClientsPageClient from "./ClientsPageClient";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
  });

  const clientsForUi = clients.map((client) => ({
    id: client.id,
    name: client.name,
    company: client.company,
    contactEmail: client.contactEmail,
    createdAt: client.createdAt.toISOString().slice(0, 10),
  }));

  return <ClientsPageClient initialClients={clientsForUi} />;
}
