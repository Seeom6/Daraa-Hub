import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { OfferAnalyticsService } from './offer-analytics.service';
import { OfferRepository } from '../repositories/offer.repository';

describe('OfferAnalyticsService', () => {
  let service: OfferAnalyticsService;
  let offerRepository: jest.Mocked<OfferRepository>;

  const mockOfferId = new Types.ObjectId().toString();
  const mockStoreId = new Types.ObjectId().toString();

  const mockOffer = {
    _id: mockOfferId,
    storeId: new Types.ObjectId(mockStoreId),
    viewCount: 100,
    usageCount: 25,
    toString: () => mockStoreId,
  };

  beforeEach(async () => {
    const mockOfferRepository = {
      findByIdAndUpdate: jest.fn(),
      getModel: jest.fn().mockReturnValue({
        findById: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfferAnalyticsService,
        { provide: OfferRepository, useValue: mockOfferRepository },
      ],
    }).compile();

    service = module.get<OfferAnalyticsService>(OfferAnalyticsService);
    offerRepository = module.get(OfferRepository);
  });

  describe('incrementUsageCount', () => {
    it('should increment usage count successfully', async () => {
      offerRepository.findByIdAndUpdate.mockResolvedValue(mockOffer as any);

      await service.incrementUsageCount(mockOfferId);

      expect(offerRepository.findByIdAndUpdate).toHaveBeenCalledWith(
        mockOfferId,
        { $inc: { usageCount: 1 } },
      );
    });

    it('should throw BadRequestException for invalid offer ID', async () => {
      await expect(service.incrementUsageCount('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAnalytics', () => {
    it('should return analytics successfully', async () => {
      const offerWithStoreId = {
        ...mockOffer,
        storeId: { toString: () => mockStoreId },
      };
      offerRepository.getModel().findById = jest
        .fn()
        .mockResolvedValue(offerWithStoreId);

      const result = await service.getAnalytics(mockOfferId, mockStoreId);

      expect(result).toEqual({
        viewCount: 100,
        usageCount: 25,
        conversionRate: 25,
      });
    });

    it('should throw BadRequestException for invalid offer ID', async () => {
      await expect(
        service.getAnalytics('invalid-id', mockStoreId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when offer not found', async () => {
      offerRepository.getModel().findById = jest.fn().mockResolvedValue(null);

      await expect(
        service.getAnalytics(mockOfferId, mockStoreId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when store ID does not match', async () => {
      const differentStoreId = new Types.ObjectId().toString();
      const offerWithDifferentStore = {
        ...mockOffer,
        storeId: { toString: () => differentStoreId },
      };
      offerRepository.getModel().findById = jest
        .fn()
        .mockResolvedValue(offerWithDifferentStore);

      await expect(
        service.getAnalytics(mockOfferId, mockStoreId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return 0 conversion rate when viewCount is 0', async () => {
      const offerWithZeroViews = {
        ...mockOffer,
        viewCount: 0,
        usageCount: 0,
        storeId: { toString: () => mockStoreId },
      };
      offerRepository.getModel().findById = jest
        .fn()
        .mockResolvedValue(offerWithZeroViews);

      const result = await service.getAnalytics(mockOfferId, mockStoreId);

      expect(result.conversionRate).toBe(0);
    });

    it('should calculate conversion rate correctly', async () => {
      const offerWithStats = {
        viewCount: 200,
        usageCount: 50,
        storeId: { toString: () => mockStoreId },
      };
      offerRepository.getModel().findById = jest
        .fn()
        .mockResolvedValue(offerWithStats);

      const result = await service.getAnalytics(mockOfferId, mockStoreId);

      expect(result.conversionRate).toBe(25);
    });
  });
});
