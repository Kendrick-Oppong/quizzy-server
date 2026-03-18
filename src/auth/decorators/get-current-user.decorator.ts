import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayload, JwtPayloadWithRt } from 'types/auth';

export const GetCurrentUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    return user.sub;
  },
);

export const GetCurrentUser = createParamDecorator(
  (data: keyof JwtPayloadWithRt | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user as JwtPayloadWithRt;
    return (request.user as JwtPayloadWithRt)[data];
  },
);
