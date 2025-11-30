import { Injectable } from '@nestjs/common';
import { Prisma, Agency } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AgenciesService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.AgencyCreateInput): Promise<Agency> {
    return this.prisma.agency.create({ data });
  }

  findById(id: string) {
    return this.prisma.agency.findUnique({ where: { id } });
  }

  findBySlug(slug: string) {
    return this.prisma.agency.findUnique({ where: { slug } });
  }
}
