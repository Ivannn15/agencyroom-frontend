import { PrismaClient, ProjectStatus, UserRole } from "@prisma/client";
import { mockClients, mockProjects, mockReports } from "../lib/mockData";

const prisma = new PrismaClient();

async function main() {
  await prisma.publicReportLink.deleteMany();
  await prisma.report.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.agency.deleteMany();

  const agency = await prisma.agency.create({
    data: {
      id: "agency_demo",
      name: "Demo Agency",
      slug: "demo-agency",
      primaryEmail: "demo@agency.com",
      timezone: "Europe/Moscow",
      currency: "RUB",
    },
  });

  await prisma.user.create({
    data: {
      id: "user_demo",
      email: "demo@agency.com",
      name: "Demo Owner",
      role: UserRole.owner,
      agencyId: agency.id,
    },
  });

  for (const client of mockClients) {
    await prisma.client.create({
      data: {
        id: client.id,
        agencyId: agency.id,
        name: client.name,
        company: client.company,
        contactEmail: client.contactEmail,
        createdAt: new Date(client.createdAt),
      },
    });
  }

  for (const project of mockProjects) {
    await prisma.project.create({
      data: {
        id: project.id,
        clientId: project.clientId,
        name: project.name,
        status: project.status as ProjectStatus,
        notes: "Initial seeded project",
      },
    });
  }

  for (const report of mockReports) {
    await prisma.report.create({
      data: {
        id: report.id,
        projectId: report.projectId ?? "",
        period: report.period,
        summary: report.summary,
        spend: report.spend ?? null,
        revenue: report.revenue ?? null,
        leads: report.leads ?? null,
        cpa: report.cpa ?? null,
        roas: report.roas ?? null,
        whatWasDone: report.whatWasDone ?? ["Initial seeded report"],
        nextPlan: report.nextPlan ?? ["Fill real plan later"],
      },
    });
  }

  for (const report of mockReports) {
    await prisma.publicReportLink.create({
      data: {
        reportId: report.id,
        publicId: `pub_${report.id}`,
        isActive: true,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
