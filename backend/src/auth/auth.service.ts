import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterAgencyDto } from './dto/register-agency.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthUser } from '../common/interfaces/auth-user.interface';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

  async registerAgency(dto: RegisterAgencyDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const slugBase = slugify(dto.agencyName, { lower: true, strict: true }) || 'agency';
    const slug = await this.ensureUniqueSlug(slugBase);
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const { agency, user } = await this.prisma.$transaction(async (tx) => {
      const newAgency = await tx.agency.create({
        data: {
          name: dto.agencyName,
          slug,
          primaryEmail: dto.email
        }
      });

      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          name: dto.fullName,
          role: UserRole.owner,
          agencyId: newAgency.id,
          passwordHash
        }
      });

      return { agency: newAgency, user: newUser };
    });

    const authUser = this.toAuthUser(user);
    const accessToken = this.signToken(authUser);
    return { accessToken, user: authUser, agency };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const authUser = this.toAuthUser(user);
    const accessToken = this.signToken(authUser);
    const agency = await this.prisma.agency.findUnique({ where: { id: authUser.agencyId } });

    return { accessToken, user: authUser, agency };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { agency: true }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const authUser = this.toAuthUser(user);
    return { user: authUser, agency: user.agency };
  }

  private toAuthUser(user: User): AuthUser {
    const { id, email, role, agencyId, name, clientId } = user;
    return { id, email, role, agencyId, name, clientId };
  }

  private signToken(user: AuthUser) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      agencyId: user.agencyId,
      clientId: user.clientId
    };
    return this.jwtService.sign(payload);
  }

  private async ensureUniqueSlug(base: string): Promise<string> {
    let candidate = base;
    let suffix = 1;

    // Loop until a free slug is found.
    // The slug column is unique, so this prevents conflicts on repeated names.
    while (true) {
      const existing = await this.prisma.agency.findUnique({ where: { slug: candidate } });
      if (!existing) {
        return candidate;
      }
      candidate = `${base}-${suffix++}`;
    }
  }
}
