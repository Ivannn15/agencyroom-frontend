import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AgenciesModule } from './agencies/agencies.module';
import { ClientsModule } from './clients/clients.module';
import { ProjectsModule } from './projects/projects.module';
import { ReportsModule } from './reports/reports.module';
import { ClientPortalModule } from './client-portal/client-portal.module';
import { HealthModule } from './health/health.module';
import { ClientInvitesModule } from './client-invites/client-invites.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AgenciesModule,
    ClientsModule,
    ClientInvitesModule,
    ProjectsModule,
    ReportsModule,
    ClientPortalModule,
    HealthModule
  ]
})
export class AppModule {}
