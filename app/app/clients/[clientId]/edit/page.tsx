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
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
          Редактирование клиента
        </h1>
        <p className="text-sm text-slate-500">
          Обновите контактные данные и информацию о компании.
        </p>
      </div>

      <ClientEditForm client={client} updateClient={updateClientAction} />
    </div>
  );
}
