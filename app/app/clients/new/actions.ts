"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/db";

export async function createClient(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim();

  if (!name || !email) {
    throw new Error("Name and email are required");
  }

  const agency = await prisma.agency.findFirst();
  if (!agency) {
    throw new Error("No agency found");
  }

  const client = await prisma.client.create({
    data: {
      name,
      company,
      contactEmail: email,
      agencyId: agency.id,
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/clients");

  redirect(`/app/clients/${client.id}`);
}
