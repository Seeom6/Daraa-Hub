import { Test, TestingModule } from '@nestjs/testing';
import { ReviewAdminController } from './review-admin.controller';
import { ReviewModerationService } from '../services/review-moderation.service';
import {
  ReviewStatus,
  ReviewTargetType,
} from '../../../../database/schemas/review.schema';

describe('ReviewAdminController', () => {
  let controller: ReviewAdminController;

  const mockModerationService = {
    getAllReviews: jest.fn(),
    moderateReview: jest.fn(),
  };

  const mockReview = {
    _id: 'review-123',
    customerId: 'customer-456',
    targetType: ReviewTargetType.STORE,
    targetId: 'store-789',
    rating: 5,
    status: ReviewStatus.PENDING,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewAdminController],
      providers: [
        { provide: ReviewModerationService, useValue: mockModerationService },
      ],
    }).compile();

    controller = module.get<ReviewAdminController>(ReviewAdminController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllReviews', () => {
    it('should return all reviews with default pagination', async () => {
      mockModerationService.getAllReviews.mockResolvedValue({
        reviews: [mockReview],
        total: 1,
      });

      const result = await controller.getAllReviews();

      expect(result.success).toBe(true);
      expect(mockModerationService.getAllReviews).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
      );
    });

    it('should return reviews with custom pagination', async () => {
      mockModerationService.getAllReviews.mockResolvedValue({
        reviews: [mockReview],
        total: 1,
      });

      const result = await controller.getAllReviews('2', '20');

      expect(result.success).toBe(true);
      expect(mockModerationService.getAllReviews).toHaveBeenCalledWith(
        2,
        20,
        undefined,
        undefined,
      );
    });

    it('should filter reviews by status', async () => {
      mockModerationService.getAllReviews.mockResolvedValue({
        reviews: [mockReview],
        total: 1,
      });

      const result = await controller.getAllReviews(
        '1',
        '10',
        ReviewStatus.PENDING,
      );

      expect(result.success).toBe(true);
      expect(mockModerationService.getAllReviews).toHaveBeenCalledWith(
        1,
        10,
        ReviewStatus.PENDING,
        undefined,
      );
    });

    it('should filter reviews by target type', async () => {
      mockModerationService.getAllReviews.mockResolvedValue({
        reviews: [mockReview],
        total: 1,
      });

      const result = await controller.getAllReviews(
        '1',
        '10',
        undefined,
        ReviewTargetType.STORE,
      );

      expect(result.success).toBe(true);
      expect(mockModerationService.getAllReviews).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        ReviewTargetType.STORE,
      );
    });
  });

  describe('moderateReview', () => {
    it('should approve a review', async () => {
      const approvedReview = { ...mockReview, status: ReviewStatus.APPROVED };
      mockModerationService.moderateReview.mockResolvedValue(approvedReview);

      const result = await controller.moderateReview(
        'review-123',
        { status: ReviewStatus.APPROVED },
        { user: { sub: 'admin-123' } },
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('approved');
      expect(mockModerationService.moderateReview).toHaveBeenCalledWith(
        'review-123',
        { status: ReviewStatus.APPROVED },
        'admin-123',
      );
    });

    it('should reject a review', async () => {
      const rejectedReview = { ...mockReview, status: ReviewStatus.REJECTED };
      mockModerationService.moderateReview.mockResolvedValue(rejectedReview);

      const result = await controller.moderateReview(
        'review-123',
        { status: ReviewStatus.REJECTED, reason: 'Inappropriate content' },
        { user: { sub: 'admin-123' } },
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('rejected');
    });
  });
});
