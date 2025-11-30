import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AccountDocument } from '../../../../database/schemas';
import { AccountRepository } from '../repositories/account.repository';
import { SecurityProfileRepository } from '../repositories/security-profile.repository';

/**
 * Account Security Service
 * Handles password management, login history, and account locking
 * Uses Repository Pattern for all database operations
 */
@Injectable()
export class AccountSecurityService {
  private readonly logger = new Logger(AccountSecurityService.name);
  private readonly saltRounds = 12;

  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly securityProfileRepository: SecurityProfileRepository,
  ) {}

  /**
   * Set password for account
   */
  async setPassword(
    phone: string,
    password: string,
    email?: string,
  ): Promise<AccountDocument> {
    const account = await this.accountRepository.findByPhone(phone);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const passwordHash = await bcrypt.hash(password, this.saltRounds);
    account.passwordHash = passwordHash;
    account.isVerified = true;

    if (email) {
      account.email = email;
    }

    await account.save();
    this.logger.log(`Password set for account: ${account.phone}`);
    return account;
  }

  /**
   * Validate password
   */
  async validatePassword(
    account: AccountDocument,
    password: string,
  ): Promise<boolean> {
    if (!account.passwordHash) {
      return false;
    }
    return bcrypt.compare(password, account.passwordHash);
  }

  /**
   * Update password
   */
  async updatePassword(phone: string, newPassword: string): Promise<void> {
    const account = await this.accountRepository.findByPhone(phone);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const passwordHash = await bcrypt.hash(newPassword, this.saltRounds);
    account.passwordHash = passwordHash;
    await account.save();
    this.logger.log(`Password updated for account: ${account.phone}`);
  }

  /**
   * Add login history entry
   */
  async addLoginHistory(
    accountId: Types.ObjectId,
    ip: string,
    device: string,
    success: boolean,
  ): Promise<void> {
    const securityProfile =
      await this.securityProfileRepository.findByAccountId(
        accountId.toString(),
      );
    if (!securityProfile) {
      this.logger.warn(`Security profile not found for account: ${accountId}`);
      return;
    }

    // Add login history
    securityProfile.loginHistory.push({
      timestamp: new Date(),
      ip,
      device,
      success,
    });

    // Keep only last 50 login attempts
    if (securityProfile.loginHistory.length > 50) {
      securityProfile.loginHistory = securityProfile.loginHistory.slice(-50);
    }

    // Handle failed login attempts
    if (!success) {
      securityProfile.failedAttempts += 1;

      // Lock account after 5 failed attempts
      if (securityProfile.failedAttempts >= 5) {
        securityProfile.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        this.logger.warn(
          `Account locked due to failed login attempts: ${accountId}`,
        );
      }
    } else {
      // Reset failed attempts on successful login
      securityProfile.failedAttempts = 0;
      securityProfile.lockedUntil = undefined;
    }

    await securityProfile.save();
  }

  /**
   * Check if account is locked
   */
  async isAccountLocked(accountId: Types.ObjectId): Promise<boolean> {
    const securityProfile =
      await this.securityProfileRepository.findByAccountId(
        accountId.toString(),
      );
    if (!securityProfile || !securityProfile.lockedUntil) {
      return false;
    }

    // Check if lock has expired
    if (securityProfile.lockedUntil < new Date()) {
      securityProfile.lockedUntil = undefined;
      securityProfile.failedAttempts = 0;
      await securityProfile.save();
      return false;
    }

    return true;
  }
}
