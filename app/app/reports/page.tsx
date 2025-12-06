import { redirect } from "next/navigation";
import { fetchClients, fetchReports } from "../../../lib/admin-api";
import { getAdminTokenFromCookies } from "../../../lib/admin-token";
import ReportsPageClient from "./ReportsPageClient";

export default async function ReportsPage() {
  const token = await getAdminTokenFromCookies();
  if (!token) {
    redirect("/login");
  }

  const [reportsResponse, clients] = await Promise.all([
    fetchReports(token, { page: 1, pageSize: 200 }),
    fetchClients(token),
  ]);

  const reports = reportsResponse.items;

  const reportsForUi = reports.map((report) => ({
    id: report.id,
    projectName: report.project?.name ?? "Отчет",
    clientName: report.project?.client?.company ?? report.project?.client?.name ?? "",
    period: report.period,
    summary: report.summary,
    roas: report.roas ?? null,
    status: report.status,
    publishedAt: report.publishedAt ?? null,
    clientId: report.project?.clientId ?? "",
  }));

  const clientsForUi = clients.map((client) => ({
    id: client.id,
    name: client.name,
    company: client.company,
  }));

  return <ReportsPageClient reports={reportsForUi} clients={clientsForUi} />;
}
