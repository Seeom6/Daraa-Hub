import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SECURITY_CONSTANTS } from '../../../../common/constants';

/**
 * Service for JWT token generation and validation
 */
@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Generate access token
   */
  generateAccessToken(payload: any): string {
    return this.jwtService.sign(payload, {
      expiresIn: (this.configService.get<string>('jwt.accessTokenExpiry') ||
        SECURITY_CONSTANTS.ACCESS_TOKEN_EXPIRY) as any,
    });
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(payload: any): string {
    return this.jwtService.sign(payload, {
      expiresIn: (this.configService.get<string>('jwt.refreshTokenExpiry') ||
        SECURITY_CONSTANTS.REFRESH_TOKEN_EXPIRY) as any,
    });
  }

  /**
   * Verify token
   */
  verifyToken(token: string): any {
    return this.jwtService.verify(token);
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): any {
    return this.jwtService.verify(token);
  }

  /**
   * Decode token without verification
   */
  decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }
}

