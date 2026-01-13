import { BadRequestException, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import type { Secret, SignOptions } from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isEmailLike(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getJwtSecret(): Secret {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
}

function getJwtExpiresIn(): SignOptions['expiresIn'] {
  return (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'];
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) { }

  async register(dto: RegisterDto) {
    const email = normalizeEmail(dto.email);
    this.logger.log(`Register attempt: ${email}`);
    if (!isEmailLike(email)) {
      this.logger.warn(`Register failed (invalid email): ${email}`);
      throw new BadRequestException('invalid_email');
    }
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) {
      this.logger.warn(`Register failed (email exists): ${email}`);
      throw new BadRequestException('email_already_registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true, createdAt: true, updatedAt: true },
    });
    this.logger.log(`User registered: ${user.id} (${email})`);
    return { ok: true, user };
  }

  async login(dto: LoginDto) {
    const email = normalizeEmail(dto.email);
    this.logger.log(`Login attempt: ${email}`);
    if (!isEmailLike(email)) {
      this.logger.warn(`Login failed (invalid email format): ${email}`);
      throw new UnauthorizedException('invalid_credentials');
    }
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      this.logger.warn(`Login failed (user not found): ${email}`);
      throw new UnauthorizedException('invalid_credentials');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      this.logger.warn(`Login failed (wrong password): ${email}`);
      throw new UnauthorizedException('invalid_credentials');
    }

    const token = jwt.sign({ sub: user.id }, getJwtSecret(), { expiresIn: getJwtExpiresIn() });
    this.logger.log(`User logged in: ${user.id} (${email})`);
    return {
      token,
      user: { id: user.id, email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt },
    };
  }

  async logout(userId: string) {
    this.logger.log(`User logged out: ${userId}`);
    return { ok: true };
  }
}
