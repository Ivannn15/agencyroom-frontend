import { notFound, redirect } from "next/navigation";
import { fetchClient } from "../../../../../lib/admin-api";
import { getAdminTokenFromCookies } from "../../../../../lib/admin-token";
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

  const token = await getAdminTokenFromCookies();
  if (!token) {
    redirect("/login");
  }

  let client;
  try {
    client = await fetchClient(token, clientId);
  } catch (err: any) {
    if (err?.status === 404) {
      notFound();
    }
    throw err;
  }

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
