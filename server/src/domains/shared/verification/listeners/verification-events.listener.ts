import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Account,
  AccountDocument,
} from '../../../../database/schemas/account.schema';
import {
  StoreOwnerProfile,
  StoreOwnerProfileDocument,
} from '../../../../database/schemas/store-owner-profile.schema';
import {
  CourierProfile,
  CourierProfileDocument,
} from '../../../../database/schemas/courier-profile.schema';
import {
  VERIFICATION_APPROVED,
  VERIFICATION_REJECTED,
} from '../../../../infrastructure/events/event-types';

/**
 * Verification Events Listener
 * Handles events related to verification operations
 */
@Injectable()
export class VerificationEventsListener {
  private readonly logger = new Logger(VerificationEventsListener.name);

  constructor(
    @InjectModel(Account.name)
    private accountModel: Model<AccountDocument>,
    @InjectModel(StoreOwnerProfile.name)
    private storeOwnerProfileModel: Model<StoreOwnerProfileDocument>,
    @InjectModel(CourierProfile.name)
    private courierProfileModel: Model<CourierProfileDocument>,
  ) {}

  /**
   * Handle verification approved event
   * Update account role when verification is approved
   */
  @OnEvent(VERIFICATION_APPROVED)
  async handleVerificationApproved(payload: {
    accountId: string;
    verificationRequestId: string;
    applicantType: 'store_owner' | 'courier';
    adminId: string;
  }) {
    this.logger.log(
      `Handling verification approved: ${payload.verificationRequestId} for account ${payload.accountId}`,
    );

    try {
      // Get account
      const account = await this.accountModel.findById(payload.accountId).exec();
      if (!account) {
        this.logger.error(`Account not found: ${payload.accountId}`);
        return;
      }

      // Get profile based on applicant type
      let profileId: Types.ObjectId | undefined;
      let profileRef: 'StoreOwnerProfile' | 'CourierProfile';

      if (payload.applicantType === 'store_owner') {
        const profile = await this.storeOwnerProfileModel
          .findOne({ accountId: new Types.ObjectId(payload.accountId) })
          .exec();

        if (!profile) {
          this.logger.error(
            `Store owner profile not found for account: ${payload.accountId}`,
          );
          return;
        }

        profileId = profile._id as Types.ObjectId;
        profileRef = 'StoreOwnerProfile';

        this.logger.log(
          `Store owner profile found: ${profileId}`,
        );
      } else if (payload.applicantType === 'courier') {
        const profile = await this.courierProfileModel
          .findOne({ accountId: new Types.ObjectId(payload.accountId) })
          .exec();

        if (!profile) {
          this.logger.error(
            `Courier profile not found for account: ${payload.accountId}`,
          );
          return;
        }

        profileId = profile._id as Types.ObjectId;
        profileRef = 'CourierProfile';

        this.logger.log(`Courier profile found: ${profileId}`);
      } else {
        this.logger.error(`Invalid applicant type: ${payload.applicantType}`);
        return;
      }

      // Update account role and profile references
      account.role = payload.applicantType;
      account.roleProfileId = profileId;
      account.roleProfileRef = profileRef;
      await account.save();

      this.logger.log(
        `Account role updated to ${payload.applicantType} for account: ${payload.accountId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle verification approved event: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle verification rejected event
   */
  @OnEvent(VERIFICATION_REJECTED)
  async handleVerificationRejected(payload: {
    accountId: string;
    verificationRequestId: string;
    applicantType: 'store_owner' | 'courier';
    adminId: string;
    rejectionReason?: string;
  }) {
    this.logger.log(
      `Handling verification rejected: ${payload.verificationRequestId} for account ${payload.accountId}`,
    );

    // TODO: Send notification to user
    // TODO: Log in audit logs
  }
}

