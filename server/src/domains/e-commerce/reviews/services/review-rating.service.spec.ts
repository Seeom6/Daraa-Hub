import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ReviewRatingService } from './review-rating.service';
import { ReviewRepository } from '../repositories/review.repository';
import { Product } from '../../../../database/schemas/product.schema';
import { StoreOwnerProfile } from '../../../../database/schemas/store-owner-profile.schema';
import { CourierProfile } from '../../../../database/schemas/courier-profile.schema';
import {
  ReviewTargetType,
  ReviewStatus,
} from '../../../../database/schemas/review.schema';

describe('ReviewRatingService', () => {
  let service: ReviewRatingService;
  let reviewRepository: jest.Mocked<ReviewRepository>;
  let productModel: any;
  let storeProfileModel: any;
  let courierProfileModel: any;

  const targetId = new Types.ObjectId().toString();

  const mockReviews = [{ rating: 5 }, { rating: 4 }, { rating: 5 }];

  const mockModel = {
    find: jest.fn().mockReturnThis(),
    select: jest.fn(),
  };

  beforeEach(async () => {
    productModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };
    storeProfileModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };
    courierProfileModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewRatingService,
        {
          provide: ReviewRepository,
          useValue: {
            getModel: jest.fn().mockReturnValue(mockModel),
          },
        },
        { provide: getModelToken(Product.name), useValue: productModel },
        {
          provide: getModelToken(StoreOwnerProfile.name),
          useValue: storeProfileModel,
        },
        {
          provide: getModelToken(CourierProfile.name),
          useValue: courierProfileModel,
        },
      ],
    }).compile();

    service = module.get<ReviewRatingService>(ReviewRatingService);
    reviewRepository = module.get(ReviewRepository);
  });

  describe('verifyTargetExists', () => {
    it('should verify product exists', async () => {
      productModel.findById.mockResolvedValue({ _id: targetId });

      await expect(
        service.verifyTargetExists(ReviewTargetType.PRODUCT, targetId),
      ).resolves.not.toThrow();
    });

    it('should throw NotFoundException if product not found', async () => {
      productModel.findById.mockResolvedValue(null);

      await expect(
        service.verifyTargetExists(ReviewTargetType.PRODUCT, targetId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should verify store exists', async () => {
      storeProfileModel.findById.mockResolvedValue({ _id: targetId });

      await expect(
        service.verifyTargetExists(ReviewTargetType.STORE, targetId),
      ).resolves.not.toThrow();
    });

    it('should throw NotFoundException if store not found', async () => {
      storeProfileModel.findById.mockResolvedValue(null);

      await expect(
        service.verifyTargetExists(ReviewTargetType.STORE, targetId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should verify courier exists', async () => {
      courierProfileModel.findById.mockResolvedValue({ _id: targetId });

      await expect(
        service.verifyTargetExists(ReviewTargetType.COURIER, targetId),
      ).resolves.not.toThrow();
    });

    it('should throw NotFoundException if courier not found', async () => {
      courierProfileModel.findById.mockResolvedValue(null);

      await expect(
        service.verifyTargetExists(ReviewTargetType.COURIER, targetId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTargetRating', () => {
    beforeEach(() => {
      mockModel.select.mockResolvedValue(mockReviews);
    });

    it('should update product rating', async () => {
      await service.updateTargetRating(ReviewTargetType.PRODUCT, targetId);

      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(targetId, {
        rating: 4.7,
        reviewCount: 3,
      });
    });

    it('should update store rating', async () => {
      await service.updateTargetRating(ReviewTargetType.STORE, targetId);

      expect(storeProfileModel.findByIdAndUpdate).toHaveBeenCalledWith(
        targetId,
        {
          rating: 4.7,
          totalReviews: 3,
        },
      );
    });

    it('should update courier rating', async () => {
      await service.updateTargetRating(ReviewTargetType.COURIER, targetId);

      expect(courierProfileModel.findByIdAndUpdate).toHaveBeenCalledWith(
        targetId,
        {
          rating: 4.7,
          totalReviews: 3,
        },
      );
    });

    it('should handle no reviews', async () => {
      mockModel.select.mockResolvedValue([]);

      await service.updateTargetRating(ReviewTargetType.PRODUCT, targetId);

      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(targetId, {
        rating: 0,
        reviewCount: 0,
      });
    });
  });

  describe('calculateRatingDistribution', () => {
    it('should calculate rating distribution', async () => {
      mockModel.select.mockResolvedValue([
        { rating: 5 },
        { rating: 5 },
        { rating: 4 },
        { rating: 3 },
        { rating: 5 },
      ]);

      const result = await service.calculateRatingDistribution(
        ReviewTargetType.PRODUCT,
        targetId,
      );

      expect(result.averageRating).toBe(4.4);
      expect(result.totalReviews).toBe(5);
      expect(result.ratingDistribution).toEqual({
        1: 0,
        2: 0,
        3: 1,
        4: 1,
        5: 3,
      });
    });

    it('should handle no reviews', async () => {
      mockModel.select.mockResolvedValue([]);

      const result = await service.calculateRatingDistribution(
        ReviewTargetType.PRODUCT,
        targetId,
      );

      expect(result.averageRating).toBe(0);
      expect(result.totalReviews).toBe(0);
    });
  });
});
