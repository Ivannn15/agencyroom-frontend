import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateClientDto, agencyId: string) {
    return this.prisma.client.create({
      data: {
        agencyId,
        name: dto.name,
        company: dto.company,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone
      }
    });
  }

  findAll(agencyId: string) {
    return this.prisma.client.findMany({
      where: { agencyId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string, agencyId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, agencyId },
      include: {
        projects: true
      }
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async update(id: string, agencyId: string, dto: UpdateClientDto) {
    await this.ensureClientAccess(id, agencyId);
    return this.prisma.client.update({
      where: { id },
      data: dto
    });
  }

  async delete(id: string, agencyId: string) {
    await this.ensureClientAccess(id, agencyId);

    const projectsCount = await this.prisma.project.count({
      where: { clientId: id }
    });

    if (projectsCount > 0) {
      throw new BadRequestException('Client has projects, remove them first');
    }

    return this.prisma.client.delete({
      where: { id }
    });
  }

  private async ensureClientAccess(id: string, agencyId: string) {
    const exists = await this.prisma.client.findFirst({
      where: { id, agencyId },
      select: { id: true }
    });

    if (!exists) {
      throw new NotFoundException('Client not found');
    }
  }
}
