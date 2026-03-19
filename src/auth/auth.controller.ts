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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCookieAuth,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response } from 'express';
import type { User } from 'generated/prisma/client';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { GetCurrentUser, GetCurrentUserId, Public } from './decorators';
import { GoogleAuthGuard, RefreshTokenGuard } from './guards';
import { AUTH_CONSTANTS } from '../lib/constants/auth';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account with role selection. Sets an HttpOnly cookie with the refresh token and returns the access token.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully',
    schema: {
      example: {
        message: 'Account created successfully',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (e.g., weak password, invalid email)',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict: An account with this email already exists',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiOperation({
    summary: 'Login with email and password',
    description:
      'Authenticates a user. Features brute-force protection (locks account for 15 minutes after 5 failed attempts). Sets an HttpOnly cookie with the refresh token.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        message: 'Login successful',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Invalid email or password',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden: Account is temporarily locked due to brute-force protection',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiOperation({
    summary: 'Initiate Google OAuth Flow',
    description:
      'Redirects the user to the Google consent screen. This endpoint does not return a JSON response directly.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to Google OAuth consent screen',
  })
  googleAuth(): void {
    // Guard redirects to Google — no body needed
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @Redirect()
  @ApiOperation({
    summary: 'Google OAuth Callback',
    description:
      'Handles the callback from the Google OAuth flow. Automatically links accounts or creates a new one. Sets the refresh token cookie and redirects the browser back to the React SPA with the access token embedded.',
  })
  @ApiResponse({
    status: 302,
    description: 'Authentication successful. Redirects to frontend.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: No email found from OAuth provider',
  })
  async googleAuthCallback(
    @GetCurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ url: string }> {
    // Handle tokens via service, which returns { url: frontendUrl/success... }
    return this.authService.handleOAuthCallback(user, res);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout user',
    description:
      'Clears the refresh token from the database and clears the HttpOnly cookie.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
    schema: {
      example: {
        message: 'Logged out successfully',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Missing or invalid access token',
  })
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
  @ApiCookieAuth('refresh_token')
  @ApiOperation({
    summary: 'Refresh access tokens',
    description:
      'Generates a new access token and refresh token using a valid refresh token from the HttpOnly cookie.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    schema: {
      example: {
        message: 'Tokens refreshed successfully',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Refresh token missing or session expired',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Invalid refresh token signature or mismatch',
  })
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
