import { PrismaClient, ProjectStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const mockClients = [
  {
    id: 'client_alpha',
    name: 'Alpha Retail',
    company: 'Alpha Retail LLC',
    contactEmail: 'owner@alpharetail.com'
  },
  {
    id: 'client_beta',
    name: 'Beta Labs',
    company: 'Beta Labs Inc',
    contactEmail: 'hello@betalabs.io'
  }
];

const mockProjects = [
  { id: 'project_alpha_ads', clientId: 'client_alpha', name: 'Search Ads', status: ProjectStatus.active },
  { id: 'project_beta_social', clientId: 'client_beta', name: 'Social Campaign', status: ProjectStatus.paused }
];

const mockReports = [
  {
    id: 'report_alpha_jan',
    clientId: 'client_alpha',
    projectId: 'project_alpha_ads',
    period: '2025-01',
    summary: 'January performance summary',
    spend: 12000,
    revenue: 42000,
    leads: 180,
    cpa: 66.6,
    roas: 3.5,
    whatWasDone: ['Optimized keywords', 'Launched new ad groups'],
    nextPlan: ['Test remarketing', 'Expand to new regions']
  },
  {
    id: 'report_beta_jan',
    clientId: 'client_beta',
    projectId: 'project_beta_social',
    period: '2025-01',
    summary: 'January social performance',
    spend: 8000,
    revenue: 24000,
    leads: 90,
    cpa: 88.8,
    roas: 3.0,
    whatWasDone: ['Refreshed creatives', 'Adjusted targeting'],
    nextPlan: ['Introduce video ads', 'A/B test headlines']
  }
];

async function main() {
  await prisma.publicReportLink.deleteMany();
  await prisma.report.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.agency.deleteMany();

  const agency = await prisma.agency.create({
    data: {
      id: 'agency_demo',
      name: 'Demo Agency',
      slug: 'demo-agency',
      primaryEmail: 'demo@agency.com',
      timezone: 'Europe/Moscow',
      currency: 'RUB'
    }
  });

  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.user.create({
    data: {
      id: 'user_demo',
      email: 'demo@agency.com',
      name: 'Demo Owner',
      role: UserRole.owner,
      agencyId: agency.id,
      passwordHash
    }
  });

  for (const client of mockClients) {
    await prisma.client.create({
      data: {
        id: client.id,
        agencyId: agency.id,
        name: client.name,
        company: client.company,
        contactEmail: client.contactEmail
      }
    });
  }

  for (const project of mockProjects) {
    await prisma.project.create({
      data: {
        id: project.id,
        clientId: project.clientId,
        name: project.name,
        status: project.status,
        notes: 'Seeded project'
      }
    });
  }

  for (const report of mockReports) {
    await prisma.report.create({
      data: {
        id: report.id,
        projectId: report.projectId,
        period: report.period,
        summary: report.summary,
        spend: report.spend,
        revenue: report.revenue,
        leads: report.leads,
        cpa: report.cpa,
        roas: report.roas,
        whatWasDone: report.whatWasDone,
        nextPlan: report.nextPlan
      }
    });
  }

  for (const report of mockReports) {
    await prisma.publicReportLink.create({
      data: {
        reportId: report.id,
        publicId: `pub_${report.id}`,
        isActive: true
      }
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
