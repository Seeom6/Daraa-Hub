/**
 * Session Token Service
 * Handles temporary session tokens for cross-domain authentication
 */

import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { RedisService } from '../../../../infrastructure/redis/redis.service';

export interface SessionTokenData {
  userId: string;
  role: string;
  phone: string;
  fullName: string;
  email?: string;
  createdAt?: number; // Optional, will be added when storing
}

@Injectable()
export class SessionTokenService {
  private readonly logger = new Logger(SessionTokenService.name);
  private readonly TOKEN_PREFIX = 'session_token:';
  private readonly TOKEN_EXPIRY = 5 * 60; // 5 minutes in seconds

  constructor(private readonly redisService: RedisService) {}

  /**
   * Generate a temporary session token for cross-domain authentication
   */
  async generateSessionToken(data: SessionTokenData): Promise<string> {
    // Generate a secure random token
    const token = randomBytes(32).toString('hex');
    const key = `${this.TOKEN_PREFIX}${token}`;

    // Store token data in Redis with expiry
    await this.redisService.set(
      key,
      JSON.stringify({
        ...data,
        createdAt: Date.now(),
      }),
      this.TOKEN_EXPIRY,
    );

    this.logger.log(`Session token generated for user: ${data.userId}`);
    return token;
  }

  /**
   * Validate and consume a session token (one-time use)
   */
  async validateAndConsumeToken(
    token: string,
  ): Promise<SessionTokenData | null> {
    const key = `${this.TOKEN_PREFIX}${token}`;

    try {
      // Get token data
      const data = await this.redisService.get(key);

      if (!data) {
        this.logger.warn(`Invalid or expired session token: ${token}`);
        return null;
      }

      // Delete token immediately (one-time use)
      await this.redisService.del(key);

      const tokenData: SessionTokenData = JSON.parse(data);

      // Verify token is not too old (extra safety check)
      if (tokenData.createdAt) {
        const age = Date.now() - tokenData.createdAt;
        if (age > this.TOKEN_EXPIRY * 1000) {
          this.logger.warn(`Session token expired: ${token}`);
          return null;
        }
      }

      this.logger.log(`Session token validated for user: ${tokenData.userId}`);
      return tokenData;
    } catch (error) {
      this.logger.error(`Error validating session token: ${error.message}`);
      return null;
    }
  }

  /**
   * Revoke a session token
   */
  async revokeToken(token: string): Promise<void> {
    const key = `${this.TOKEN_PREFIX}${token}`;
    await this.redisService.del(key);
    this.logger.log(`Session token revoked: ${token}`);
  }
}

