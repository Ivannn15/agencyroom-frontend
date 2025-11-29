import { notFound } from "next/navigation";
import { prisma } from "../../../../../lib/db";
import ClientEditForm from "../ClientEditForm";
import { updateClient } from "../actions";

type ClientEditPageProps = {
  params: Promise<{ clientId: string }>;
};

export default async function ClientEditPage({ params }: ClientEditPageProps) {
  const { clientId } = await params;

  if (!clientId) {
    notFound();
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
  });

  if (!client) {
    notFound();
  }

  const updateClientAction = updateClient.bind(null, client.id);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">
        Редактировать клиента
      </h1>

      <ClientEditForm client={client} updateClient={updateClientAction} />
    </div>
  );
}
