import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ReviewTargetType } from '../../../../database/schemas/review.schema';
import {
  Order,
  OrderDocument,
} from '../../../../database/schemas/order.schema';
import {
  CustomerProfile,
  CustomerProfileDocument,
} from '../../../../database/schemas/customer-profile.schema';
import { ReviewRepository } from '../repositories/review.repository';
import { ReviewRatingService } from './review-rating.service';

/**
 * Review Verification Service
 * Handles purchase verification and eligibility checks
 */
@Injectable()
export class ReviewVerificationService {
  private readonly logger = new Logger(ReviewVerificationService.name);

  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly reviewRatingService: ReviewRatingService,
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectModel(CustomerProfile.name)
    private customerProfileModel: Model<CustomerProfileDocument>,
  ) {}

  async getCustomerProfile(
    accountId: string,
  ): Promise<CustomerProfileDocument> {
    const customerProfile = await this.customerProfileModel.findOne({
      accountId: new Types.ObjectId(accountId),
    });

    if (!customerProfile) {
      throw new NotFoundException('Customer profile not found');
    }

    return customerProfile;
  }

  async verifyPurchase(
    customerId: string,
    targetType: ReviewTargetType,
    targetId: string,
    orderId: string,
  ): Promise<boolean> {
    const order = await this.orderModel.findOne({
      _id: new Types.ObjectId(orderId),
      customerId: new Types.ObjectId(customerId),
      orderStatus: 'delivered',
    });

    if (!order) {
      throw new BadRequestException('Order not found or not delivered');
    }

    // Verify target is in the order
    if (targetType === ReviewTargetType.PRODUCT) {
      const productInOrder = order.items.some(
        (item) => item.productId.toString() === targetId,
      );
      if (!productInOrder) {
        throw new BadRequestException('Product not found in order');
      }
    } else if (targetType === ReviewTargetType.STORE) {
      if (order.storeId.toString() !== targetId) {
        throw new BadRequestException('Store does not match order');
      }
    } else if (targetType === ReviewTargetType.COURIER) {
      if (!order.courierId || order.courierId.toString() !== targetId) {
        throw new BadRequestException('Courier does not match order');
      }
    }

    return true;
  }

  async checkDuplicateReview(
    customerId: string,
    targetType: ReviewTargetType,
    targetId: string,
    orderId: string,
  ): Promise<void> {
    const existingReview = await this.reviewRepository.findOne({
      customerId: new Types.ObjectId(customerId),
      targetType,
      targetId: new Types.ObjectId(targetId),
      orderId: new Types.ObjectId(orderId),
    });

    if (existingReview) {
      throw new BadRequestException(
        'You have already reviewed this item for this order',
      );
    }
  }

  async verifyTargetExists(
    targetType: ReviewTargetType,
    targetId: string,
  ): Promise<void> {
    await this.reviewRatingService.verifyTargetExists(targetType, targetId);
  }

  async verifyReviewOwnership(
    reviewCustomerId: Types.ObjectId,
    accountId: string,
  ): Promise<void> {
    const customerProfile = await this.getCustomerProfile(accountId);

    if (
      reviewCustomerId.toString() !==
      (customerProfile._id as Types.ObjectId).toString()
    ) {
      throw new BadRequestException('You can only modify your own reviews');
    }
  }
}
