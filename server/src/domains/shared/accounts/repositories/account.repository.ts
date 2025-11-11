import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Account, AccountDocument } from '../../../../database/schemas/account.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class AccountRepository extends BaseRepository<AccountDocument> {
  constructor(
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
  ) {
    super(accountModel);
  }

  /**
   * Find account by phone number
   */
  async findByPhoneNumber(phoneNumber: string): Promise<AccountDocument | null> {
    return this.findOne({ phoneNumber });
  }

  /**
   * Find account by email
   */
  async findByEmail(email: string): Promise<AccountDocument | null> {
    return this.findOne({ email });
  }

  /**
   * Find accounts by role
   */
  async findByRole(
    role: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: AccountDocument[]; total: number }> {
    return this.findWithPagination({ role }, page, limit);
  }

  /**
   * Update last login
   */
  async updateLastLogin(accountId: string): Promise<AccountDocument | null> {
    return this.findByIdAndUpdate(accountId, { lastLogin: new Date() });
  }

  /**
   * Verify account
   */
  async verifyAccount(accountId: string): Promise<AccountDocument | null> {
    return this.findByIdAndUpdate(accountId, { isVerified: true });
  }

  /**
   * Suspend account
   */
  async suspendAccount(
    accountId: string,
    reason: string,
  ): Promise<AccountDocument | null> {
    return this.findByIdAndUpdate(accountId, {
      isSuspended: true,
      suspensionReason: reason,
      suspendedAt: new Date(),
    });
  }

  /**
   * Unsuspend account
   */
  async unsuspendAccount(accountId: string): Promise<AccountDocument | null> {
    return this.findByIdAndUpdate(accountId, {
      isSuspended: false,
      suspensionReason: null,
      suspendedAt: null,
    });
  }

  /**
   * Ban account
   */
  async banAccount(
    accountId: string,
    reason: string,
  ): Promise<AccountDocument | null> {
    return this.findByIdAndUpdate(accountId, {
      isBanned: true,
      banReason: reason,
      bannedAt: new Date(),
    });
  }

  /**
   * Get account statistics
   */
  async getAccountStats(): Promise<any> {
    return this.accountModel.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          verified: {
            $sum: { $cond: ['$isVerified', 1, 0] },
          },
          suspended: {
            $sum: { $cond: ['$isSuspended', 1, 0] },
          },
          banned: {
            $sum: { $cond: ['$isBanned', 1, 0] },
          },
        },
      },
    ]);
  }
}

