import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientInvitesService } from './client-invites.service';
import { ClientInvitesAdminController, ClientInvitesController } from './client-invites.controller';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') ?? '30d';
        return {
          secret: configService.get<string>('JWT_SECRET') ?? 'changeme',
          signOptions: { expiresIn }
        };
      }
    })
  ],
  controllers: [ClientInvitesAdminController, ClientInvitesController],
  providers: [ClientInvitesService]
})
export class ClientInvitesModule {}
