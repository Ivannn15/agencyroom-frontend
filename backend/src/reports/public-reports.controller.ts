import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('public/reports')
export class PublicReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get(':publicId')
  async getPublicReport(@Param('publicId') publicId: string) {
    const report = await this.reportsService.findPublic(publicId);
    if (!report) {
      throw new NotFoundException('Public report not found');
    }
    return report;
  }
}
