import { Controller, Get, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ClientPortalService } from './client-portal.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/interfaces/auth-user.interface';

@UseGuards(JwtAuthGuard)
@Controller('client')
export class ClientPortalController {
  constructor(private readonly clientPortalService: ClientPortalService) {}

  @Get('reports')
  findReports(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('fromPeriod') fromPeriod?: string,
    @Query('toPeriod') toPeriod?: string
  ) {
    this.ensureClient(user);
    return this.clientPortalService.findReportsForClient(user.clientId!, {
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      fromPeriod,
      toPeriod
    });
  }

  @Get('reports/summary')
  getSummary(
    @CurrentUser() user: AuthUser,
    @Query('fromPeriod') fromPeriod?: string,
    @Query('toPeriod') toPeriod?: string
  ) {
    this.ensureClient(user);
    return this.clientPortalService.getSummaryForClient(user.clientId!, { fromPeriod, toPeriod });
  }

  @Get('reports/:id')
  findReport(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    this.ensureClient(user);
    return this.clientPortalService.findReportByIdForClient(id, user.clientId!);
  }

  private ensureClient(user: AuthUser) {
    if (user.role !== UserRole.client || !user.clientId) {
      throw new ForbiddenException();
    }
  }
}
