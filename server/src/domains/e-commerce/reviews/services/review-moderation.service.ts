import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import {
  ReviewDocument,
  ReviewStatus,
  ReviewTargetType,
} from '../../../../database/schemas/review.schema';
import { ModerateReviewDto } from '../dto';
import { ReviewRepository } from '../repositories/review.repository';
import { ReviewRatingService } from './review-rating.service';

/**
 * Service responsible for review moderation (Admin operations)
 * Handles review approval, rejection, and admin queries
 */
@Injectable()
export class ReviewModerationService {
  private readonly logger = new Logger(ReviewModerationService.name);

  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly reviewRatingService: ReviewRatingService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Admin: Moderate review (approve/reject)
   */
  async moderateReview(
    reviewId: string,
    moderateDto: ModerateReviewDto,
    adminId: string,
  ): Promise<ReviewDocument> {
    const review = await this.reviewRepository.getModel().findById(reviewId);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.status = moderateDto.status;
    review.moderatedBy = new Types.ObjectId(adminId);
    review.moderationNotes = moderateDto.moderationNotes;

    await review.save();

    // Update target rating
    await this.reviewRatingService.updateTargetRating(
      review.targetType,
      review.targetId.toString(),
    );

    // Emit event
    this.eventEmitter.emit('review.moderated', {
      reviewId: (review._id as Types.ObjectId).toString(),
      status: moderateDto.status,
      moderatedBy: adminId,
    });

    this.logger.log(`Review ${reviewId} moderated to ${moderateDto.status} by admin ${adminId}`);

    return review;
  }

  /**
   * Admin: Get all reviews for moderation
   */
  async getAllReviews(
    page: number = 1,
    limit: number = 10,
    status?: ReviewStatus,
    targetType?: ReviewTargetType,
  ): Promise<{
    reviews: ReviewDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (targetType) {
      query.targetType = targetType;
    }

    const total = await this.reviewRepository.count(query);
    const reviews = await (this.reviewRepository)
      .getModel()
      .find(query)
      .populate('customerId', 'accountId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}

