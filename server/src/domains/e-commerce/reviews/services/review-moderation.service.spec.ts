import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { ReviewModerationService } from './review-moderation.service';
import { ReviewRepository } from '../repositories/review.repository';
import { ReviewRatingService } from './review-rating.service';
import {
  ReviewStatus,
  ReviewTargetType,
} from '../../../../database/schemas/review.schema';

describe('ReviewModerationService', () => {
  let service: ReviewModerationService;
  let reviewRepository: ReviewRepository;
  let reviewRatingService: ReviewRatingService;
  let eventEmitter: EventEmitter2;

  const mockReviewId = new Types.ObjectId().toString();
  const mockAdminId = new Types.ObjectId().toString();
  const mockTargetId = new Types.ObjectId();

  const createMockReview = (overrides = {}) => ({
    _id: new Types.ObjectId(mockReviewId),
    targetType: ReviewTargetType.PRODUCT,
    targetId: mockTargetId,
    status: ReviewStatus.PENDING,
    moderatedBy: null,
    moderationNotes: null,
    save: jest.fn().mockResolvedValue(true),
    ...overrides,
  });

  const mockReviewRepository = {
    getModel: jest.fn(),
    count: jest.fn(),
  };

  const mockReviewRatingService = {
    updateTargetRating: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewModerationService,
        { provide: ReviewRepository, useValue: mockReviewRepository },
        { provide: ReviewRatingService, useValue: mockReviewRatingService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<ReviewModerationService>(ReviewModerationService);
    reviewRepository = module.get<ReviewRepository>(ReviewRepository);
    reviewRatingService = module.get<ReviewRatingService>(ReviewRatingService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('moderateReview', () => {
    it('should approve a review successfully', async () => {
      const mockReview = createMockReview();
      mockReviewRepository.getModel.mockReturnValue({
        findById: jest.fn().mockResolvedValue(mockReview),
      });

      const result = await service.moderateReview(
        mockReviewId,
        { status: ReviewStatus.APPROVED, moderationNotes: 'Looks good' },
        mockAdminId,
      );

      expect(result.status).toBe(ReviewStatus.APPROVED);
      expect(result.moderationNotes).toBe('Looks good');
      expect(mockReview.save).toHaveBeenCalled();
      expect(reviewRatingService.updateTargetRating).toHaveBeenCalledWith(
        ReviewTargetType.PRODUCT,
        mockTargetId.toString(),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'review.moderated',
        expect.any(Object),
      );
    });

    it('should reject a review successfully', async () => {
      const mockReview = createMockReview();
      mockReviewRepository.getModel.mockReturnValue({
        findById: jest.fn().mockResolvedValue(mockReview),
      });

      const result = await service.moderateReview(
        mockReviewId,
        {
          status: ReviewStatus.REJECTED,
          moderationNotes: 'Inappropriate content',
        },
        mockAdminId,
      );

      expect(result.status).toBe(ReviewStatus.REJECTED);
      expect(result.moderationNotes).toBe('Inappropriate content');
    });

    it('should throw NotFoundException when review not found', async () => {
      mockReviewRepository.getModel.mockReturnValue({
        findById: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.moderateReview(
          mockReviewId,
          { status: ReviewStatus.APPROVED },
          mockAdminId,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllReviews', () => {
    it('should return paginated reviews', async () => {
      const mockReviews = [createMockReview(), createMockReview()];
      mockReviewRepository.count.mockResolvedValue(2);
      mockReviewRepository.getModel.mockReturnValue({
        find: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue(mockReviews),
              }),
            }),
          }),
        }),
      });

      const result = await service.getAllReviews(1, 10);

      expect(result.reviews).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should filter by status', async () => {
      mockReviewRepository.count.mockResolvedValue(1);
      mockReviewRepository.getModel.mockReturnValue({
        find: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([createMockReview()]),
              }),
            }),
          }),
        }),
      });

      const result = await service.getAllReviews(1, 10, ReviewStatus.PENDING);

      expect(result.reviews).toHaveLength(1);
      expect(mockReviewRepository.count).toHaveBeenCalledWith({
        status: ReviewStatus.PENDING,
      });
    });

    it('should filter by targetType', async () => {
      mockReviewRepository.count.mockResolvedValue(1);
      mockReviewRepository.getModel.mockReturnValue({
        find: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([createMockReview()]),
              }),
            }),
          }),
        }),
      });

      const result = await service.getAllReviews(
        1,
        10,
        undefined,
        ReviewTargetType.STORE,
      );

      expect(mockReviewRepository.count).toHaveBeenCalledWith({
        targetType: ReviewTargetType.STORE,
      });
    });
  });
});
