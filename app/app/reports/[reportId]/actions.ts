"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/db";

export async function updateReport(reportId: string, formData: FormData) {
  const period = String(formData.get("period") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();

  const spend = formData.get("spend");
  const revenue = formData.get("revenue");
  const leads = formData.get("leads");
  const cpa = formData.get("cpa");
  const roas = formData.get("roas");

  const whatWasDoneRaw = String(formData.get("whatWasDone") ?? "").trim();
  const nextPlanRaw = String(formData.get("nextPlan") ?? "").trim();

  if (!period || !summary) {
    throw new Error("period and summary are required");
  }

  const report = await prisma.report.update({
    where: { id: reportId },
    data: {
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
    include: {
      project: true,
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/reports");
  revalidatePath(`/app/reports/${reportId}`);

  if (report.projectId) {
    revalidatePath(`/app/projects/${report.projectId}`);
  }
  if (report.project?.clientId) {
    revalidatePath(`/app/clients/${report.project.clientId}`);
  }

  redirect(`/app/reports/${reportId}`);
}

export async function deleteReport(reportId: string) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: { project: true },
  });

  if (!report) {
    redirect("/app/reports");
  }

  await prisma.publicReportLink.deleteMany({ where: { reportId: report.id } });
  await prisma.report.delete({ where: { id: report.id } });

  revalidatePath("/app");
  revalidatePath("/app/reports");

  if (report.projectId) {
    revalidatePath(`/app/projects/${report.projectId}`);
  }
  if (report.project?.clientId) {
    revalidatePath(`/app/clients/${report.project.clientId}`);
  }

  redirect("/app/reports");
}

export async function enablePublicLink(reportId: string) {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) {
    throw new Error("Report not found");
  }

  const existing = await prisma.publicReportLink.findFirst({
    where: { reportId },
  });

  let link;

  if (!existing) {
    const publicId = randomUUID().replace(/-/g, "").slice(0, 12);
    link = await prisma.publicReportLink.create({
      data: {
        reportId,
        publicId,
        isActive: true,
      },
    });
  } else {
    link = await prisma.publicReportLink.update({
      where: { id: existing.id },
      data: { isActive: true },
    });
  }

  revalidatePath(`/app/reports/${reportId}`);
  return link;
}

export async function disablePublicLink(reportId: string) {
  await prisma.publicReportLink.updateMany({
    where: { reportId },
    data: { isActive: false },
  });

  revalidatePath(`/app/reports/${reportId}`);
}
