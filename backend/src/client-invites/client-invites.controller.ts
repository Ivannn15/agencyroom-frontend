import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ClientInvitesService } from './client-invites.service';
import { CreateClientInviteDto } from './dto/create-client-invite.dto';
import { AcceptClientInviteDto } from './dto/accept-client-invite.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/interfaces/auth-user.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.owner, UserRole.manager)
@Controller('clients')
export class ClientInvitesAdminController {
  constructor(private readonly clientInvitesService: ClientInvitesService) {}

  @Post(':id/invite')
  create(@Param('id') clientId: string, @Body() dto: CreateClientInviteDto, @CurrentUser() user: AuthUser) {
    return this.clientInvitesService.createInvite(clientId, user.agencyId, user.id, dto.email, dto.expiresInDays);
  }
}

@Controller('client/invites')
export class ClientInvitesController {
  constructor(private readonly clientInvitesService: ClientInvitesService) {}

  @Get(':token')
  findOne(@Param('token') token: string) {
    return this.clientInvitesService.getInviteDetails(token);
  }

  @Post(':token/accept')
  accept(@Param('token') token: string, @Body() dto: AcceptClientInviteDto) {
    return this.clientInvitesService.acceptInvite(token, dto.password, dto.fullName);
  }
}
