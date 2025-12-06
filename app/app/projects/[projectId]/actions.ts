"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteProject as deleteProjectApi, fetchProject, updateProject as updateProjectApi } from "../../../../lib/admin-api";
import { requireAdminToken } from "../../../../lib/admin-token";

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

  const token = await requireAdminToken();

  try {
    await updateProjectApi(token, projectId, {
      name,
      clientId,
      status,
      notes,
    });
  } catch (err: any) {
    if (err?.status === 404) {
      redirect("/app/projects");
    }
    throw err;
  }

  revalidatePath("/app");
  revalidatePath("/app/projects");
  revalidatePath(`/app/projects/${projectId}`);
  revalidatePath(`/app/clients/${clientId}`);

  redirect(`/app/projects/${projectId}`);
}

export async function deleteProject(projectId: string) {
  const token = await requireAdminToken();
  let project;
  try {
    project = await fetchProject(token, projectId);
  } catch (err: any) {
    if (err?.status === 404) {
      redirect("/app/projects");
    }
    throw err;
  }

  try {
    await deleteProjectApi(token, projectId);
  } catch (err: any) {
    if (err?.status === 400) {
      redirect(`/app/projects/${projectId}?error=hasReports`);
    }
    throw err;
  }

  revalidatePath("/app");
  revalidatePath("/app/projects");
  if (project.clientId) {
    revalidatePath(`/app/clients/${project.clientId}`);
  }

  redirect("/app/projects");
}
