import { Injectable, NotFoundException } from '@nestjs/common';
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

  findAll(agencyId: string, projectId?: string) {
    return this.prisma.report.findMany({
      where: {
        project: {
          client: { agencyId },
          ...(projectId ? { id: projectId } : {})
        }
      },
      include: {
        project: {
          include: { client: true }
        }
      },
      orderBy: { createdAt: 'desc' }
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
}
