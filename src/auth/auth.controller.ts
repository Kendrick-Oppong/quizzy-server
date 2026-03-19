import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  Redirect,
} from '@nestjs/common';
import type { Response } from 'express';
import type { User } from 'generated/prisma/client';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { GetCurrentUser, GetCurrentUserId, Public } from './decorators';
import { GoogleAuthGuard, RefreshTokenGuard } from './guards';
import { AUTH_CONSTANTS } from '../lib/constants/auth';
import {
  AuthApiTags,
  RegisterDocs,
  LoginDocs,
  GoogleAuthDocs,
  GoogleCallbackDocs,
  LogoutDocs,
  RefreshDocs,
} from './swagger/auth.docs';

@AuthApiTags
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @RegisterDocs()
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; accessToken: string }> {
    const { refreshToken, ...responseInfo } =
      await this.authService.register(dto);
    this.setRefreshTokenCookie(res, refreshToken);
    return responseInfo;
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @LoginDocs()
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; accessToken: string }> {
    const { refreshToken, ...responseInfo } = await this.authService.login(
      dto.email,
      dto.password,
    );
    this.setRefreshTokenCookie(res, refreshToken);
    return responseInfo;
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @GoogleAuthDocs()
  googleAuth(): void {
    // Guard redirects to Google — no body needed
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @Redirect()
  @GoogleCallbackDocs()
  async googleAuthCallback(
    @GetCurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ url: string }> {
    // Handle tokens via service, which returns { url: frontendUrl/success... }
    return this.authService.handleOAuthCallback(user, res);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @LogoutDocs()
  async logout(
    @GetCurrentUserId() userId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const result = await this.authService.logout(userId);
    res.clearCookie(AUTH_CONSTANTS.REFRESH_TOKEN);
    return result;
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @RefreshDocs()
  async refreshTokens(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('refreshToken') currentRefreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; accessToken: string }> {
    const { refreshToken, ...responseInfo } =
      await this.authService.refreshTokens(userId, currentRefreshToken);
    this.setRefreshTokenCookie(res, refreshToken);
    return responseInfo;
  }

  // ── Private Helpers ───────────────────────────────────────

  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie(AUTH_CONSTANTS.REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
