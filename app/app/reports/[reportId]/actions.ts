"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteReport as deleteReportApi,
  disablePublicLink as disablePublicLinkApi,
  enablePublicLink as enablePublicLinkApi,
  fetchReport,
  updateReport as updateReportApi,
} from "../../../../lib/admin-api";
import { requireAdminToken } from "../../../../lib/admin-token";

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

  const token = await requireAdminToken();

  await updateReportApi(token, reportId, {
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

  const updatedReport = await fetchReport(token, reportId).catch(() => null);

  revalidatePath("/app");
  revalidatePath("/app/reports");
  revalidatePath(`/app/reports/${reportId}`);

  if (updatedReport?.projectId) {
    revalidatePath(`/app/projects/${updatedReport.projectId}`);
  }
  if (updatedReport?.project?.clientId) {
    revalidatePath(`/app/clients/${updatedReport.project.clientId}`);
  }

  redirect(`/app/reports/${reportId}`);
}

export async function deleteReport(reportId: string) {
  const token = await requireAdminToken();
  const report = await fetchReport(token, reportId).catch((err: any) => {
    if (err?.status === 404) {
      redirect("/app/reports");
    }
    throw err;
  });

  await deleteReportApi(token, reportId);

  revalidatePath("/app");
  revalidatePath("/app/reports");

  if (report?.projectId) {
    revalidatePath(`/app/projects/${report.projectId}`);
  }
  if (report?.project?.clientId) {
    revalidatePath(`/app/clients/${report.project.clientId}`);
  }

  redirect("/app/reports");
}

export async function enablePublicLink(reportId: string) {
  const token = await requireAdminToken();

  const link = await enablePublicLinkApi(token, reportId);

  revalidatePath(`/app/reports/${reportId}`);
  return link;
}

export async function disablePublicLink(reportId: string) {
  const token = await requireAdminToken();

  await disablePublicLinkApi(token, reportId);

  revalidatePath(`/app/reports/${reportId}`);
}
