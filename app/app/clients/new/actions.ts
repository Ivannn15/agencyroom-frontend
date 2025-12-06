"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createClientApi } from "../../../../lib/admin-api";
import { requireAdminToken } from "../../../../lib/admin-token";

export async function createClient(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim();

  if (!name || !email) {
    throw new Error("Name and email are required");
  }

  const token = await requireAdminToken();

  const client = await createClientApi(token, {
    name,
    company,
    contactEmail: email,
  });

  revalidatePath("/app");
  revalidatePath("/app/clients");

  redirect(`/app/clients/${client.id}`);
}
