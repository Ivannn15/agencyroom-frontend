import { Injectable, NotFoundException } from '@nestjs/common';
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
      where: { id, agencyId }
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
