"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/db";

export async function createProject(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const clientId = String(formData.get("clientId") ?? "").trim();
  const status = (formData.get("status") ?? "active") as "active" | "paused" | "completed";
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!name || !clientId) {
    throw new Error("Name and client are required");
  }

  const project = await prisma.project.create({
    data: {
      name,
      clientId,
      status,
      notes,
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/projects");
  revalidatePath(`/app/clients/${clientId}`);

  redirect(`/app/projects/${project.id}`);
}
