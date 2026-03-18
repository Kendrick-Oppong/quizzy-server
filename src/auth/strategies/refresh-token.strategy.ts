import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import type { JwtPayload, JwtPayloadWithRt } from 'types/auth';
import { AUTH_CONSTANTS } from '../../lib/constants/auth';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => {
          const token = request?.cookies?.[AUTH_CONSTANTS.REFRESH_TOKEN] as string | undefined;
          return token ?? null;
        },
      ]),
      secretOrKey: config.get<string>(AUTH_CONSTANTS.JWT_REFRESH_SECRET_ENV)!,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload): JwtPayloadWithRt {
    const refreshToken = req?.cookies?.[AUTH_CONSTANTS.REFRESH_TOKEN] as string | undefined;
    if (!refreshToken) {
      throw new ForbiddenException('Refresh token missing');
    }

    return {
      ...payload,
      refreshToken,
    };
  }
}
