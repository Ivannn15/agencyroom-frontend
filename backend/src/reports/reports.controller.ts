import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/interfaces/auth-user.interface';
import { ExportFormatDto } from './dto/export-format.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.owner, UserRole.manager)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('projectId') projectId?: string,
    @Query('clientId') clientId?: string,
    @Query('publishedOnly') publishedOnly?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('fromPeriod') fromPeriod?: string,
    @Query('toPeriod') toPeriod?: string
  ) {
    const onlyPublished = publishedOnly === 'true';
    const pageNum = page ? Number(page) : 1;
    const pageSizeNum = pageSize ? Number(pageSize) : 20;
    const safePage = Number.isFinite(pageNum) && pageNum > 0 ? Math.floor(pageNum) : 1;
    const safePageSize = Number.isFinite(pageSizeNum) && pageSizeNum > 0 ? Math.min(Math.floor(pageSizeNum), 100) : 20;

    return this.reportsService.findAll(user.agencyId, projectId, clientId, onlyPublished, {
      page: safePage,
      pageSize: safePageSize,
      fromPeriod,
      toPeriod
    });
  }

  @Get('summary')
  getSummary(
    @CurrentUser() user: AuthUser,
    @Query('projectId') projectId?: string,
    @Query('publishedOnly') publishedOnly?: string,
    @Query('fromPeriod') fromPeriod?: string,
    @Query('toPeriod') toPeriod?: string
  ) {
    const onlyPublished = publishedOnly === 'true';
    return this.reportsService.getSummary(user.agencyId, { projectId, fromPeriod, toPeriod, onlyPublished });
  }

  @Post()
  create(@Body() dto: CreateReportDto, @CurrentUser() user: AuthUser) {
    return this.reportsService.create(dto, user.agencyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.reportsService.findOne(id, user.agencyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateReportDto, @CurrentUser() user: AuthUser) {
    return this.reportsService.update(id, user.agencyId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.reportsService.delete(id, user.agencyId);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.reportsService.publish(id, user.agencyId);
  }

  @Post(':id/unpublish')
  unpublish(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.reportsService.unpublish(id, user.agencyId);
  }

  @Get(':id/export')
  export(
    @Param('id') id: string,
    @Query() query: ExportFormatDto,
    @CurrentUser() user: AuthUser
  ) {
    const safeFormat: 'pdf' | 'docx' = query.format === 'docx' ? 'docx' : 'pdf';
    return this.reportsService.export(id, user.agencyId, safeFormat);
  }

  @Post(':id/public-link')
  enablePublicLink(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.reportsService.enablePublicLink(id, user.agencyId);
  }

  @Delete(':id/public-link')
  disablePublicLink(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.reportsService.disablePublicLink(id, user.agencyId);
  }
}
