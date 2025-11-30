import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  ReviewDocument,
  ReviewTargetType,
  ReviewStatus,
} from '../../../../database/schemas/review.schema';
import { ReviewRepository } from '../repositories/review.repository';
import { ReviewRatingService } from './review-rating.service';

/**
 * Review Query Service
 * Handles all read/query operations for reviews
 */
@Injectable()
export class ReviewQueryService {
  private readonly logger = new Logger(ReviewQueryService.name);

  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly reviewRatingService: ReviewRatingService,
  ) {}

  async getReviewById(reviewId: string): Promise<ReviewDocument> {
    const review = await this.reviewRepository
      .getModel()
      .findById(reviewId)
      .populate('customerId', 'accountId');

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async getReviewsByTarget(
    targetType: ReviewTargetType,
    targetId: string,
    page: number = 1,
    limit: number = 10,
    rating?: number,
    verifiedOnly?: boolean,
  ): Promise<{
    reviews: ReviewDocument[];
    total: number;
    page: number;
    totalPages: number;
    averageRating: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const query: any = {
      targetType,
      targetId: new Types.ObjectId(targetId),
      status: ReviewStatus.APPROVED,
    };

    if (rating) {
      query.rating = rating;
    }

    if (verifiedOnly) {
      query.isVerifiedPurchase = true;
    }

    const total = await this.reviewRepository.count(query);
    const reviews = await this.reviewRepository
      .getModel()
      .find(query)
      .populate('customerId', 'accountId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const ratingStats =
      await this.reviewRatingService.calculateRatingDistribution(
        targetType,
        targetId,
      );

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      averageRating: ratingStats.averageRating,
      ratingDistribution: ratingStats.ratingDistribution,
    };
  }
}
