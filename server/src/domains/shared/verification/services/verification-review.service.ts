import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { VerificationRequest, VerificationRequestDocument } from '../../../../database/schemas/verification-request.schema';
import { StoreOwnerProfile, StoreOwnerProfileDocument } from '../../../../database/schemas/store-owner-profile.schema';
import { CourierProfile, CourierProfileDocument } from '../../../../database/schemas/courier-profile.schema';
import { ReviewVerificationDto } from '../dto/review-verification.dto';
import {
  VERIFICATION_APPROVED,
  VERIFICATION_REJECTED,
  VERIFICATION_INFO_REQUESTED,
} from '../../../../infrastructure/events/event-types';

/**
 * Verification Review Service
 * Handles review, approval, rejection, and info requests for verification requests
 */
@Injectable()
export class VerificationReviewService {
  private readonly logger = new Logger(VerificationReviewService.name);

  constructor(
    @InjectModel(VerificationRequest.name)
    private verificationRequestModel: Model<VerificationRequestDocument>,
    @InjectModel(StoreOwnerProfile.name)
    private storeOwnerProfileModel: Model<StoreOwnerProfileDocument>,
    @InjectModel(CourierProfile.name)
    private courierProfileModel: Model<CourierProfileDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Review a verification request (approve, reject, or request info)
   */
  async reviewVerification(
    verificationRequestId: string,
    reviewDto: ReviewVerificationDto,
    adminId: string,
  ): Promise<VerificationRequestDocument> {
    const verificationRequest = await this.verificationRequestModel
      .findById(verificationRequestId)
      .exec();

    if (!verificationRequest) {
      throw new NotFoundException('Verification request not found');
    }

    if (verificationRequest.status === 'approved' || verificationRequest.status === 'rejected') {
      throw new BadRequestException('This verification request has already been finalized');
    }

    const accountId = verificationRequest.accountId.toString();
    const applicantType = verificationRequest.applicantType;

    // Update verification request based on action
    if (reviewDto.action === 'approve') {
      verificationRequest.status = 'approved';
      verificationRequest.reviewedBy = new Types.ObjectId(adminId);
      verificationRequest.reviewedAt = new Date();
      verificationRequest.history.push({
        action: 'approved',
        performedBy: new Types.ObjectId(adminId),
        timestamp: new Date(),
        notes: reviewDto.notes,
      });

      // Update profile verification status
      await this.updateProfileVerificationStatus(
        accountId,
        applicantType,
        'approved',
        undefined,
        new Date(),
        new Types.ObjectId(adminId),
      );

      // Emit event
      this.eventEmitter.emit(VERIFICATION_APPROVED, {
        accountId,
        verificationRequestId,
        applicantType,
        adminId,
      });

      this.logger.log(`Verification approved: ${verificationRequestId}`);
    } else if (reviewDto.action === 'reject') {
      verificationRequest.status = 'rejected';
      verificationRequest.reviewedBy = new Types.ObjectId(adminId);
      verificationRequest.reviewedAt = new Date();
      verificationRequest.rejectionReason = reviewDto.rejectionReason;
      verificationRequest.history.push({
        action: 'rejected',
        performedBy: new Types.ObjectId(adminId),
        timestamp: new Date(),
        notes: reviewDto.notes || reviewDto.rejectionReason,
      });

      // Update profile verification status
      await this.updateProfileVerificationStatus(
        accountId,
        applicantType,
        'rejected',
        undefined,
        new Date(),
        new Types.ObjectId(adminId),
        reviewDto.rejectionReason,
      );

      // Emit event
      this.eventEmitter.emit(VERIFICATION_REJECTED, {
        accountId,
        verificationRequestId,
        applicantType,
        adminId,
        reason: reviewDto.rejectionReason,
      });

      this.logger.log(`Verification rejected: ${verificationRequestId}`);
    } else if (reviewDto.action === 'request_info') {
      verificationRequest.status = 'info_required';
      verificationRequest.infoRequired = reviewDto.infoRequired;
      verificationRequest.history.push({
        action: 'info_required',
        performedBy: new Types.ObjectId(adminId),
        timestamp: new Date(),
        notes: reviewDto.infoRequired,
      });

      // Emit event
      this.eventEmitter.emit(VERIFICATION_INFO_REQUESTED, {
        accountId,
        verificationRequestId,
        applicantType,
        adminId,
        infoRequired: reviewDto.infoRequired,
      });

      this.logger.log(`Info requested for verification: ${verificationRequestId}`);
    }

    return verificationRequest.save();
  }

  /**
   * Update profile verification status
   */
  private async updateProfileVerificationStatus(
    accountId: string,
    applicantType: 'store_owner' | 'courier',
    status: string,
    submittedAt?: Date,
    reviewedAt?: Date,
    reviewedBy?: Types.ObjectId,
    rejectionReason?: string,
  ): Promise<void> {
    const updateData: any = {
      verificationStatus: status,
    };

    if (submittedAt) {
      updateData.verificationSubmittedAt = submittedAt;
    }

    if (reviewedAt) {
      updateData.verificationReviewedAt = reviewedAt;
    }

    if (reviewedBy) {
      updateData.verificationReviewedBy = reviewedBy;
    }

    if (rejectionReason) {
      updateData.verificationRejectionReason = rejectionReason;
    }

    if (applicantType === 'store_owner') {
      await this.storeOwnerProfileModel
        .findOneAndUpdate({ accountId: new Types.ObjectId(accountId) }, updateData)
        .exec();
    } else {
      await this.courierProfileModel
        .findOneAndUpdate({ accountId: new Types.ObjectId(accountId) }, updateData)
        .exec();
    }
  }
}

