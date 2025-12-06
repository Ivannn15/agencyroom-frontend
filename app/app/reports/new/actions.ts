"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createReport as createReportApi, fetchProject } from "../../../../lib/admin-api";
import { requireAdminToken } from "../../../../lib/admin-token";

export async function createReport(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const period = String(formData.get("period") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();

  const spend = formData.get("spend");
  const revenue = formData.get("revenue");
  const leads = formData.get("leads");
  const cpa = formData.get("cpa");
  const roas = formData.get("roas");
  const whatWasDoneRaw = String(formData.get("whatWasDone") ?? "").trim();
  const nextPlanRaw = String(formData.get("nextPlan") ?? "").trim();

  if (!projectId || !period || !summary) {
    throw new Error("projectId, period and summary are required");
  }

  const token = await requireAdminToken();
  const project = await fetchProject(token, projectId).catch((err: any) => {
    if (err?.status === 404) {
      throw new Error("Project not found");
    }
    throw err;
  });

  const report = await createReportApi(token, {
    projectId,
    period,
    summary,
    spend: spend ? Number(spend) : null,
    revenue: revenue ? Number(revenue) : null,
    leads: leads ? Number(leads) : null,
    cpa: cpa ? Number(cpa) : null,
    roas: roas ? Number(roas) : null,
    whatWasDone:
      whatWasDoneRaw.length > 0
        ? whatWasDoneRaw.split("\n").map((s) => s.trim()).filter(Boolean)
        : null,
    nextPlan:
      nextPlanRaw.length > 0
        ? nextPlanRaw.split("\n").map((s) => s.trim()).filter(Boolean)
        : null,
  });

  revalidatePath("/app");
  revalidatePath("/app/reports");
  revalidatePath(`/app/projects/${projectId}`);
  if (project?.clientId) {
    revalidatePath(`/app/clients/${project.clientId}`);
  }

  redirect(`/app/reports/${report.id}`);
}
