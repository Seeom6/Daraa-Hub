import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  VerificationRequest,
  VerificationRequestDocument,
} from '../../../../database/schemas/verification-request.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class VerificationRepository extends BaseRepository<VerificationRequestDocument> {
  constructor(
    @InjectModel(VerificationRequest.name)
    private readonly verificationModel: Model<VerificationRequestDocument>,
  ) {
    super(verificationModel);
  }

  /**
   * Find verification by account ID
   */
  async findByAccountId(accountId: string): Promise<VerificationRequestDocument | null> {
    return this.verificationModel
      .findOne({ accountId: new Types.ObjectId(accountId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Find verifications by status
   */
  async findByStatus(
    status: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: VerificationRequestDocument[]; total: number }> {
    return this.findWithPagination(
      { status },
      page,
      limit,
      { sort: { createdAt: -1 } },
    );
  }

  /**
   * Update verification status
   */
  async updateStatus(
    verificationId: string,
    status: string,
    reviewedBy?: string,
    rejectionReason?: string,
  ): Promise<VerificationRequestDocument | null> {
    const updateData: any = {
      status,
      reviewedAt: new Date(),
    };

    if (reviewedBy) {
      updateData.reviewedBy = new Types.ObjectId(reviewedBy);
    }

    if (rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    return this.findByIdAndUpdate(verificationId, updateData);
  }

  /**
   * Get pending verifications count
   */
  async getPendingCount(): Promise<number> {
    return this.count({ status: 'pending' });
  }

  /**
   * Find verifications by type
   */
  async findByType(
    type: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: VerificationRequestDocument[]; total: number }> {
    return this.findWithPagination(
      { verificationType: type },
      page,
      limit,
      { sort: { createdAt: -1 } },
    );
  }
}

