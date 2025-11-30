import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SecurityProfile,
  SecurityProfileDocument,
} from '../../../../database/schemas/security-profile.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class SecurityProfileRepository extends BaseRepository<SecurityProfileDocument> {
  constructor(
    @InjectModel(SecurityProfile.name)
    private readonly securityProfileModel: Model<SecurityProfileDocument>,
  ) {
    super(securityProfileModel);
  }

  /**
   * Find security profile by account ID
   */
  async findByAccountId(
    accountId: string,
  ): Promise<SecurityProfileDocument | null> {
    return this.model.findOne({ accountId }).exec();
  }

  /**
   * Record failed login attempt
   */
  async recordFailedLogin(
    accountId: string,
  ): Promise<SecurityProfileDocument | null> {
    return this.model
      .findOneAndUpdate(
        { accountId },
        {
          $inc: { failedLoginAttempts: 1 },
          $set: { lastFailedLoginAt: new Date() },
        },
        { new: true, upsert: true },
      )
      .exec();
  }

  /**
   * Reset failed login attempts
   */
  async resetFailedLogins(
    accountId: string,
  ): Promise<SecurityProfileDocument | null> {
    return this.model
      .findOneAndUpdate(
        { accountId },
        {
          $set: {
            failedLoginAttempts: 0,
            lastFailedLoginAt: null,
          },
        },
        { new: true },
      )
      .exec();
  }
}
