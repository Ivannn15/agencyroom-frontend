import { prisma } from "../../../lib/db";
import ReportsPageClient from "./ReportsPageClient";

export default async function ReportsPage() {
  const [reports, clients] = await Promise.all([
    prisma.report.findMany({
      include: {
        project: {
          include: { client: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const reportsForUi = reports.map((report) => ({
    id: report.id,
    projectName: report.project?.name ?? "Отчет",
    clientName: report.project?.client?.company ?? report.project?.client?.name ?? "",
    period: report.period,
    summary: report.summary,
    roas: report.roas ?? null,
    status: report.status,
    publishedAt: report.publishedAt ? report.publishedAt.toISOString() : null,
    clientId: report.project?.clientId ?? "",
  }));

  const clientsForUi = clients.map((client) => ({
    id: client.id,
    name: client.name,
    company: client.company,
  }));

  return <ReportsPageClient reports={reportsForUi} clients={clientsForUi} />;
}
