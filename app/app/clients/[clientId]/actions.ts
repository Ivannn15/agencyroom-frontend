"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteClient as deleteClientApi, updateClient as updateClientApi } from "../../../../lib/admin-api";
import { requireAdminToken } from "../../../../lib/admin-token";

export async function updateClient(clientId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim();

  if (!name || !email) {
    throw new Error("Name and email are required");
  }

  const token = await requireAdminToken();

  try {
    await updateClientApi(token, clientId, {
      name,
      company,
      contactEmail: email,
    });
  } catch (err: any) {
    if (err?.status === 404) {
      redirect("/app/clients");
    }
    throw err;
  }

  revalidatePath("/app");
  revalidatePath("/app/clients");
  revalidatePath(`/app/clients/${clientId}`);

  redirect(`/app/clients/${clientId}`);
}

export async function deleteClient(clientId: string) {
  const token = await requireAdminToken();

  try {
    await deleteClientApi(token, clientId);
  } catch (err: any) {
    if (err?.status === 404) {
      redirect("/app/clients");
    }
    if (err?.status === 400) {
      redirect(`/app/clients/${clientId}?error=hasProjects`);
    }
    throw err;
  }

  revalidatePath("/app");
  revalidatePath("/app/clients");

  redirect("/app/clients");
}
