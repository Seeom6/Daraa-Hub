import { Injectable } from '@nestjs/common';
import {
  ReviewDocument,
  ReviewTargetType,
} from '../../../../database/schemas/review.schema';
import { CreateReviewDto, UpdateReviewDto } from '../dto';
import { ReviewCrudService } from './review-crud.service';
import { ReviewQueryService } from './review-query.service';
import { ReviewVerificationService } from './review-verification.service';

/**
 * Review Service - Facade
 * Delegates to specialized services for separation of concerns
 */
@Injectable()
export class ReviewService {
  constructor(
    private readonly crudService: ReviewCrudService,
    private readonly queryService: ReviewQueryService,
    private readonly verificationService: ReviewVerificationService,
  ) {}

  // ==================== CRUD Operations ====================

  async createReview(
    createDto: CreateReviewDto,
    accountId: string,
  ): Promise<ReviewDocument> {
    return this.crudService.createReview(createDto, accountId);
  }

  async updateReview(
    reviewId: string,
    updateDto: UpdateReviewDto,
    accountId: string,
  ): Promise<ReviewDocument> {
    return this.crudService.updateReview(reviewId, updateDto, accountId);
  }

  async deleteReview(reviewId: string, accountId: string): Promise<void> {
    return this.crudService.deleteReview(reviewId, accountId);
  }

  // ==================== Query Operations ====================

  async getReviewById(reviewId: string): Promise<ReviewDocument> {
    return this.queryService.getReviewById(reviewId);
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
    return this.queryService.getReviewsByTarget(
      targetType,
      targetId,
      page,
      limit,
      rating,
      verifiedOnly,
    );
  }

  // ==================== Verification Operations ====================

  async verifyPurchase(
    customerId: string,
    targetType: ReviewTargetType,
    targetId: string,
    orderId: string,
  ): Promise<boolean> {
    return this.verificationService.verifyPurchase(
      customerId,
      targetType,
      targetId,
      orderId,
    );
  }

  async verifyTargetExists(
    targetType: ReviewTargetType,
    targetId: string,
  ): Promise<void> {
    return this.verificationService.verifyTargetExists(targetType, targetId);
  }
}
