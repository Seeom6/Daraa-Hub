import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from './review.controller';
import { ReviewService } from '../services/review.service';
import { ReviewInteractionService } from '../services/review-interaction.service';
import { ReviewTargetType } from '../../../../database/schemas/review.schema';
import { generateObjectId } from '../../../shared/testing';

describe('ReviewController', () => {
  let controller: ReviewController;
  let reviewService: jest.Mocked<ReviewService>;
  let interactionService: jest.Mocked<ReviewInteractionService>;

  const mockReviewService = {
    createReview: jest.fn(),
    updateReview: jest.fn(),
    deleteReview: jest.fn(),
    getReviewById: jest.fn(),
    getReviewsByTarget: jest.fn(),
  };

  const mockInteractionService = {
    getCustomerReviews: jest.fn(),
    addStoreResponse: jest.fn(),
    markHelpful: jest.fn(),
  };

  const reviewId = generateObjectId();
  const accountId = generateObjectId();
  const productId = generateObjectId();

  const mockRequest = {
    user: { sub: accountId },
  };

  const mockReview = {
    _id: reviewId,
    accountId,
    targetType: ReviewTargetType.PRODUCT,
    targetId: productId,
    rating: 5,
    comment: 'Great product!',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewController],
      providers: [
        { provide: ReviewService, useValue: mockReviewService },
        { provide: ReviewInteractionService, useValue: mockInteractionService },
      ],
    }).compile();

    controller = module.get<ReviewController>(ReviewController);
    reviewService = module.get(ReviewService);
    interactionService = module.get(ReviewInteractionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createReview', () => {
    it('should create review', async () => {
      const createDto = {
        targetType: ReviewTargetType.PRODUCT,
        targetId: productId,
        rating: 5,
      };
      mockReviewService.createReview.mockResolvedValue(mockReview);

      const result = await controller.createReview(
        createDto as any,
        mockRequest,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Review created successfully');
    });
  });

  describe('updateReview', () => {
    it('should update review', async () => {
      const updateDto = { rating: 4 };
      mockReviewService.updateReview.mockResolvedValue({
        ...mockReview,
        rating: 4,
      });

      const result = await controller.updateReview(
        reviewId,
        updateDto as any,
        mockRequest,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Review updated successfully');
    });
  });

  describe('deleteReview', () => {
    it('should delete review', async () => {
      mockReviewService.deleteReview.mockResolvedValue(undefined);

      const result = await controller.deleteReview(reviewId, mockRequest);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Review deleted successfully');
    });
  });

  describe('getReviewById', () => {
    it('should return review by id', async () => {
      mockReviewService.getReviewById.mockResolvedValue(mockReview);

      const result = await controller.getReviewById(reviewId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReview);
    });
  });

  describe('getReviewsByTarget', () => {
    it('should return reviews by target', async () => {
      const queryResult = {
        reviews: [mockReview],
        total: 1,
        page: 1,
        totalPages: 1,
        averageRating: 5,
        ratingDistribution: { 5: 1 },
      };
      mockReviewService.getReviewsByTarget.mockResolvedValue(queryResult);

      const result = await controller.getReviewsByTarget(
        ReviewTargetType.PRODUCT,
        productId,
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(queryResult);
    });
  });

  describe('getMyReviews', () => {
    it('should return customer reviews', async () => {
      const reviews = { reviews: [mockReview], total: 1 };
      mockInteractionService.getCustomerReviews.mockResolvedValue(reviews);

      const result = await controller.getMyReviews(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(reviews);
    });
  });

  describe('addStoreResponse', () => {
    it('should add store response', async () => {
      const responseDto = { response: 'Thank you!' };
      mockInteractionService.addStoreResponse.mockResolvedValue(mockReview);

      const result = await controller.addStoreResponse(
        reviewId,
        responseDto as any,
        mockRequest,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Store response added successfully');
    });
  });

  describe('markHelpful', () => {
    it('should mark review as helpful', async () => {
      const markDto = { helpful: true };
      mockInteractionService.markHelpful.mockResolvedValue(mockReview);

      const result = await controller.markHelpful(
        reviewId,
        markDto,
        mockRequest,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Review marked as helpful');
    });

    it('should mark review as not helpful', async () => {
      const markDto = { helpful: false };
      mockInteractionService.markHelpful.mockResolvedValue(mockReview);

      const result = await controller.markHelpful(
        reviewId,
        markDto,
        mockRequest,
      );

      expect(result.message).toBe('Review marked as not helpful');
    });
  });
});
