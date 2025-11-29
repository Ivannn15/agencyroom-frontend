"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/db";

export async function updateClient(clientId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim();

  if (!name || !email) {
    throw new Error("Name and email are required");
  }

  await prisma.client.update({
    where: { id: clientId },
    data: {
      name,
      company,
      contactEmail: email,
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/clients");
  revalidatePath(`/app/clients/${clientId}`);

  redirect(`/app/clients/${clientId}`);
}

export async function deleteClient(clientId: string) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
  });

  if (!client) {
    redirect("/app/clients");
  }

  const projectsCount = await prisma.project.count({
    where: { clientId },
  });

  if (projectsCount > 0) {
    redirect(`/app/clients/${clientId}?error=hasProjects`);
  }

  await prisma.client.delete({
    where: { id: clientId },
  });

  revalidatePath("/app");
  revalidatePath("/app/clients");

  redirect("/app/clients");
}
