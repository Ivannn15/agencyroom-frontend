"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/db";

export async function updateProject(projectId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const clientId = String(formData.get("clientId") ?? "").trim();
  const status = (formData.get("status") ?? "active") as
    | "active"
    | "paused"
    | "completed";
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!name || !clientId) {
    throw new Error("Name and clientId are required");
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      name,
      clientId,
      status,
      notes,
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/projects");
  revalidatePath(`/app/projects/${projectId}`);
  revalidatePath(`/app/clients/${clientId}`);

  redirect(`/app/projects/${projectId}`);
}

export async function deleteProject(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: true },
  });

  if (!project) {
    redirect("/app/projects");
  }

  const reportsCount = await prisma.report.count({ where: { projectId } });
  if (reportsCount > 0) {
    redirect(`/app/projects/${projectId}?error=hasReports`);
  }

  await prisma.project.delete({ where: { id: projectId } });

  revalidatePath("/app");
  revalidatePath("/app/projects");
  if (project.clientId) {
    revalidatePath(`/app/clients/${project.clientId}`);
  }

  redirect("/app/projects");
}
