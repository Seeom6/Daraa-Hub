import { Test, TestingModule } from '@nestjs/testing';
import { ReviewEventsListener } from './review-events.listener';

describe('ReviewEventsListener', () => {
  let listener: ReviewEventsListener;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewEventsListener],
    }).compile();

    listener = module.get<ReviewEventsListener>(ReviewEventsListener);
    loggerSpy = jest.spyOn(listener['logger'], 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleReviewCreated', () => {
    it('should log review created event', () => {
      const payload = {
        reviewId: 'review-123',
        customerId: 'customer-456',
        targetType: 'store',
        targetId: 'store-789',
        rating: 5,
      };

      listener.handleReviewCreated(payload);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Review created: ${payload.reviewId} for ${payload.targetType} ${payload.targetId} with rating ${payload.rating}`,
      );
    });
  });

  describe('handleReviewUpdated', () => {
    it('should log review updated event', () => {
      const payload = {
        reviewId: 'review-123',
        targetType: 'product',
        targetId: 'product-456',
      };

      listener.handleReviewUpdated(payload);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Review updated: ${payload.reviewId} for ${payload.targetType} ${payload.targetId}`,
      );
    });
  });

  describe('handleReviewDeleted', () => {
    it('should log review deleted event', () => {
      const payload = {
        reviewId: 'review-123',
        targetType: 'courier',
        targetId: 'courier-789',
      };

      listener.handleReviewDeleted(payload);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Review deleted: ${payload.reviewId} for ${payload.targetType} ${payload.targetId}`,
      );
    });
  });

  describe('handleReviewModerated', () => {
    it('should log review moderated event', () => {
      const payload = {
        reviewId: 'review-123',
        status: 'approved',
        moderatedBy: 'admin-456',
      };

      listener.handleReviewModerated(payload);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Review moderated: ${payload.reviewId} to ${payload.status} by ${payload.moderatedBy}`,
      );
    });
  });

  describe('handleStoreResponseAdded', () => {
    it('should log store response added event', () => {
      const payload = {
        reviewId: 'review-123',
        storeId: 'store-456',
      };

      listener.handleStoreResponseAdded(payload);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Store response added to review: ${payload.reviewId} by store ${payload.storeId}`,
      );
    });
  });
});
