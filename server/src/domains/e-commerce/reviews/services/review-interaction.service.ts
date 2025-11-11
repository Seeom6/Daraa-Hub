import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ReviewDocument,
  ReviewTargetType,
} from '../../../../database/schemas/review.schema';
import {
  StoreOwnerProfile,
  StoreOwnerProfileDocument,
} from '../../../../database/schemas/store-owner-profile.schema';
import {
  CustomerProfile,
  CustomerProfileDocument,
} from '../../../../database/schemas/customer-profile.schema';
import { StoreResponseDto } from '../dto';
import { ReviewRepository } from '../repositories/review.repository';

/**
 * Service responsible for review interactions
 * Handles store responses and helpful votes
 */
@Injectable()
export class ReviewInteractionService {
  private readonly logger = new Logger(ReviewInteractionService.name);

  constructor(
    private readonly reviewRepository: ReviewRepository,
    @InjectModel(StoreOwnerProfile.name)
    private storeProfileModel: Model<StoreOwnerProfileDocument>,
    @InjectModel(CustomerProfile.name)
    private customerProfileModel: Model<CustomerProfileDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Store Owner: Add response to review
   */
  async addStoreResponse(
    reviewId: string,
    responseDto: StoreResponseDto,
    accountId: string,
  ): Promise<ReviewDocument> {
    const review = await this.reviewRepository.getModel().findById(reviewId);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Verify review is for a product or store
    if (review.targetType === ReviewTargetType.COURIER) {
      throw new BadRequestException('Cannot respond to courier reviews');
    }

    // Get store profile
    const storeProfile = await this.storeProfileModel.findOne({
      accountId: new Types.ObjectId(accountId),
    });

    if (!storeProfile) {
      throw new NotFoundException('Store profile not found');
    }

    const storeId = (storeProfile._id as Types.ObjectId).toString();

    // Verify store ownership
    if (review.targetType === ReviewTargetType.PRODUCT) {
      // For product reviews, verify the product belongs to the store
      // This would require populating the product and checking its storeId
      // For now, we'll allow any store owner to respond
    } else if (review.targetType === ReviewTargetType.STORE) {
      // For store reviews, verify it's the same store
      if (review.targetId.toString() !== storeId) {
        throw new ForbiddenException('You can only respond to reviews for your own store');
      }
    }

    // Add store response
    review.storeResponse = {
      message: responseDto.message,
      respondedAt: new Date(),
      respondedBy: new Types.ObjectId(storeId),
    };

    await review.save();

    // Emit event
    this.eventEmitter.emit('review.store_response_added', {
      reviewId: (review._id as Types.ObjectId).toString(),
      storeId,
    });

    this.logger.log(`Store response added to review ${reviewId}`);

    return review;
  }

  /**
   * Customer: Mark review as helpful/not helpful
   */
  async markHelpful(
    reviewId: string,
    helpful: boolean,
    accountId: string,
  ): Promise<ReviewDocument> {
    const review = await this.reviewRepository.getModel().findById(reviewId);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // TODO: Track which users marked as helpful to prevent duplicate votes
    // For now, just increment the count

    if (helpful) {
      review.helpfulCount += 1;
    } else {
      review.notHelpfulCount += 1;
    }

    await review.save();

    this.logger.log(`Review ${reviewId} marked as ${helpful ? 'helpful' : 'not helpful'}`);

    return review;
  }

  /**
   * Get customer's reviews
   */
  async getCustomerReviews(
    accountId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    reviews: ReviewDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Get customer profile
    const customerProfile = await this.customerProfileModel.findOne({
      accountId: new Types.ObjectId(accountId),
    });

    if (!customerProfile) {
      throw new NotFoundException('Customer profile not found');
    }

    const customerId = (customerProfile._id as Types.ObjectId).toString();

    const query = { customerId: new Types.ObjectId(customerId) };

    const total = await this.reviewRepository.count(query);
    const reviews = await (this.reviewRepository)
      .getModel()
      .find(query)
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

