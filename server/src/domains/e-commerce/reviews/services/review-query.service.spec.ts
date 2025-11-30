import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ReviewQueryService } from './review-query.service';
import { ReviewRepository } from '../repositories/review.repository';
import { ReviewRatingService } from './review-rating.service';
import {
  ReviewTargetType,
  ReviewStatus,
} from '../../../../database/schemas/review.schema';

describe('ReviewQueryService', () => {
  let service: ReviewQueryService;
  let reviewRepository: jest.Mocked<ReviewRepository>;
  let reviewRatingService: jest.Mocked<ReviewRatingService>;

  const mockReview = {
    _id: new Types.ObjectId(),
    customerId: new Types.ObjectId(),
    targetType: ReviewTargetType.PRODUCT,
    targetId: new Types.ObjectId(),
    rating: 5,
    comment: 'Great product!',
    status: ReviewStatus.APPROVED,
  };

  let mockModel: any;

  const createMockModel = () => ({
    findById: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn(),
  });

  beforeEach(async () => {
    mockModel = createMockModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewQueryService,
        {
          provide: ReviewRepository,
          useValue: {
            getModel: jest.fn().mockReturnValue(mockModel),
            count: jest.fn(),
          },
        },
        {
          provide: ReviewRatingService,
          useValue: {
            calculateRatingDistribution: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReviewQueryService>(ReviewQueryService);
    reviewRepository = module.get(ReviewRepository);
    reviewRatingService = module.get(ReviewRatingService);
  });

  describe('getReviewById', () => {
    it('should return review by ID', async () => {
      mockModel.populate.mockResolvedValue(mockReview);

      const result = await service.getReviewById(mockReview._id.toString());

      expect(mockModel.findById).toHaveBeenCalledWith(
        mockReview._id.toString(),
      );
      expect(result).toEqual(mockReview);
    });

    it('should throw NotFoundException if review not found', async () => {
      mockModel.populate.mockResolvedValue(null);

      await expect(service.getReviewById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getReviewsByTarget', () => {
    const targetId = new Types.ObjectId().toString();

    beforeEach(() => {
      mockModel.limit.mockResolvedValue([mockReview]);
      reviewRepository.count.mockResolvedValue(1);
      reviewRatingService.calculateRatingDistribution.mockResolvedValue({
        averageRating: 4.5,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 },
        totalReviews: 2,
      });
    });

    it('should return reviews for target', async () => {
      const result = await service.getReviewsByTarget(
        ReviewTargetType.PRODUCT,
        targetId,
      );

      expect(reviewRepository.count).toHaveBeenCalled();
      expect(result.reviews).toEqual([mockReview]);
      expect(result.total).toBe(1);
      expect(result.averageRating).toBe(4.5);
    });

    it('should filter by rating when provided', async () => {
      await service.getReviewsByTarget(
        ReviewTargetType.PRODUCT,
        targetId,
        1,
        10,
        5,
      );

      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ rating: 5 }),
      );
    });

    it('should filter verified purchases only', async () => {
      await service.getReviewsByTarget(
        ReviewTargetType.PRODUCT,
        targetId,
        1,
        10,
        undefined,
        true,
      );

      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ isVerifiedPurchase: true }),
      );
    });

    it('should paginate results correctly', async () => {
      reviewRepository.count.mockResolvedValue(25);

      const result = await service.getReviewsByTarget(
        ReviewTargetType.PRODUCT,
        targetId,
        2,
        10,
      );

      expect(mockModel.skip).toHaveBeenCalledWith(10);
      expect(mockModel.limit).toHaveBeenCalledWith(10);
      expect(result.totalPages).toBe(3);
    });
  });
});
