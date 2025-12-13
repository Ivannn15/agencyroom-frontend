import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PublicReportsController } from './public-reports.controller';

@Module({
  providers: [ReportsService],
  controllers: [ReportsController, PublicReportsController]
})
export class ReportsModule {}
