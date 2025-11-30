import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectDto, agencyId: string) {
    await this.ensureClientAccess(dto.clientId, agencyId);
    return this.prisma.project.create({
      data: {
        clientId: dto.clientId,
        name: dto.name,
        status: dto.status ?? ProjectStatus.active,
        notes: dto.notes
      }
    });
  }

  findAll(agencyId: string, clientId?: string) {
    return this.prisma.project.findMany({
      where: {
        client: { agencyId },
        ...(clientId ? { clientId } : {})
      },
      include: { client: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string, agencyId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, client: { agencyId } },
      include: { client: true }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(id: string, agencyId: string, dto: UpdateProjectDto) {
    await this.ensureProjectAccess(id, agencyId);
    return this.prisma.project.update({
      where: { id },
      data: dto
    });
  }

  private async ensureClientAccess(clientId: string, agencyId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id: clientId, agencyId },
      select: { id: true }
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }
  }

  private async ensureProjectAccess(id: string, agencyId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, client: { agencyId } },
      select: { id: true }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }
  }
}
