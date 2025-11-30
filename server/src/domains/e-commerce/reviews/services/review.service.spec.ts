import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { ReviewCrudService } from './review-crud.service';
import { ReviewQueryService } from './review-query.service';
import { ReviewVerificationService } from './review-verification.service';
import { ReviewTargetType } from '../../../../database/schemas/review.schema';
import { generateObjectId } from '../../../shared/testing';

describe('ReviewService', () => {
  let service: ReviewService;
  let crudService: jest.Mocked<ReviewCrudService>;
  let queryService: jest.Mocked<ReviewQueryService>;
  let verificationService: jest.Mocked<ReviewVerificationService>;

  const mockCrudService = {
    createReview: jest.fn(),
    updateReview: jest.fn(),
    deleteReview: jest.fn(),
  };

  const mockQueryService = {
    getReviewById: jest.fn(),
    getReviewsByTarget: jest.fn(),
  };

  const mockVerificationService = {
    verifyPurchase: jest.fn(),
    verifyTargetExists: jest.fn(),
  };

  const reviewId = generateObjectId();
  const accountId = generateObjectId();
  const productId = generateObjectId();

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
      providers: [
        ReviewService,
        { provide: ReviewCrudService, useValue: mockCrudService },
        { provide: ReviewQueryService, useValue: mockQueryService },
        {
          provide: ReviewVerificationService,
          useValue: mockVerificationService,
        },
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
    crudService = module.get(ReviewCrudService);
    queryService = module.get(ReviewQueryService);
    verificationService = module.get(ReviewVerificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createReview', () => {
    it('should delegate to crudService', async () => {
      const createDto = {
        targetType: ReviewTargetType.PRODUCT,
        targetId: productId,
        rating: 5,
      };
      mockCrudService.createReview.mockResolvedValue(mockReview);

      const result = await service.createReview(createDto as any, accountId);

      expect(result).toEqual(mockReview);
      expect(mockCrudService.createReview).toHaveBeenCalledWith(
        createDto,
        accountId,
      );
    });
  });

  describe('updateReview', () => {
    it('should delegate to crudService', async () => {
      const updateDto = { rating: 4 };
      mockCrudService.updateReview.mockResolvedValue({
        ...mockReview,
        rating: 4,
      });

      const result = await service.updateReview(
        reviewId,
        updateDto as any,
        accountId,
      );

      expect(result.rating).toBe(4);
      expect(mockCrudService.updateReview).toHaveBeenCalledWith(
        reviewId,
        updateDto,
        accountId,
      );
    });
  });

  describe('deleteReview', () => {
    it('should delegate to crudService', async () => {
      mockCrudService.deleteReview.mockResolvedValue(undefined);

      await service.deleteReview(reviewId, accountId);

      expect(mockCrudService.deleteReview).toHaveBeenCalledWith(
        reviewId,
        accountId,
      );
    });
  });

  describe('getReviewById', () => {
    it('should delegate to queryService', async () => {
      mockQueryService.getReviewById.mockResolvedValue(mockReview);

      const result = await service.getReviewById(reviewId);

      expect(result).toEqual(mockReview);
      expect(mockQueryService.getReviewById).toHaveBeenCalledWith(reviewId);
    });
  });

  describe('getReviewsByTarget', () => {
    it('should delegate to queryService', async () => {
      const queryResult = {
        reviews: [mockReview],
        total: 1,
        page: 1,
        totalPages: 1,
        averageRating: 5,
        ratingDistribution: { 5: 1 },
      };
      mockQueryService.getReviewsByTarget.mockResolvedValue(queryResult);

      const result = await service.getReviewsByTarget(
        ReviewTargetType.PRODUCT,
        productId,
      );

      expect(result).toEqual(queryResult);
    });
  });

  describe('verifyPurchase', () => {
    it('should delegate to verificationService', async () => {
      const orderId = generateObjectId();
      mockVerificationService.verifyPurchase.mockResolvedValue(true);

      const result = await service.verifyPurchase(
        accountId,
        ReviewTargetType.PRODUCT,
        productId,
        orderId,
      );

      expect(result).toBe(true);
    });
  });

  describe('verifyTargetExists', () => {
    it('should delegate to verificationService', async () => {
      mockVerificationService.verifyTargetExists.mockResolvedValue(undefined);

      await service.verifyTargetExists(ReviewTargetType.PRODUCT, productId);

      expect(mockVerificationService.verifyTargetExists).toHaveBeenCalledWith(
        ReviewTargetType.PRODUCT,
        productId,
      );
    });
  });

  describe('getReviewsByTarget with all parameters', () => {
    it('should pass all parameters to queryService', async () => {
      const queryResult = {
        reviews: [mockReview],
        total: 1,
        page: 2,
        totalPages: 1,
        averageRating: 5,
        ratingDistribution: { 5: 1 },
      };
      mockQueryService.getReviewsByTarget.mockResolvedValue(queryResult);

      await service.getReviewsByTarget(
        ReviewTargetType.PRODUCT,
        productId,
        2,
        20,
        5,
        true,
      );

      expect(mockQueryService.getReviewsByTarget).toHaveBeenCalledWith(
        ReviewTargetType.PRODUCT,
        productId,
        2,
        20,
        5,
        true,
      );
    });

    it('should use default page and limit', async () => {
      const queryResult = {
        reviews: [],
        total: 0,
        page: 1,
        totalPages: 0,
        averageRating: 0,
        ratingDistribution: {},
      };
      mockQueryService.getReviewsByTarget.mockResolvedValue(queryResult);

      await service.getReviewsByTarget(ReviewTargetType.STORE, productId);

      expect(mockQueryService.getReviewsByTarget).toHaveBeenCalledWith(
        ReviewTargetType.STORE,
        productId,
        1,
        10,
        undefined,
        undefined,
      );
    });
  });
});
