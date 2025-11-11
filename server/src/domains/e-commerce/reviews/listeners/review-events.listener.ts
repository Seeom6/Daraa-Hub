import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ReviewEventsListener {
  private readonly logger = new Logger(ReviewEventsListener.name);

  @OnEvent('review.created')
  handleReviewCreated(payload: {
    reviewId: string;
    customerId: string;
    targetType: string;
    targetId: string;
    rating: number;
  }) {
    this.logger.log(
      `Review created: ${payload.reviewId} for ${payload.targetType} ${payload.targetId} with rating ${payload.rating}`,
    );

    // TODO: Send notification to store owner/courier
    // TODO: Update analytics
  }

  @OnEvent('review.updated')
  handleReviewUpdated(payload: { reviewId: string; targetType: string; targetId: string }) {
    this.logger.log(`Review updated: ${payload.reviewId} for ${payload.targetType} ${payload.targetId}`);

    // TODO: Update analytics
  }

  @OnEvent('review.deleted')
  handleReviewDeleted(payload: { reviewId: string; targetType: string; targetId: string }) {
    this.logger.log(`Review deleted: ${payload.reviewId} for ${payload.targetType} ${payload.targetId}`);

    // TODO: Update analytics
  }

  @OnEvent('review.moderated')
  handleReviewModerated(payload: { reviewId: string; status: string; moderatedBy: string }) {
    this.logger.log(`Review moderated: ${payload.reviewId} to ${payload.status} by ${payload.moderatedBy}`);

    // TODO: Send notification to customer if rejected
  }

  @OnEvent('review.store_response_added')
  handleStoreResponseAdded(payload: { reviewId: string; storeId: string }) {
    this.logger.log(`Store response added to review: ${payload.reviewId} by store ${payload.storeId}`);

    // TODO: Send notification to customer
  }
}

