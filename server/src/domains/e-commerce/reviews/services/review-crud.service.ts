import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ReviewDocument,
  ReviewStatus,
} from '../../../../database/schemas/review.schema';
import { CreateReviewDto, UpdateReviewDto } from '../dto';
import { ReviewRepository } from '../repositories/review.repository';
import { ReviewRatingService } from './review-rating.service';
import { ReviewVerificationService } from './review-verification.service';

/**
 * Review CRUD Service
 * Handles create, update, delete operations for reviews
 */
@Injectable()
export class ReviewCrudService {
  private readonly logger = new Logger(ReviewCrudService.name);

  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly reviewRatingService: ReviewRatingService,
    private readonly verificationService: ReviewVerificationService,
    private eventEmitter: EventEmitter2,
  ) {}

  async createReview(
    createDto: CreateReviewDto,
    accountId: string,
  ): Promise<ReviewDocument> {
    const customerProfile =
      await this.verificationService.getCustomerProfile(accountId);
    const customerId = (customerProfile._id as Types.ObjectId).toString();

    let isVerifiedPurchase = false;
    if (createDto.orderId) {
      await this.verificationService.verifyPurchase(
        customerId,
        createDto.targetType,
        createDto.targetId,
        createDto.orderId,
      );
      await this.verificationService.checkDuplicateReview(
        customerId,
        createDto.targetType,
        createDto.targetId,
        createDto.orderId,
      );
      isVerifiedPurchase = true;
    }

    await this.verificationService.verifyTargetExists(
      createDto.targetType,
      createDto.targetId,
    );

    const ReviewModel = this.reviewRepository.getModel();
    const review = new ReviewModel({
      customerId: new Types.ObjectId(customerId),
      targetType: createDto.targetType,
      targetId: new Types.ObjectId(createDto.targetId),
      orderId: createDto.orderId
        ? new Types.ObjectId(createDto.orderId)
        : undefined,
      rating: createDto.rating,
      title: createDto.title,
      comment: createDto.comment,
      images: createDto.images || [],
      isVerifiedPurchase,
      status: ReviewStatus.APPROVED,
    });

    await review.save();

    await this.reviewRatingService.updateTargetRating(
      createDto.targetType,
      createDto.targetId,
    );

    this.eventEmitter.emit('review.created', {
      reviewId: (review._id as Types.ObjectId).toString(),
      customerId,
      targetType: createDto.targetType,
      targetId: createDto.targetId,
      rating: createDto.rating,
    });

    this.logger.log(
      `Review created for ${createDto.targetType} ${createDto.targetId}`,
    );
    return review;
  }

  async updateReview(
    reviewId: string,
    updateDto: UpdateReviewDto,
    accountId: string,
  ): Promise<ReviewDocument> {
    const review = await this.reviewRepository.getModel().findById(reviewId);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const customerProfile =
      await this.verificationService.getCustomerProfile(accountId);
    if (
      review.customerId.toString() !==
      (customerProfile._id as Types.ObjectId).toString()
    ) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    if (updateDto.rating !== undefined) review.rating = updateDto.rating;
    if (updateDto.title !== undefined) review.title = updateDto.title;
    if (updateDto.comment !== undefined) review.comment = updateDto.comment;
    if (updateDto.images !== undefined) review.images = updateDto.images;

    review.isEdited = true;
    review.editedAt = new Date();
    await review.save();

    await this.reviewRatingService.updateTargetRating(
      review.targetType,
      review.targetId.toString(),
    );

    this.eventEmitter.emit('review.updated', {
      reviewId: (review._id as Types.ObjectId).toString(),
      targetType: review.targetType,
      targetId: review.targetId.toString(),
    });

    this.logger.log(`Review ${reviewId} updated`);
    return review;
  }

  async deleteReview(reviewId: string, accountId: string): Promise<void> {
    const review = await this.reviewRepository.getModel().findById(reviewId);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const customerProfile =
      await this.verificationService.getCustomerProfile(accountId);
    if (
      review.customerId.toString() !==
      (customerProfile._id as Types.ObjectId).toString()
    ) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    const targetType = review.targetType;
    const targetId = review.targetId.toString();

    await this.reviewRepository.delete(reviewId);
    await this.reviewRatingService.updateTargetRating(targetType, targetId);

    this.eventEmitter.emit('review.deleted', {
      reviewId,
      targetType,
      targetId,
    });
    this.logger.log(`Review ${reviewId} deleted`);
  }
}
