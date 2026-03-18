import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Profile } from 'passport-google-oauth20';
import { UsersService } from '../users/users.service';
import type { Tokens, JwtPayload } from 'types/auth';
import type { AuthProvider, User } from 'generated/prisma/client';
import type { RegisterDto } from './dto';
import { AUTH_CONSTANTS } from '../lib/constants/auth';
import type { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ── Local Auth ────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<Tokens & { message: string }> {
    const existingUser = await this.usersService.findOneByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(
      dto.password,
      AUTH_CONSTANTS.SALT_ROUNDS,
    );

    const user = await this.usersService.create({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
    });

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      message: 'Account created successfully',
      ...tokens,
    };
  }

  async login(
    email: string,
    password: string,
  ): Promise<Tokens & { message: string }> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Brute-force protection: check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new ForbiddenException(
        `Account is temporarily locked. Try again in ${minutesLeft} minute(s).`,
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment failed attempts
      const failedAttempts = user.failedLoginAttempts + 1;
      const updateData: { failedLoginAttempts: number; lockedUntil?: Date } = {
        failedLoginAttempts: failedAttempts,
      };

      if (failedAttempts >= AUTH_CONSTANTS.MAX_FAILED_ATTEMPTS) {
        updateData.lockedUntil = new Date(
          Date.now() + AUTH_CONSTANTS.LOCK_DURATION_MS,
        );
      }

      await this.usersService.update(user.id, updateData);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await this.usersService.update(user.id, {
        failedLoginAttempts: 0,
        lockedUntil: null,
      });
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return { message: 'Logged in successfully', ...tokens };
  }

  // ── OAuth ────────────────────────────────────────────────

  async validateOAuthUser(
    profile: Profile,
    provider: AuthProvider,
  ): Promise<User> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new UnauthorizedException(
        'No email found from OAuth provider. Please use an account with an email address.',
      );
    }

    const firstName = profile.name?.givenName ?? '';
    const lastName = profile.name?.familyName ?? '';
    const avatarUrl = profile.photos?.[0]?.value;

    let user = await this.usersService.findOneByEmail(email);

    if (user) {
      if (!user.providerId || user.provider !== provider) {
        user = await this.usersService.update(user.id, {
          provider,
          providerId: profile.id,
          avatarUrl: user.avatarUrl ?? avatarUrl,
        });
      }
    } else {
      user = await this.usersService.create({
        email,
        firstName,
        lastName,
        avatarUrl,
        provider,
        providerId: profile.id,
      });
    }

    return user;
  }

  async handleOAuthCallback(
    user: User,
    res: Response,
  ): Promise<{ url: string }> {
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    res.cookie(AUTH_CONSTANTS.REFRESH_TOKEN, tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const frontendUrl = this.config.get<string>('FRONTEND_URL')!;
    return {
      url: `${frontendUrl}/oauth-success?token=${tokens.accessToken}`,
    };
  }

  // ── Token Management ──────────────────────────────────────

  async getTokens(userId: string, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>(AUTH_CONSTANTS.JWT_ACCESS_SECRET_ENV),
        expiresIn: AUTH_CONSTANTS.JWT_ACCESS_EXPIRES_IN,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>(AUTH_CONSTANTS.JWT_REFRESH_SECRET_ENV),
        expiresIn: AUTH_CONSTANTS.JWT_REFRESH_EXPIRES_IN,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async updateRefreshTokenHash(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedToken = await bcrypt.hash(
      refreshToken,
      AUTH_CONSTANTS.SALT_ROUNDS,
    );
    await this.usersService.update(userId, { refreshToken: hashedToken });
  }

  async refreshTokens(
    userId: string,
    currentRefreshToken: string,
  ): Promise<Tokens & { message: string }> {
    const user = await this.usersService.findOneById(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    const isTokenValid = await bcrypt.compare(
      currentRefreshToken,
      user.refreshToken,
    );
    if (!isTokenValid) {
      throw new ForbiddenException(
        'Invalid refresh token. Please log in again.',
      );
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return { message: 'Tokens refreshed successfully', ...tokens };
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.usersService.update(userId, { refreshToken: null });
    return { message: 'Logged out successfully' };
  }
}
