import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { CouponDocument } from '../../../../database/schemas/coupon.schema';
import { CouponRepository } from '../repositories/coupon.repository';

/**
 * Service responsible for coupon usage tracking and statistics
 * Handles usage history and analytics
 */
@Injectable()
export class CouponUsageService {
  private readonly logger = new Logger(CouponUsageService.name);

  constructor(
    private readonly couponRepository: CouponRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Apply coupon to order
   */
  async applyCoupon(
    code: string,
    customerId: string,
    orderId: string,
    discountAmount: number,
  ): Promise<CouponDocument> {
    const coupon = await this.couponRepository
      .getModel()
      .findOne({ code: code.toUpperCase() });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    // Add to usage history
    coupon.usageHistory.push({
      userId: new Types.ObjectId(customerId),
      orderId: new Types.ObjectId(orderId),
      usedAt: new Date(),
      discountAmount,
    } as any);

    // Increment usage count
    coupon.usedCount += 1;

    await coupon.save();

    this.logger.log(
      `Coupon ${code} applied to order ${orderId} by customer ${customerId}`,
    );

    this.eventEmitter.emit('coupon.applied', {
      couponId: (coupon._id as Types.ObjectId).toString(),
      code,
      customerId,
      orderId,
      discountAmount,
    });

    return coupon;
  }

  /**
   * Get coupon usage statistics
   */
  async getUsageStats(id: string): Promise<{
    totalUsage: number;
    totalDiscount: number;
    uniqueUsers: number;
    usageByDay: any[];
  }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid coupon ID');
    }

    const coupon = await this.couponRepository.getModel().findById(id);

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    const totalUsage = coupon.usageHistory.length;
    const totalDiscount = coupon.usageHistory.reduce(
      (sum, usage) => sum + (usage.discountAmount || 0),
      0,
    );

    // Get unique users
    const uniqueUserIds = new Set(
      coupon.usageHistory.map((usage) => usage.userId.toString()),
    );
    const uniqueUsers = uniqueUserIds.size;

    // Group usage by day
    const usageByDay: { [key: string]: number } = {};
    coupon.usageHistory.forEach((usage) => {
      const day = usage.usedAt.toISOString().split('T')[0];
      usageByDay[day] = (usageByDay[day] || 0) + 1;
    });

    const usageByDayArray = Object.entries(usageByDay).map(([date, count]) => ({
      date,
      count,
    }));

    return {
      totalUsage,
      totalDiscount,
      uniqueUsers,
      usageByDay: usageByDayArray,
    };
  }

  /**
   * Get user's coupon usage history
   */
  async getUserUsageHistory(
    customerId: string,
    couponId?: string,
  ): Promise<any[]> {
    if (!Types.ObjectId.isValid(customerId)) {
      throw new BadRequestException('Invalid customer ID');
    }

    const filter: any = {
      'usageHistory.userId': new Types.ObjectId(customerId),
    };

    if (couponId) {
      if (!Types.ObjectId.isValid(couponId)) {
        throw new BadRequestException('Invalid coupon ID');
      }
      filter._id = new Types.ObjectId(couponId);
    }

    const coupons = await this.couponRepository.getModel().find(filter).exec();

    const usageHistory: any[] = [];

    coupons.forEach((coupon) => {
      const userUsages = coupon.usageHistory.filter(
        (usage) => usage.userId.toString() === customerId,
      );

      userUsages.forEach((usage) => {
        usageHistory.push({
          couponId: (coupon._id as Types.ObjectId).toString(),
          code: coupon.code,
          orderId: usage.orderId?.toString() || '',
          usedAt: usage.usedAt,
          discountAmount: usage.discountAmount,
        });
      });
    });

    return usageHistory.sort((a, b) => b.usedAt.getTime() - a.usedAt.getTime());
  }

  /**
   * Reset coupon usage (Admin only)
   */
  async resetUsage(id: string): Promise<CouponDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid coupon ID');
    }

    const coupon = await this.couponRepository.getModel().findById(id);

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    coupon.usedCount = 0;
    coupon.usageHistory = [];

    await coupon.save();

    this.logger.log(`Coupon ${coupon.code} usage reset`);

    this.eventEmitter.emit('coupon.usage_reset', {
      couponId: (coupon._id as Types.ObjectId).toString(),
      code: coupon.code,
    });

    return coupon;
  }
}
