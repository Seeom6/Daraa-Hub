import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { AccountService } from '../../account/services/account.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private accountService: AccountService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // Extract JWT from HTTP-only cookie
          return request?.cookies?.access_token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'default-secret-key',
    });
  }

  async validate(payload: any) {
    const account = await this.accountService.findById(payload.sub);

    if (!account || !account.isActive) {
      throw new UnauthorizedException('Account not found or inactive');
    }

    return {
      userId: payload.sub,
      phone: payload.phone,
      role: payload.role,
    };
  }
}

