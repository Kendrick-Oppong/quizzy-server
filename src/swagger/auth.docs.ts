import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCookieAuth,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RegisterDto, LoginDto } from '../auth/dto';

export const AuthApiTags = ApiTags('Authentication');

export function RegisterDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Register a new user',
      description:
        'Creates a new user account with role selection. Sets an HttpOnly cookie with the refresh token and returns the access token.',
    }),
    ApiBody({ type: RegisterDto }),
    ApiResponse({
      status: 201,
      description: 'Account created successfully',
      schema: {
        example: {
          message: 'Account created successfully',
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Validation failed (e.g., weak password, invalid email)',
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict: An account with this email already exists',
    }),
    ApiResponse({ status: 500, description: 'Internal server error' }),
  );
}

export function LoginDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Login with email and password',
      description:
        'Authenticates a user. Features brute-force protection (locks account for 15 minutes after 5 failed attempts). Sets an HttpOnly cookie with the refresh token.',
    }),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: 200,
      description: 'Login successful',
      schema: {
        example: {
          message: 'Login successful',
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Validation failed' }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized: Invalid email or password',
    }),
    ApiResponse({
      status: 403,
      description:
        'Forbidden: Account is temporarily locked due to brute-force protection',
    }),
    ApiResponse({ status: 500, description: 'Internal server error' }),
  );
}

export function GoogleAuthDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Initiate Google OAuth Flow',
      description:
        'Redirects the user to the Google consent screen. This endpoint does not return a JSON response directly.',
    }),
    ApiResponse({
      status: 302,
      description: 'Redirect to Google OAuth consent screen',
    }),
  );
}

export function GoogleCallbackDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Google OAuth Callback',
      description:
        'Handles the callback from the Google OAuth flow. Automatically links accounts or creates a new one. Sets the refresh token cookie and redirects the browser back to the React SPA with the access token embedded.',
    }),
    ApiResponse({
      status: 302,
      description: 'Authentication successful. Redirects to frontend.',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized: No email found from OAuth provider',
    }),
  );
}

export function LogoutDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Logout user',
      description:
        'Clears the refresh token from the database and clears the HttpOnly cookie.',
    }),
    ApiResponse({
      status: 200,
      description: 'Logged out successfully',
      schema: {
        example: {
          message: 'Logged out successfully',
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized: Missing or invalid access token',
    }),
  );
}

export function RefreshDocs() {
  return applyDecorators(
    ApiCookieAuth('refresh_token'),
    ApiOperation({
      summary: 'Refresh access tokens',
      description:
        'Generates a new access token and refresh token using a valid refresh token from the HttpOnly cookie.',
    }),
    ApiResponse({
      status: 200,
      description: 'Tokens refreshed successfully',
      schema: {
        example: {
          message: 'Tokens refreshed successfully',
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized: Refresh token missing or session expired',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden: Invalid refresh token signature or mismatch',
    }),
  );
}
