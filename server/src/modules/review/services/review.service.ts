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
  Review,
  ReviewDocument,
  ReviewTargetType,
  ReviewStatus,
} from '../../../database/schemas/review.schema';
import { Order, OrderDocument } from '../../../database/schemas/order.schema';
import { Product, ProductDocument } from '../../../database/schemas/product.schema';
import {
  StoreOwnerProfile,
  StoreOwnerProfileDocument,
} from '../../../database/schemas/store-owner-profile.schema';
import {
  CourierProfile,
  CourierProfileDocument,
} from '../../../database/schemas/courier-profile.schema';
import {
  CustomerProfile,
  CustomerProfileDocument,
} from '../../../database/schemas/customer-profile.schema';
import {
  CreateReviewDto,
  UpdateReviewDto,
  ModerateReviewDto,
  StoreResponseDto,
} from '../dto';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    @InjectModel(Review.name)
    private reviewModel: Model<ReviewDocument>,
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    @InjectModel(StoreOwnerProfile.name)
    private storeProfileModel: Model<StoreOwnerProfileDocument>,
    @InjectModel(CourierProfile.name)
    private courierProfileModel: Model<CourierProfileDocument>,
    @InjectModel(CustomerProfile.name)
    private customerProfileModel: Model<CustomerProfileDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async createReview(
    createDto: CreateReviewDto,
    accountId: string,
  ): Promise<ReviewDocument> {
    // Get customer profile
    const customerProfile = await this.customerProfileModel
      .findOne({ accountId: new Types.ObjectId(accountId) })
      .exec();

    if (!customerProfile) {
      throw new NotFoundException('Customer profile not found');
    }

    const customerId = (customerProfile._id as Types.ObjectId).toString();

    // Verify purchase if orderId is provided
    let isVerifiedPurchase = false;
    if (createDto.orderId) {
      const order = await this.orderModel
        .findOne({
          _id: new Types.ObjectId(createDto.orderId),
          customerId: new Types.ObjectId(customerId),
          orderStatus: 'delivered',
        })
        .exec();

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

      // Check if review already exists for this order and target
      const existingReview = await this.reviewModel
        .findOne({
          customerId: new Types.ObjectId(customerId),
          targetType: createDto.targetType,
          targetId: new Types.ObjectId(createDto.targetId),
          orderId: new Types.ObjectId(createDto.orderId),
        })
        .exec();

      if (existingReview) {
        throw new BadRequestException('You have already reviewed this item for this order');
      }
    }

    // Verify target exists
    await this.verifyTargetExists(createDto.targetType, createDto.targetId);

    // Create review
    const review = new this.reviewModel({
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
    await this.updateTargetRating(createDto.targetType, createDto.targetId);

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

  async updateReview(
    reviewId: string,
    updateDto: UpdateReviewDto,
    accountId: string,
  ): Promise<ReviewDocument> {
    const review = await this.reviewModel.findById(reviewId).exec();

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Get customer profile
    const customerProfile = await this.customerProfileModel
      .findOne({ accountId: new Types.ObjectId(accountId) })
      .exec();

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
    await this.updateTargetRating(review.targetType, review.targetId.toString());

    // Emit event
    this.eventEmitter.emit('review.updated', {
      reviewId: (review._id as Types.ObjectId).toString(),
      targetType: review.targetType,
      targetId: review.targetId.toString(),
    });

    this.logger.log(`Review ${reviewId} updated`);

    return review;
  }

  async deleteReview(reviewId: string, accountId: string): Promise<void> {
    const review = await this.reviewModel.findById(reviewId).exec();

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Get customer profile
    const customerProfile = await this.customerProfileModel
      .findOne({ accountId: new Types.ObjectId(accountId) })
      .exec();

    if (!customerProfile) {
      throw new NotFoundException('Customer profile not found');
    }

    // Verify ownership
    if (review.customerId.toString() !== (customerProfile._id as Types.ObjectId).toString()) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    const targetType = review.targetType;
    const targetId = review.targetId.toString();

    await this.reviewModel.findByIdAndDelete(reviewId).exec();

    // Update target rating
    await this.updateTargetRating(targetType, targetId);

    // Emit event
    this.eventEmitter.emit('review.deleted', {
      reviewId,
      targetType,
      targetId,
    });

    this.logger.log(`Review ${reviewId} deleted`);
  }

  async getReviewById(reviewId: string): Promise<ReviewDocument> {
    const review = await this.reviewModel
      .findById(reviewId)
      .populate('customerId', 'accountId')
      .exec();

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

    const total = await this.reviewModel.countDocuments(query).exec();
    const reviews = await this.reviewModel
      .find(query)
      .populate('customerId', 'accountId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    // Calculate average rating and distribution
    const allReviews = await this.reviewModel
      .find({
        targetType,
        targetId: new Types.ObjectId(targetId),
        status: ReviewStatus.APPROVED,
      })
      .select('rating')
      .exec();

    const averageRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allReviews.forEach((r) => {
      ratingDistribution[r.rating]++;
    });

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
    };
  }

  private async verifyTargetExists(targetType: ReviewTargetType, targetId: string): Promise<void> {
    if (targetType === ReviewTargetType.PRODUCT) {
      const product = await this.productModel.findById(targetId).exec();
      if (!product) {
        throw new NotFoundException('Product not found');
      }
    } else if (targetType === ReviewTargetType.STORE) {
      const store = await this.storeProfileModel.findById(targetId).exec();
      if (!store) {
        throw new NotFoundException('Store not found');
      }
    } else if (targetType === ReviewTargetType.COURIER) {
      const courier = await this.courierProfileModel.findById(targetId).exec();
      if (!courier) {
        throw new NotFoundException('Courier not found');
      }
    }
  }

  private async updateTargetRating(targetType: ReviewTargetType, targetId: string): Promise<void> {
    const reviews = await this.reviewModel
      .find({
        targetType,
        targetId: new Types.ObjectId(targetId),
        status: ReviewStatus.APPROVED,
      })
      .select('rating')
      .exec();

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;

    if (targetType === ReviewTargetType.PRODUCT) {
      await this.productModel
        .findByIdAndUpdate(targetId, {
          rating: Math.round(averageRating * 10) / 10,
          reviewCount: totalReviews,
        })
        .exec();
    } else if (targetType === ReviewTargetType.STORE) {
      await this.storeProfileModel
        .findByIdAndUpdate(targetId, {
          rating: Math.round(averageRating * 10) / 10,
          totalReviews: totalReviews,
        })
        .exec();
    } else if (targetType === ReviewTargetType.COURIER) {
      await this.courierProfileModel
        .findByIdAndUpdate(targetId, {
          rating: Math.round(averageRating * 10) / 10,
          totalReviews: totalReviews,
        })
        .exec();
    }

    this.logger.log(
      `Updated ${targetType} ${targetId} rating to ${averageRating.toFixed(1)} (${totalReviews} reviews)`,
    );
  }

  // Admin: Moderate review
  async moderateReview(
    reviewId: string,
    moderateDto: ModerateReviewDto,
    adminId: string,
  ): Promise<ReviewDocument> {
    const review = await this.reviewModel.findById(reviewId).exec();

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.status = moderateDto.status;
    review.moderatedBy = new Types.ObjectId(adminId);
    review.moderationNotes = moderateDto.moderationNotes;

    await review.save();

    // Update target rating
    await this.updateTargetRating(review.targetType, review.targetId.toString());

    // Emit event
    this.eventEmitter.emit('review.moderated', {
      reviewId: (review._id as Types.ObjectId).toString(),
      status: moderateDto.status,
      moderatedBy: adminId,
    });

    this.logger.log(`Review ${reviewId} moderated to ${moderateDto.status} by admin ${adminId}`);

    return review;
  }

  // Store Owner: Respond to review
  async addStoreResponse(
    reviewId: string,
    responseDto: StoreResponseDto,
    accountId: string,
  ): Promise<ReviewDocument> {
    const review = await this.reviewModel.findById(reviewId).exec();

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Verify review is for a product or store
    if (review.targetType === ReviewTargetType.COURIER) {
      throw new BadRequestException('Cannot respond to courier reviews');
    }

    // Get store profile
    const storeProfile = await this.storeProfileModel
      .findOne({ accountId: new Types.ObjectId(accountId) })
      .exec();

    if (!storeProfile) {
      throw new NotFoundException('Store profile not found');
    }

    const storeId = (storeProfile._id as Types.ObjectId).toString();

    // Verify ownership
    if (review.targetType === ReviewTargetType.PRODUCT) {
      const product = await this.productModel.findById(review.targetId).exec();
      if (!product || product.storeId.toString() !== storeId) {
        throw new ForbiddenException('You can only respond to reviews of your products');
      }
    } else if (review.targetType === ReviewTargetType.STORE) {
      if (review.targetId.toString() !== storeId) {
        throw new ForbiddenException('You can only respond to reviews of your store');
      }
    }

    review.storeResponse = {
      message: responseDto.message,
      respondedAt: new Date(),
      respondedBy: new Types.ObjectId(accountId),
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

  // Customer: Mark review as helpful/not helpful
  async markHelpful(
    reviewId: string,
    helpful: boolean,
    accountId: string,
  ): Promise<ReviewDocument> {
    const review = await this.reviewModel.findById(reviewId).exec();

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

  // Get customer's reviews
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
    const customerProfile = await this.customerProfileModel
      .findOne({ accountId: new Types.ObjectId(accountId) })
      .exec();

    if (!customerProfile) {
      throw new NotFoundException('Customer profile not found');
    }

    const customerId = (customerProfile._id as Types.ObjectId).toString();

    const total = await this.reviewModel
      .countDocuments({ customerId: new Types.ObjectId(customerId) })
      .exec();

    const reviews = await this.reviewModel
      .find({ customerId: new Types.ObjectId(customerId) })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Admin: Get all reviews for moderation
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

    const total = await this.reviewModel.countDocuments(query).exec();
    const reviews = await this.reviewModel
      .find(query)
      .populate('customerId', 'accountId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}

