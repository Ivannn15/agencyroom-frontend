import { PrismaClient, ProjectStatus, ReportStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'password123';

const agencyData = {
  id: 'agency_demo',
  name: 'Demo Agency',
  slug: 'demo-agency',
  primaryEmail: 'demo@agency.com',
  timezone: 'Europe/Moscow',
  currency: 'RUB'
};

const clientsData = [
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

const projectsData = [
  { id: 'project_alpha_ads', clientId: 'client_alpha', name: 'Search Ads', status: ProjectStatus.active, notes: 'Seeded project' },
  { id: 'project_beta_social', clientId: 'client_beta', name: 'Social Campaign', status: ProjectStatus.paused, notes: 'Seeded project' }
];

const reportsData = [
  {
    id: 'report_alpha_jan',
    projectId: 'project_alpha_ads',
    period: '2025-01',
    summary: 'January performance summary',
    status: ReportStatus.published,
    publishedAt: new Date('2025-02-01T00:00:00.000Z'),
    spend: 12000,
    revenue: 42000,
    leads: 180,
    cpa: 66.6,
    roas: 3.5,
    whatWasDone: ['Optimized keywords', 'Launched new ad groups'],
    nextPlan: ['Test remarketing', 'Expand to new regions'],
    publicId: 'pub_report_alpha_jan'
  },
  {
    id: 'report_beta_jan',
    projectId: 'project_beta_social',
    period: '2025-01',
    summary: 'January social performance',
    status: ReportStatus.published,
    publishedAt: new Date('2025-02-02T00:00:00.000Z'),
    spend: 8000,
    revenue: 24000,
    leads: 90,
    cpa: 88.8,
    roas: 3.0,
    whatWasDone: ['Refreshed creatives', 'Adjusted targeting'],
    nextPlan: ['Introduce video ads', 'A/B test headlines'],
    publicId: 'pub_report_beta_jan'
  }
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await prisma.agency.upsert({
    where: { slug: agencyData.slug },
    update: {
      name: agencyData.name,
      primaryEmail: agencyData.primaryEmail,
      timezone: agencyData.timezone,
      currency: agencyData.currency
    },
    create: agencyData
  });

  await prisma.user.upsert({
    where: { email: 'demo@agency.com' },
    update: {
      name: 'Demo Owner',
      role: UserRole.owner,
      agencyId: agencyData.id,
      passwordHash
    },
    create: {
      id: 'user_demo',
      email: 'demo@agency.com',
      name: 'Demo Owner',
      role: UserRole.owner,
      agencyId: agencyData.id,
      passwordHash
    }
  });

  for (const client of clientsData) {
    await prisma.client.upsert({
      where: { id: client.id },
      update: {
        name: client.name,
        company: client.company,
        contactEmail: client.contactEmail
      },
      create: {
        ...client,
        agencyId: agencyData.id
      }
    });
  }

  for (const project of projectsData) {
    await prisma.project.upsert({
      where: { id: project.id },
      update: {
        name: project.name,
        status: project.status,
        notes: project.notes,
        clientId: project.clientId
      },
      create: {
        ...project
      }
    });
  }

  for (const report of reportsData) {
    await prisma.report.upsert({
      where: { id: report.id },
      update: {
        period: report.period,
        summary: report.summary,
        status: report.status,
        publishedAt: report.publishedAt,
        spend: report.spend,
        revenue: report.revenue,
        leads: report.leads,
        cpa: report.cpa,
        roas: report.roas,
        whatWasDone: report.whatWasDone,
        nextPlan: report.nextPlan,
        projectId: report.projectId
      },
      create: {
        id: report.id,
        projectId: report.projectId,
        period: report.period,
        summary: report.summary,
        status: report.status,
        publishedAt: report.publishedAt,
        spend: report.spend,
        revenue: report.revenue,
        leads: report.leads,
        cpa: report.cpa,
        roas: report.roas,
        whatWasDone: report.whatWasDone,
        nextPlan: report.nextPlan
      }
    });

    await prisma.publicReportLink.upsert({
      where: { reportId: report.id },
      update: {
        isActive: true,
        publicId: report.publicId
      },
      create: {
        reportId: report.id,
        publicId: report.publicId,
        isActive: true
      }
    });
  }

  await prisma.user.upsert({
    where: { email: 'client@alpharetail.com' },
    update: {
      name: 'Client Alpha',
      role: UserRole.client,
      agencyId: agencyData.id,
      clientId: 'client_alpha',
      passwordHash
    },
    create: {
      id: 'user_client_alpha',
      email: 'client@alpharetail.com',
      name: 'Client Alpha',
      role: UserRole.client,
      agencyId: agencyData.id,
      clientId: 'client_alpha',
      passwordHash
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
