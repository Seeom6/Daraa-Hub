import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { VerificationRequest, VerificationRequestDocument } from '../../../../database/schemas/verification-request.schema';
import { StoreOwnerProfile, StoreOwnerProfileDocument } from '../../../../database/schemas/store-owner-profile.schema';
import { CourierProfile, CourierProfileDocument } from '../../../../database/schemas/courier-profile.schema';
import { SubmitVerificationDto } from '../dto/submit-verification.dto';
import { VERIFICATION_SUBMITTED } from '../../../../infrastructure/events/event-types';

/**
 * Verification Service
 * Handles core verification request operations (submit, get status, list)
 */
@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

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
   * Submit a new verification request
   */
  async submitVerification(
    accountId: string,
    submitDto: SubmitVerificationDto,
  ): Promise<VerificationRequestDocument> {
    // Check if there's already a pending verification
    const existingRequest = await this.verificationRequestModel
      .findOne({
        accountId: new Types.ObjectId(accountId),
        status: { $in: ['pending', 'under_review', 'info_required'] },
      })
      .exec();

    if (existingRequest) {
      throw new BadRequestException('You already have a pending verification request');
    }

    // Get the profile based on applicant type
    let profileId: Types.ObjectId;
    let profileModel: string;

    if (submitDto.applicantType === 'store_owner') {
      const storeOwnerProfile = await this.storeOwnerProfileModel
        .findOne({ accountId: new Types.ObjectId(accountId) })
        .exec();

      if (!storeOwnerProfile) {
        throw new NotFoundException('Store owner profile not found');
      }

      // Update store categories if provided
      if (submitDto.businessInfo?.primaryCategory || submitDto.businessInfo?.storeCategories) {
        if (submitDto.businessInfo.primaryCategory) {
          storeOwnerProfile.primaryCategory = new Types.ObjectId(submitDto.businessInfo.primaryCategory);
        }
        if (submitDto.businessInfo.storeCategories && submitDto.businessInfo.storeCategories.length > 0) {
          storeOwnerProfile.storeCategories = submitDto.businessInfo.storeCategories.map(
            (id) => new Types.ObjectId(id)
          );
        }
        await storeOwnerProfile.save();
      }

      profileId = storeOwnerProfile._id as Types.ObjectId;
      profileModel = 'StoreOwnerProfile';
    } else if (submitDto.applicantType === 'courier') {
      const courierProfile = await this.courierProfileModel
        .findOne({ accountId: new Types.ObjectId(accountId) })
        .exec();

      if (!courierProfile) {
        throw new NotFoundException('Courier profile not found');
      }

      profileId = courierProfile._id as Types.ObjectId;
      profileModel = 'CourierProfile';
    } else {
      throw new BadRequestException('Invalid applicant type');
    }

    // Create verification request
    const verificationRequest = new this.verificationRequestModel({
      accountId: new Types.ObjectId(accountId),
      profileId,
      profileModel,
      applicantType: submitDto.applicantType,
      status: 'pending',
      personalInfo: submitDto.personalInfo,
      businessInfo: submitDto.businessInfo,
      vehicleInfo: submitDto.vehicleInfo,
      additionalNotes: submitDto.additionalNotes,
      documents: [],
      history: [
        {
          action: 'submitted',
          performedBy: new Types.ObjectId(accountId),
          timestamp: new Date(),
          notes: 'Verification request submitted',
        },
      ],
    });

    const saved = await verificationRequest.save();

    // Update profile verification status
    await this.updateProfileVerificationStatus(
      accountId,
      submitDto.applicantType,
      'pending',
      new Date(),
    );

    // Emit event for notification
    this.eventEmitter.emit(VERIFICATION_SUBMITTED, {
      accountId,
      verificationRequestId: (saved._id as Types.ObjectId).toString(),
      applicantType: submitDto.applicantType,
    });

    this.logger.log(`Verification submitted for account: ${accountId}`);
    return saved;
  }

  /**
   * Get my verification status
   */
  async getMyVerificationStatus(accountId: string): Promise<VerificationRequestDocument | null> {
    return this.verificationRequestModel
      .findOne({ accountId: new Types.ObjectId(accountId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get all verification requests (Admin only)
   */
  async getAllVerificationRequests(filters?: {
    status?: string;
    applicantType?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    requests: VerificationRequestDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.applicantType) {
      query.applicantType = filters.applicantType;
    }

    const [requests, total] = await Promise.all([
      this.verificationRequestModel
        .find(query)
        .populate('accountId', 'fullName phone email')
        .populate('reviewedBy', 'fullName')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.verificationRequestModel.countDocuments(query).exec(),
    ]);

    return {
      requests,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get verification request by ID
   */
  async getVerificationRequestById(id: string): Promise<VerificationRequestDocument> {
    const request = await this.verificationRequestModel
      .findById(id)
      .populate('accountId', 'fullName phone email')
      .populate('reviewedBy', 'fullName')
      .exec();

    if (!request) {
      throw new NotFoundException('Verification request not found');
    }

    return request;
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

