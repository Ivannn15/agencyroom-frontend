import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ReportStatus } from '@prisma/client';

interface PaginationOptions {
  page?: number;
  pageSize?: number;
  fromPeriod?: string;
  toPeriod?: string;
}

@Injectable()
export class ClientPortalService {
  constructor(private readonly prisma: PrismaService) {}

  async findReportsForClient(clientId: string, options?: PaginationOptions) {
    const page = Math.max(1, options?.page ?? 1);
    const rawPageSize = options?.pageSize ?? 20;
    const pageSize = Math.min(Math.max(1, rawPageSize), 100);
    const where: Prisma.ReportWhereInput = {
      status: ReportStatus.published,
      project: { clientId }
    };

    if (options?.fromPeriod) {
      where.period = { ...(where.period as Prisma.StringFilter | undefined), gte: options.fromPeriod };
    }
    if (options?.toPeriod) {
      where.period = { ...(where.period as Prisma.StringFilter | undefined), lte: options.toPeriod };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.report.findMany({
        where,
        include: {
          project: {
            include: { client: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      this.prisma.report.count({ where })
    ]);

    return {
      items,
      page,
      pageSize,
      total
    };
  }

  async findReportByIdForClient(id: string, clientId: string) {
    const report = await this.prisma.report.findFirst({
      where: {
        id,
        status: ReportStatus.published,
        project: { clientId }
      },
      include: {
        project: {
          include: { client: true }
        }
      }
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async getSummaryForClient(clientId: string, options?: { fromPeriod?: string; toPeriod?: string }) {
    const where: Prisma.ReportWhereInput = {
      status: ReportStatus.published,
      project: { clientId }
    };

    if (options?.fromPeriod) {
      where.period = { ...(where.period as Prisma.StringFilter | undefined), gte: options.fromPeriod };
    }
    if (options?.toPeriod) {
      where.period = { ...(where.period as Prisma.StringFilter | undefined), lte: options.toPeriod };
    }

    const reports = await this.prisma.report.findMany({
      where,
      select: {
        spend: true,
        revenue: true,
        leads: true,
        cpa: true,
        roas: true
      }
    });

    const aggregate = reports.reduce(
      (acc, report) => {
        acc.totalSpend += report.spend ?? 0;
        acc.totalRevenue += report.revenue ?? 0;
        acc.totalLeads += report.leads ?? 0;
        if (report.cpa !== null && report.cpa !== undefined) {
          acc.cpaSum += report.cpa;
          acc.cpaCount += 1;
        }
        if (report.roas !== null && report.roas !== undefined) {
          acc.roasSum += report.roas;
          acc.roasCount += 1;
        }
        acc.countReports += 1;
        return acc;
      },
      { totalSpend: 0, totalRevenue: 0, totalLeads: 0, cpaSum: 0, cpaCount: 0, roasSum: 0, roasCount: 0, countReports: 0 }
    );

    const avgCpa = aggregate.cpaCount > 0 ? aggregate.cpaSum / aggregate.cpaCount : null;
    const avgRoas = aggregate.roasCount > 0 ? aggregate.roasSum / aggregate.roasCount : null;

    return {
      totalSpend: aggregate.totalSpend,
      totalRevenue: aggregate.totalRevenue,
      totalLeads: aggregate.totalLeads,
      avgCpa,
      avgRoas,
      countReports: aggregate.countReports
    };
  }
}
