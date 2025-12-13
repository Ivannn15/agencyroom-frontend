import { BadRequestException, ConflictException, GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../common/interfaces/auth-user.interface';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

const DEFAULT_EXPIRES_IN_DAYS = 7;
const MAX_EXPIRES_IN_DAYS = 60;

@Injectable()
export class ClientInvitesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  async createInvite(clientId: string, agencyId: string, createdByUserId: string, email: string, expiresInDays?: number) {
    const client = await this.prisma.client.findFirst({
      where: { id: clientId, agencyId },
      include: { agency: true }
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const expiresAt = this.buildExpiresAt(expiresInDays);
    const { rawToken, tokenHash } = await this.generateToken();

    await this.prisma.clientInvite.create({
      data: {
        tokenHash,
        clientId,
        agencyId,
        email: normalizedEmail,
        expiresAt,
        createdByUserId
      }
    });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const normalizedFrontendUrl = frontendUrl.endsWith('/') ? frontendUrl.slice(0, -1) : frontendUrl;
    const inviteUrl = `${normalizedFrontendUrl}/client/invite/${rawToken}`;

    return {
      inviteUrl,
      expiresAt,
      email: normalizedEmail,
      clientId
    };
  }

  async getInviteDetails(rawToken: string) {
    const invite = await this.ensureValidInvite(rawToken);
    return {
      clientName: invite.client.company ?? invite.client.name,
      agencyName: invite.agency.name,
      email: invite.email,
      expiresAt: invite.expiresAt
    };
  }

  async acceptInvite(rawToken: string, password: string, fullName?: string) {
    if (!password || password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }

    const invite = await this.ensureValidInvite(rawToken);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: invite.email }
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date();
    const safeFullName = fullName?.trim() || undefined;

    const user = await this.prisma.$transaction(async (tx) => {
      const currentInvite = await tx.clientInvite.findUnique({
        where: { id: invite.id },
        select: { usedAt: true, expiresAt: true }
      });

      if (!currentInvite) {
        throw new NotFoundException('Invite not found');
      }

      if (currentInvite.usedAt) {
        throw new ConflictException('Invite already used');
      }

      if (currentInvite.expiresAt.getTime() < Date.now()) {
        throw new GoneException('Invite expired');
      }

      const createdUser = await tx.user.create({
        data: {
          email: invite.email,
          name: safeFullName,
          passwordHash,
          role: UserRole.client,
          agencyId: invite.agencyId,
          clientId: invite.clientId
        }
      });

      await tx.clientInvite.update({
        where: { id: invite.id },
        data: { usedAt: now }
      });

      return createdUser;
    });

    const authUser = this.toAuthUser(user);
    const payload: JwtPayload = {
      sub: authUser.id,
      email: authUser.email,
      role: authUser.role,
      agencyId: authUser.agencyId,
      clientId: authUser.clientId
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: authUser,
      agency: invite.agency
    };
  }

  private async ensureValidInvite(rawToken: string) {
    if (!rawToken || typeof rawToken !== 'string' || rawToken.length < 8) {
      throw new BadRequestException('Invalid invite token');
    }

    const tokenHash = this.hashToken(rawToken);
    const invite = await this.prisma.clientInvite.findUnique({
      where: { tokenHash },
      include: { client: true, agency: true }
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.usedAt) {
      throw new ConflictException('Invite already used');
    }

    if (invite.expiresAt.getTime() < Date.now()) {
      throw new GoneException('Invite expired');
    }

    return invite;
  }

  private hashToken(rawToken: string) {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  private async generateToken() {
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    return { rawToken, tokenHash };
  }

  private buildExpiresAt(expiresInDays?: number) {
    const days = Math.max(1, Math.min(expiresInDays ?? DEFAULT_EXPIRES_IN_DAYS, MAX_EXPIRES_IN_DAYS));
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    return expiresAt;
  }

  private toAuthUser(user: User): AuthUser {
    const { id, email, role, agencyId, name, clientId } = user;
    return { id, email, role, agencyId, name, clientId };
  }
}
