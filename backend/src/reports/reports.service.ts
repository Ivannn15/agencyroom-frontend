import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ReportStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReportDto, agencyId: string) {
    await this.ensureProjectAccess(dto.projectId, agencyId);
    return this.prisma.report.create({
      data: {
        projectId: dto.projectId,
        period: dto.period,
        summary: dto.summary,
        status: ReportStatus.draft,
        publishedAt: null,
        spend: dto.spend,
        revenue: dto.revenue,
        leads: dto.leads,
        cpa: dto.cpa,
        roas: dto.roas,
        whatWasDone: dto.whatWasDone,
        nextPlan: dto.nextPlan
      }
    });
  }

  findAll(
    agencyId: string,
    projectId?: string,
    onlyPublished?: boolean,
    options?: { page?: number; pageSize?: number; fromPeriod?: string; toPeriod?: string }
  ) {
    const page = Math.max(1, options?.page ?? 1);
    const rawPageSize = options?.pageSize ?? 20;
    const pageSize = Math.min(Math.max(1, rawPageSize), 100);
    const where = this.buildWhere(agencyId, {
      projectId,
      onlyPublished,
      fromPeriod: options?.fromPeriod,
      toPeriod: options?.toPeriod
    });

    return this.prisma.$transaction(async (tx) => {
      const [items, total] = await Promise.all([
        tx.report.findMany({
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
        tx.report.count({ where })
      ]);

      return {
        items,
        page,
        pageSize,
        total
      };
    });
  }

  async findOne(id: string, agencyId: string) {
    const report = await this.prisma.report.findFirst({
      where: {
        id,
        project: { client: { agencyId } }
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

  async update(id: string, agencyId: string, dto: UpdateReportDto) {
    await this.ensureReportAccess(id, agencyId);
    return this.prisma.report.update({
      where: { id },
      data: dto
    });
  }

  async getSummary(agencyId: string, options?: { projectId?: string; fromPeriod?: string; toPeriod?: string; onlyPublished?: boolean }) {
    const where = this.buildWhere(agencyId, {
      projectId: options?.projectId,
      fromPeriod: options?.fromPeriod,
      toPeriod: options?.toPeriod,
      onlyPublished: options?.onlyPublished
    });

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

  async publish(id: string, agencyId: string) {
    await this.ensureReportAccess(id, agencyId);
    return this.prisma.report.update({
      where: { id },
      data: {
        status: ReportStatus.published,
        publishedAt: new Date()
      }
    });
  }

  async unpublish(id: string, agencyId: string) {
    await this.ensureReportAccess(id, agencyId);
    return this.prisma.report.update({
      where: { id },
      data: {
        status: ReportStatus.draft,
        publishedAt: null
      }
    });
  }

  async export(id: string, agencyId: string, format: 'pdf' | 'docx') {
    await this.ensureReportAccess(id, agencyId);

    if (format !== 'pdf' && format !== 'docx') {
      throw new BadRequestException('Unsupported export format');
    }

    return {
      reportId: id,
      format,
      status: 'stub' as const,
      message: 'Export is not implemented yet, this is a placeholder endpoint.'
    };
  }

  private async ensureProjectAccess(projectId: string, agencyId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, client: { agencyId } },
      select: { id: true }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }
  }

  private async ensureReportAccess(id: string, agencyId: string) {
    const report = await this.prisma.report.findFirst({
      where: { id, project: { client: { agencyId } } },
      select: { id: true }
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }
  }

  private buildWhere(
    agencyId: string,
    filters: { projectId?: string; onlyPublished?: boolean; fromPeriod?: string; toPeriod?: string }
  ): Prisma.ReportWhereInput {
    const where: Prisma.ReportWhereInput = {
      project: {
        client: { agencyId },
        ...(filters.projectId ? { id: filters.projectId } : {})
      }
    };

    if (filters.onlyPublished) {
      where.status = ReportStatus.published;
    }

    if (filters.fromPeriod || filters.toPeriod) {
      where.period = {
        ...(filters.fromPeriod ? { gte: filters.fromPeriod } : {}),
        ...(filters.toPeriod ? { lte: filters.toPeriod } : {})
      };
    }

    return where;
  }
}
