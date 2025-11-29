"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/db";

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

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new Error("Project not found");
  }

  const report = await prisma.report.create({
    data: {
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
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/reports");
  revalidatePath(`/app/projects/${projectId}`);
  revalidatePath(`/app/clients/${project.clientId}`);

  redirect(`/app/reports/${report.id}`);
}
