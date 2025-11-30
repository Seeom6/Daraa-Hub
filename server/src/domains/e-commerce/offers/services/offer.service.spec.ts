import { Test, TestingModule } from '@nestjs/testing';
import { OfferService } from './offer.service';
import { OfferCrudService } from './offer-crud.service';
import { OfferQueryService } from './offer-query.service';
import { OfferAnalyticsService } from './offer-analytics.service';
import { generateObjectId } from '../../../shared/testing';

describe('OfferService', () => {
  let service: OfferService;

  const mockCrudService = {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    adminRemove: jest.fn(),
  };

  const mockQueryService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    getActiveOffers: jest.fn(),
    getOffersForProduct: jest.fn(),
  };

  const mockAnalyticsService = {
    incrementUsageCount: jest.fn(),
    getAnalytics: jest.fn(),
  };

  const offerId = generateObjectId();
  const storeId = generateObjectId();
  const productId = generateObjectId();

  const mockOffer = {
    _id: offerId,
    name: 'Summer Sale',
    discountType: 'percentage',
    discountValue: 20,
    storeId,
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfferService,
        { provide: OfferCrudService, useValue: mockCrudService },
        { provide: OfferQueryService, useValue: mockQueryService },
        { provide: OfferAnalyticsService, useValue: mockAnalyticsService },
      ],
    }).compile();

    service = module.get<OfferService>(OfferService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should delegate to crud service', async () => {
      mockCrudService.create.mockResolvedValue(mockOffer);

      const result = await service.create(
        { name: 'Summer Sale' } as any,
        storeId,
      );

      expect(result).toEqual(mockOffer);
      expect(mockCrudService.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should delegate to crud service', async () => {
      mockCrudService.update.mockResolvedValue({
        ...mockOffer,
        name: 'Updated',
      });

      const result = await service.update(
        offerId,
        { name: 'Updated' } as any,
        storeId,
      );

      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delegate to crud service', async () => {
      mockCrudService.remove.mockResolvedValue(undefined);

      await service.remove(offerId, storeId);

      expect(mockCrudService.remove).toHaveBeenCalledWith(offerId, storeId);
    });
  });

  describe('findAll', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findAll.mockResolvedValue({
        data: [mockOffer],
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await service.findAll({});

      expect(result.data).toEqual([mockOffer]);
    });
  });

  describe('findOne', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findOne.mockResolvedValue(mockOffer);

      const result = await service.findOne(offerId);

      expect(result).toEqual(mockOffer);
    });
  });

  describe('getActiveOffers', () => {
    it('should delegate to query service', async () => {
      mockQueryService.getActiveOffers.mockResolvedValue([mockOffer]);

      const result = await service.getActiveOffers(storeId);

      expect(result).toEqual([mockOffer]);
    });
  });

  describe('getOffersForProduct', () => {
    it('should delegate to query service', async () => {
      mockQueryService.getOffersForProduct.mockResolvedValue([mockOffer]);

      const result = await service.getOffersForProduct(productId);

      expect(result).toEqual([mockOffer]);
    });
  });

  describe('incrementUsageCount', () => {
    it('should delegate to analytics service', async () => {
      mockAnalyticsService.incrementUsageCount.mockResolvedValue(undefined);

      await service.incrementUsageCount(offerId);

      expect(mockAnalyticsService.incrementUsageCount).toHaveBeenCalledWith(
        offerId,
      );
    });
  });

  describe('getAnalytics', () => {
    it('should delegate to analytics service', async () => {
      const analytics = { viewCount: 100, usageCount: 50, conversionRate: 0.5 };
      mockAnalyticsService.getAnalytics.mockResolvedValue(analytics);

      const result = await service.getAnalytics(offerId, storeId);

      expect(result).toEqual(analytics);
    });
  });
});
