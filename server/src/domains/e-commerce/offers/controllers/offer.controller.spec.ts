import { Test, TestingModule } from '@nestjs/testing';
import { OfferController } from './offer.controller';
import { OfferService } from '../services/offer.service';
import { JwtAuthGuard, RolesGuard } from '../../../../common/guards';
import { generateObjectId } from '../../../shared/testing';

describe('OfferController', () => {
  let controller: OfferController;

  const mockOfferService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    getActiveOffers: jest.fn(),
    getOffersForProduct: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getAnalytics: jest.fn(),
    adminRemove: jest.fn(),
  };

  const storeId = generateObjectId();
  const offerId = generateObjectId();
  const productId = generateObjectId();

  const mockUser = { profileId: storeId };

  const mockOffer = {
    _id: offerId,
    storeId,
    title: 'Summer Sale',
    discountPercentage: 20,
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OfferController],
      providers: [{ provide: OfferService, useValue: mockOfferService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OfferController>(OfferController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllOffers', () => {
    it('should return all offers', async () => {
      mockOfferService.findAll.mockResolvedValue({
        data: [mockOffer],
        meta: {},
      });

      const result = await controller.getAllOffers({} as any);

      expect(result.success).toBe(true);
    });
  });

  describe('getOffer', () => {
    it('should return offer by id', async () => {
      mockOfferService.findOne.mockResolvedValue(mockOffer);

      const result = await controller.getOffer(offerId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOffer);
    });
  });

  describe('getActiveOffers', () => {
    it('should return active offers for store', async () => {
      mockOfferService.getActiveOffers.mockResolvedValue([mockOffer]);

      const result = await controller.getActiveOffers(storeId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockOffer]);
    });
  });

  describe('getOffersForProduct', () => {
    it('should return offers for product', async () => {
      mockOfferService.getOffersForProduct.mockResolvedValue([mockOffer]);

      const result = await controller.getOffersForProduct(productId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockOffer]);
    });
  });

  describe('createOffer', () => {
    it('should create offer', async () => {
      mockOfferService.create.mockResolvedValue(mockOffer);

      const result = await controller.createOffer(mockUser, {
        title: 'Summer Sale',
      } as any);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOffer);
    });
  });

  describe('getMyOffers', () => {
    it('should return store owner offers', async () => {
      mockOfferService.findAll.mockResolvedValue({
        data: [mockOffer],
        meta: {},
      });

      const result = await controller.getMyOffers(mockUser, {} as any);

      expect(result.success).toBe(true);
    });
  });

  describe('updateOffer', () => {
    it('should update offer', async () => {
      mockOfferService.update.mockResolvedValue(mockOffer);

      const result = await controller.updateOffer(mockUser, offerId, {
        title: 'Updated',
      } as any);

      expect(result.success).toBe(true);
    });
  });

  describe('deleteOffer', () => {
    it('should delete offer', async () => {
      mockOfferService.remove.mockResolvedValue(undefined);

      const result = await controller.deleteOffer(mockUser, offerId);

      expect(result.success).toBe(true);
    });
  });

  describe('getOfferAnalytics', () => {
    it('should return offer analytics', async () => {
      mockOfferService.getAnalytics.mockResolvedValue({
        views: 100,
        conversions: 10,
      });

      const result = await controller.getOfferAnalytics(mockUser, offerId);

      expect(result.success).toBe(true);
      expect(result.data.views).toBe(100);
    });
  });

  describe('adminDeleteOffer', () => {
    it('should delete offer as admin', async () => {
      mockOfferService.adminRemove.mockResolvedValue(undefined);

      const result = await controller.adminDeleteOffer(offerId);

      expect(result.success).toBe(true);
    });
  });
});
