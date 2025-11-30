import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { OfferRepository } from '../repositories/offer.repository';

/**
 * Service for offer analytics operations
 * Handles usage tracking and statistics
 */
@Injectable()
export class OfferAnalyticsService {
  private readonly logger = new Logger(OfferAnalyticsService.name);

  constructor(private readonly offerRepository: OfferRepository) {}

  async incrementUsageCount(offerId: string): Promise<void> {
    if (!Types.ObjectId.isValid(offerId)) {
      throw new BadRequestException('Invalid offer ID');
    }

    await this.offerRepository.findByIdAndUpdate(offerId, {
      $inc: { usageCount: 1 },
    });

    this.logger.log(`Offer usage incremented: ${offerId}`);
  }

  async getAnalytics(
    id: string,
    storeId: string,
  ): Promise<{
    viewCount: number;
    usageCount: number;
    conversionRate: number;
  }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.offerRepository.getModel().findById(id);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.storeId.toString() !== storeId) {
      throw new ForbiddenException(
        'You do not have permission to view this offer analytics',
      );
    }

    const conversionRate =
      offer.viewCount > 0 ? (offer.usageCount / offer.viewCount) * 100 : 0;

    return {
      viewCount: offer.viewCount,
      usageCount: offer.usageCount,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
    };
  }
}
