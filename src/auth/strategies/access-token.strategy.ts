import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtPayload } from 'types/auth';
import { AUTH_CONSTANTS } from '../../lib/constants/auth';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>(AUTH_CONSTANTS.JWT_ACCESS_SECRET_ENV)!,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
