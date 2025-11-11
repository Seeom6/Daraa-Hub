import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ReviewDocument,
  ReviewTargetType,
  ReviewStatus,
} from '../../../../database/schemas/review.schema';
import { Order, OrderDocument } from '../../../../database/schemas/order.schema';
import {
  CustomerProfile,
  CustomerProfileDocument,
} from '../../../../database/schemas/customer-profile.schema';
import { CreateReviewDto, UpdateReviewDto } from '../dto';
import { ReviewRepository } from '../repositories/review.repository';
import { ReviewRatingService } from './review-rating.service';

/**
 * Core Review Service
 * Handles CRUD operations for reviews
 */
@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly reviewRatingService: ReviewRatingService,
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectModel(CustomerProfile.name)
    private customerProfileModel: Model<CustomerProfileDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new review
   */
  async createReview(
    createDto: CreateReviewDto,
    accountId: string,
  ): Promise<ReviewDocument> {
    // Get customer profile
    const customerProfile = await this.customerProfileModel.findOne({
      accountId: new Types.ObjectId(accountId),
    });

    if (!customerProfile) {
      throw new NotFoundException('Customer profile not found');
    }

    const customerId = (customerProfile._id as Types.ObjectId).toString();

    // Verify purchase if orderId is provided
    let isVerifiedPurchase = false;
    if (createDto.orderId) {
      const order = await this.orderModel.findOne({
        _id: new Types.ObjectId(createDto.orderId),
        customerId: new Types.ObjectId(customerId),
        orderStatus: 'delivered',
      });

      if (!order) {
        throw new BadRequestException('Order not found or not delivered');
      }

      // Verify target is in the order
      if (createDto.targetType === ReviewTargetType.PRODUCT) {
        const productInOrder = order.items.some(
          (item) => item.productId.toString() === createDto.targetId,
        );
        if (!productInOrder) {
          throw new BadRequestException('Product not found in order');
        }
      } else if (createDto.targetType === ReviewTargetType.STORE) {
        if (order.storeId.toString() !== createDto.targetId) {
          throw new BadRequestException('Store does not match order');
        }
      } else if (createDto.targetType === ReviewTargetType.COURIER) {
        if (!order.courierId || order.courierId.toString() !== createDto.targetId) {
          throw new BadRequestException('Courier does not match order');
        }
      }

      isVerifiedPurchase = true;

      // Check if already reviewed
      const existingReview = await this.reviewRepository.findOne({
        customerId: new Types.ObjectId(customerId),
        targetType: createDto.targetType,
        targetId: new Types.ObjectId(createDto.targetId),
        orderId: new Types.ObjectId(createDto.orderId),
      });

      if (existingReview) {
        throw new BadRequestException('You have already reviewed this item for this order');
      }
    }

    // Verify target exists
    await this.reviewRatingService.verifyTargetExists(createDto.targetType, createDto.targetId);

    // Create review
    const ReviewModel = this.reviewRepository.getModel();
    const review = new ReviewModel({
      customerId: new Types.ObjectId(customerId),
      targetType: createDto.targetType,
      targetId: new Types.ObjectId(createDto.targetId),
      orderId: createDto.orderId ? new Types.ObjectId(createDto.orderId) : undefined,
      rating: createDto.rating,
      title: createDto.title,
      comment: createDto.comment,
      images: createDto.images || [],
      isVerifiedPurchase,
      status: ReviewStatus.APPROVED, // Auto-approve by default
    });

    await review.save();

    // Update target rating
    await this.reviewRatingService.updateTargetRating(
      createDto.targetType,
      createDto.targetId,
    );

    // Emit event
    this.eventEmitter.emit('review.created', {
      reviewId: (review._id as Types.ObjectId).toString(),
      customerId,
      targetType: createDto.targetType,
      targetId: createDto.targetId,
      rating: createDto.rating,
    });

    this.logger.log(
      `Review created for ${createDto.targetType} ${createDto.targetId} by customer ${customerId}`,
    );

    return review;
  }

  /**
   * Update a review
   */
  async updateReview(
    reviewId: string,
    updateDto: UpdateReviewDto,
    accountId: string,
  ): Promise<ReviewDocument> {
    const review = await this.reviewRepository.getModel().findById(reviewId);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Get customer profile
    const customerProfile = await this.customerProfileModel.findOne({
      accountId: new Types.ObjectId(accountId),
    });

    if (!customerProfile) {
      throw new NotFoundException('Customer profile not found');
    }

    // Verify ownership
    if (review.customerId.toString() !== (customerProfile._id as Types.ObjectId).toString()) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Update fields
    if (updateDto.rating !== undefined) review.rating = updateDto.rating;
    if (updateDto.title !== undefined) review.title = updateDto.title;
    if (updateDto.comment !== undefined) review.comment = updateDto.comment;
    if (updateDto.images !== undefined) review.images = updateDto.images;

    review.isEdited = true;
    review.editedAt = new Date();

    await review.save();

    // Update target rating
    await this.reviewRatingService.updateTargetRating(
      review.targetType,
      review.targetId.toString(),
    );

    // Emit event
    this.eventEmitter.emit('review.updated', {
      reviewId: (review._id as Types.ObjectId).toString(),
      targetType: review.targetType,
      targetId: review.targetId.toString(),
    });

    this.logger.log(`Review ${reviewId} updated`);

    return review;
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string, accountId: string): Promise<void> {
    const review = await this.reviewRepository.getModel().findById(reviewId);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Get customer profile
    const customerProfile = await this.customerProfileModel.findOne({
      accountId: new Types.ObjectId(accountId),
    });

    if (!customerProfile) {
      throw new NotFoundException('Customer profile not found');
    }

    // Verify ownership
    if (review.customerId.toString() !== (customerProfile._id as Types.ObjectId).toString()) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    const targetType = review.targetType;
    const targetId = review.targetId.toString();

    await this.reviewRepository.delete(reviewId);

    // Update target rating
    await this.reviewRatingService.updateTargetRating(targetType, targetId);

    // Emit event
    this.eventEmitter.emit('review.deleted', {
      reviewId,
      targetType,
      targetId,
    });

    this.logger.log(`Review ${reviewId} deleted`);
  }

  /**
   * Get review by ID
   */
  async getReviewById(reviewId: string): Promise<ReviewDocument> {
    const review = await (this.reviewRepository)
      .getModel()
      .findById(reviewId)
      .populate('customerId', 'accountId');

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  /**
   * Get reviews by target (product/store/courier)
   */
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
    const reviews = await (this.reviewRepository)
      .getModel()
      .find(query)
      .populate('customerId', 'accountId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Calculate average rating and distribution
    const ratingStats = await this.reviewRatingService.calculateRatingDistribution(
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

