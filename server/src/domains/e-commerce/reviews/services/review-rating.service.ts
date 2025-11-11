import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ReviewTargetType,
  ReviewStatus,
} from '../../../../database/schemas/review.schema';
import { Product, ProductDocument } from '../../../../database/schemas/product.schema';
import {
  StoreOwnerProfile,
  StoreOwnerProfileDocument,
} from '../../../../database/schemas/store-owner-profile.schema';
import {
  CourierProfile,
  CourierProfileDocument,
} from '../../../../database/schemas/courier-profile.schema';
import { ReviewRepository } from '../repositories/review.repository';

/**
 * Service responsible for rating calculations and updates
 * Handles updating target ratings (Product, Store, Courier)
 */
@Injectable()
export class ReviewRatingService {
  private readonly logger = new Logger(ReviewRatingService.name);

  constructor(
    private readonly reviewRepository: ReviewRepository,
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    @InjectModel(StoreOwnerProfile.name)
    private storeProfileModel: Model<StoreOwnerProfileDocument>,
    @InjectModel(CourierProfile.name)
    private courierProfileModel: Model<CourierProfileDocument>,
  ) {}

  /**
   * Verify that the review target exists
   */
  async verifyTargetExists(targetType: ReviewTargetType, targetId: string): Promise<void> {
    if (targetType === ReviewTargetType.PRODUCT) {
      const product = await this.productModel.findById(targetId);
      if (!product) {
        throw new NotFoundException('Product not found');
      }
    } else if (targetType === ReviewTargetType.STORE) {
      const store = await this.storeProfileModel.findById(targetId);
      if (!store) {
        throw new NotFoundException('Store not found');
      }
    } else if (targetType === ReviewTargetType.COURIER) {
      const courier = await this.courierProfileModel.findById(targetId);
      if (!courier) {
        throw new NotFoundException('Courier not found');
      }
    }
  }

  /**
   * Update the average rating for a target (Product, Store, or Courier)
   */
  async updateTargetRating(targetType: ReviewTargetType, targetId: string): Promise<void> {
    const reviews = await (this.reviewRepository)
      .getModel()
      .find({
        targetType,
        targetId: new Types.ObjectId(targetId),
        status: ReviewStatus.APPROVED,
      })
      .select('rating');

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;

    if (targetType === ReviewTargetType.PRODUCT) {
      await this.productModel.findByIdAndUpdate(targetId, {
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: totalReviews,
      });
    } else if (targetType === ReviewTargetType.STORE) {
      await this.storeProfileModel.findByIdAndUpdate(targetId, {
        rating: Math.round(averageRating * 10) / 10,
        totalReviews: totalReviews,
      });
    } else if (targetType === ReviewTargetType.COURIER) {
      await this.courierProfileModel.findByIdAndUpdate(targetId, {
        rating: Math.round(averageRating * 10) / 10,
        totalReviews: totalReviews,
      });
    }

    this.logger.log(
      `Updated ${targetType} ${targetId} rating to ${averageRating.toFixed(1)} (${totalReviews} reviews)`,
    );
  }

  /**
   * Calculate rating distribution for a target
   */
  async calculateRatingDistribution(
    targetType: ReviewTargetType,
    targetId: string,
  ): Promise<{
    averageRating: number;
    ratingDistribution: { [key: number]: number };
    totalReviews: number;
  }> {
    const allReviews = await (this.reviewRepository)
      .getModel()
      .find({
        targetType,
        targetId: new Types.ObjectId(targetId),
        status: ReviewStatus.APPROVED,
      })
      .select('rating');

    const totalReviews = allReviews.length;
    const averageRating =
      totalReviews > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allReviews.forEach((r) => {
      ratingDistribution[r.rating]++;
    });

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
      totalReviews,
    };
  }
}

