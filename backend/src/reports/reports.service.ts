import { randomUUID } from 'crypto';
import { Buffer } from 'buffer';
import { existsSync } from 'fs';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ReportStatus } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from 'docx';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportsService {
  private fontPath?: string | null;

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

  private async buildDocxBuffer(
    report: Prisma.ReportGetPayload<{ include: { project: { include: { client: true } }; publicLink: true } }>
  ) {
    const done = this.normalizeStringArray(report.whatWasDone);
    const plan = this.normalizeStringArray(report.nextPlan);
    const metrics = [
      ['Spend', report.spend],
      ['Revenue', report.revenue],
      ['Leads', report.leads],
      ['CPA', report.cpa],
      ['ROAS', report.roas]
    ]
      .filter(([, value]) => value !== null && value !== undefined)
      .map(([label, value]) => `${label}: ${value}`);

    const clientName = report.project?.client?.company ?? report.project?.client?.name ?? 'Клиент';
    const projectName = report.project?.name ?? 'Проект';

    const paragraphs: Paragraph[] = [];
    type HeadingValue = (typeof HeadingLevel)[keyof typeof HeadingLevel];
    const addHeading = (text: string, level: HeadingValue = HeadingLevel.HEADING_2) => {
      paragraphs.push(
        new Paragraph({
          text,
          heading: level,
          spacing: { after: 200 }
        })
      );
    };

    paragraphs.push(
      new Paragraph({
        text: `Отчет: ${projectName}`,
        heading: HeadingLevel.TITLE
      })
    );
    paragraphs.push(
      new Paragraph({
        text: `Клиент: ${clientName}`,
        spacing: { after: 100 }
      })
    );
    paragraphs.push(
      new Paragraph({
        text: `Период: ${report.period}`,
        spacing: { after: 200 }
      })
    );

    addHeading('Резюме');
    paragraphs.push(
      new Paragraph({
        text: report.summary || '—',
        spacing: { after: 200 }
      })
    );

    if (metrics.length) {
      addHeading('Метрики');
      metrics.forEach((m) =>
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: `• ${m}` })],
            spacing: { after: 100 }
          })
        )
      );
    }

    if (done.length) {
      addHeading('Что сделано');
      done.forEach((item, idx) =>
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: `${idx + 1}. ${item}` })],
            spacing: { after: 100 }
          })
        )
      );
    }

    if (plan.length) {
      addHeading('План');
      plan.forEach((item, idx) =>
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: `${idx + 1}. ${item}` })],
            spacing: { after: 100 }
          })
        )
      );
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720
              }
            }
          },
          children: paragraphs
        }
      ]
    });

    return await Packer.toBuffer(doc);
  }

  findAll(
    agencyId: string,
    projectId?: string,
    clientId?: string,
    onlyPublished?: boolean,
    options?: { page?: number; pageSize?: number; fromPeriod?: string; toPeriod?: string }
  ) {
    const page = Math.max(1, options?.page ?? 1);
    const rawPageSize = options?.pageSize ?? 20;
    const pageSize = Math.min(Math.max(1, rawPageSize), 100);
    const where = this.buildWhere(agencyId, {
      projectId,
      clientId,
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
        },
        publicLink: true
      }
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async findPublic(publicId: string) {
    if (!publicId) return null;
    const link = await this.prisma.publicReportLink.findFirst({
      where: { publicId, isActive: true },
      include: {
        report: {
          include: {
            project: {
              include: { client: true }
            }
          }
        }
      }
    });

    if (!link || !link.report) {
      return null;
    }

    const report = link.report;
    return {
      id: report.id,
      period: report.period,
      summary: report.summary,
      spend: report.spend,
      revenue: report.revenue,
      leads: report.leads,
      cpa: report.cpa,
      roas: report.roas,
      status: report.status,
      whatWasDone: report.whatWasDone,
      nextPlan: report.nextPlan,
      project: {
        id: report.projectId,
        name: report.project?.name,
        status: report.project?.status,
        client: {
          id: report.project?.clientId,
          name: report.project?.client?.name,
          company: report.project?.client?.company
        }
      },
      publishedAt: report.publishedAt,
      publicId: link.publicId
    };
  }

  async update(id: string, agencyId: string, dto: UpdateReportDto) {
    await this.ensureReportAccess(id, agencyId);
    return this.prisma.report.update({
      where: { id },
      data: dto
    });
  }

  async getSummary(agencyId: string, options?: { projectId?: string; clientId?: string; fromPeriod?: string; toPeriod?: string; onlyPublished?: boolean }) {
    const where = this.buildWhere(agencyId, {
      projectId: options?.projectId,
      clientId: options?.clientId,
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

  async delete(id: string, agencyId: string) {
    await this.ensureReportAccess(id, agencyId);

    await this.prisma.publicReportLink.deleteMany({
      where: { reportId: id }
    });

    return this.prisma.report.delete({
      where: { id }
    });
  }

  async enablePublicLink(id: string, agencyId: string) {
    await this.ensureReportAccess(id, agencyId);

    const existing = await this.prisma.publicReportLink.findFirst({
      where: { reportId: id }
    });

    if (!existing) {
      const publicId = randomUUID().replace(/-/g, '').slice(0, 12);
      return this.prisma.publicReportLink.create({
        data: {
          reportId: id,
          publicId,
          isActive: true
        }
      });
    }

    return this.prisma.publicReportLink.update({
      where: { id: existing.id },
      data: { isActive: true }
    });
  }

  async disablePublicLink(id: string, agencyId: string) {
    await this.ensureReportAccess(id, agencyId);

    return this.prisma.publicReportLink.updateMany({
      where: { reportId: id },
      data: { isActive: false }
    });
  }

  async export(id: string, agencyId: string, format: 'pdf' | 'docx') {
    const report = await this.findOne(id, agencyId);

    if (format !== 'pdf' && format !== 'docx') {
      throw new BadRequestException('Unsupported export format');
    }

    const filenameBase = this.makeSafeFilename(
      `${report.project?.client?.company ?? report.project?.client?.name ?? 'client'}-${report.project?.name ?? 'project'}-${report.period}`
    );

    if (format === 'pdf') {
      const buffer = await this.buildPdfBuffer(report);
      return {
        buffer,
        filename: `${filenameBase}.pdf`,
        contentType: 'application/pdf'
      };
    }

    const buffer = await this.buildDocxBuffer(report);
    return {
      buffer,
      filename: `${filenameBase}.docx`,
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
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
    filters: { projectId?: string; clientId?: string; onlyPublished?: boolean; fromPeriod?: string; toPeriod?: string }
  ): Prisma.ReportWhereInput {
    const where: Prisma.ReportWhereInput = {
      project: {
        client: { agencyId },
        ...(filters.projectId ? { id: filters.projectId } : {}),
        ...(filters.clientId ? { clientId: filters.clientId } : {})
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

  private makeSafeFilename(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80) || 'report';
  }

  private async buildPdfBuffer(
    report: Prisma.ReportGetPayload<{ include: { project: { include: { client: true } }; publicLink: true } }>
  ): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const fontPath = this.getFontPath();
    if (fontPath) {
      doc.font(fontPath);
    }

    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));

    const done = this.normalizeStringArray(report.whatWasDone);
    const plan = this.normalizeStringArray(report.nextPlan);

    const metrics = [
      ['Spend', report.spend],
      ['Revenue', report.revenue],
      ['Leads', report.leads],
      ['CPA', report.cpa],
      ['ROAS', report.roas]
    ]
      .filter(([, value]) => value !== null && value !== undefined)
      .map(([label, value]) => `${label}: ${value}`);

    const clientName = report.project?.client?.company ?? report.project?.client?.name ?? 'Клиент';
    const projectName = report.project?.name ?? 'Проект';

    type HeadingValue = (typeof HeadingLevel)[keyof typeof HeadingLevel];

    const addSection = (title: string, lines: string[], ordered = false) => {
      doc.fontSize(14).text(title, { underline: true });
      doc.moveDown(0.2);
      lines.forEach((line, idx) => {
        const prefix = ordered ? `${idx + 1}. ` : '• ';
        doc.fontSize(12).text(`${prefix}${line}`, { lineGap: 4 });
      });
      doc.moveDown(0.8);
    };

    doc.fontSize(18).text(projectName, { underline: true });
    doc.moveDown(0.2);
    doc.fontSize(12).text(`Клиент: ${clientName}`);
    doc.text(`Период: ${report.period}`);
    doc.moveDown(0.8);

    addSection('Резюме', [report.summary || '—'], false);

    if (metrics.length) {
      addSection('Метрики', metrics, false);
    }

    if (done.length) {
      addSection('Что сделано', done, true);
    }

    if (plan.length) {
      addSection('План', plan, true);
    }

    doc.end();
    await new Promise<void>((resolve, reject) => {
      doc.on('end', resolve);
      doc.on('error', reject);
    });

    return Buffer.concat(chunks);
  }

  private buildLines(
    report: Prisma.ReportGetPayload<{ include: { project: { include: { client: true } }; publicLink: true } }>
  ) {
    const clientName = report.project?.client?.company ?? report.project?.client?.name ?? 'Клиент';
    const projectName = report.project?.name ?? 'Проект';
    const lines = [
      `Отчет: ${projectName}`,
      `Клиент: ${clientName}`,
      `Период: ${report.period}`,
      '',
      'Резюме',
      '────────────',
      report.summary || '—',
      ''
    ];

    const metrics = [
      ['Spend', report.spend],
      ['Revenue', report.revenue],
      ['Leads', report.leads],
      ['CPA', report.cpa],
      ['ROAS', report.roas]
    ]
      .filter(([, value]) => value !== null && value !== undefined)
      .map(([label, value]) => `${label}: ${value}`);

    if (metrics.length) {
      lines.push('Метрики', '────────────', ...metrics, '');
    }

    const done = this.normalizeStringArray(report.whatWasDone);
    if (done.length) {
      lines.push('Что сделано', '────────────', ...done.map((item, idx) => `${idx + 1}. ${item}`), '');
    }

    const plan = this.normalizeStringArray(report.nextPlan);
    if (plan.length) {
      lines.push('План', '────────────', ...plan.map((item, idx) => `${idx + 1}. ${item}`), '');
    }

    return lines;
  }

  private normalizeStringArray(value: unknown): string[] {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map((v) => String(v));
    }
    return [];
  }

  private getFontPath() {
    if (this.fontPath !== undefined) {
      return this.fontPath;
    }

    const candidates = [
      '/System/Library/Fonts/Supplemental/Arial.ttf',
      '/System/Library/Fonts/Supplemental/Times New Roman.ttf'
    ];

    for (const path of candidates) {
      if (existsSync(path)) {
        this.fontPath = path;
        return this.fontPath;
      }
    }

    this.fontPath = null;
    return this.fontPath;
  }
}
