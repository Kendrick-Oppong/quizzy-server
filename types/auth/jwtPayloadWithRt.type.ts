import type { JwtPayload } from './jwtPayload.type';

export interface JwtPayloadWithRt extends JwtPayload {
  refreshToken: string;
}
