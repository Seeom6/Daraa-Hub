import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { OfferQueryService } from './offer-query.service';
import { OfferRepository } from '../repositories/offer.repository';

describe('OfferQueryService', () => {
  let service: OfferQueryService;
  let offerRepository: jest.Mocked<OfferRepository>;

  const mockOffer = {
    _id: new Types.ObjectId(),
    storeId: new Types.ObjectId(),
    title: 'Test Offer',
    description: 'Test Description',
    discountType: 'percentage',
    discountValue: 10,
    isActive: true,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    viewCount: 0,
    applicableProducts: [],
  };

  const mockModel = {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfferQueryService,
        {
          provide: OfferRepository,
          useValue: {
            getModel: jest.fn().mockReturnValue(mockModel),
            count: jest.fn(),
            findByIdAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OfferQueryService>(OfferQueryService);
    offerRepository = module.get(OfferRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated offers', async () => {
      mockModel.exec.mockResolvedValue([mockOffer]);
      (offerRepository.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter by storeId', async () => {
      const storeId = new Types.ObjectId().toString();
      mockModel.exec.mockResolvedValue([mockOffer]);
      (offerRepository.count as jest.Mock).mockResolvedValue(1);

      await service.findAll({ storeId, page: 1, limit: 10 });

      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid storeId', async () => {
      await expect(
        service.findAll({ storeId: 'invalid', page: 1, limit: 10 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should filter by discountType', async () => {
      mockModel.exec.mockResolvedValue([mockOffer]);
      (offerRepository.count as jest.Mock).mockResolvedValue(1);

      await service.findAll({ discountType: 'percentage', page: 1, limit: 10 });

      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should filter by isActive', async () => {
      mockModel.exec.mockResolvedValue([mockOffer]);
      (offerRepository.count as jest.Mock).mockResolvedValue(1);

      await service.findAll({ isActive: true, page: 1, limit: 10 });

      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should filter currentOnly offers', async () => {
      mockModel.exec.mockResolvedValue([mockOffer]);
      (offerRepository.count as jest.Mock).mockResolvedValue(1);

      await service.findAll({ currentOnly: true, page: 1, limit: 10 });

      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should search by title or description', async () => {
      mockModel.exec.mockResolvedValue([mockOffer]);
      (offerRepository.count as jest.Mock).mockResolvedValue(1);

      await service.findAll({ search: 'test', page: 1, limit: 10 });

      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should sort ascending', async () => {
      mockModel.exec.mockResolvedValue([mockOffer]);
      (offerRepository.count as jest.Mock).mockResolvedValue(1);

      await service.findAll({
        sortBy: 'title',
        sortOrder: 'asc',
        page: 1,
        limit: 10,
      });

      expect(mockModel.sort).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return offer and increment viewCount', async () => {
      mockModel.exec.mockResolvedValue(mockOffer);
      (offerRepository.findByIdAndUpdate as jest.Mock).mockResolvedValue(
        mockOffer,
      );

      const result = await service.findOne(mockOffer._id.toString());

      expect(result).toEqual(mockOffer);
      expect(offerRepository.findByIdAndUpdate).toHaveBeenCalledWith(
        mockOffer._id.toString(),
        { $inc: { viewCount: 1 } },
      );
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.findOne('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when offer not found', async () => {
      mockModel.exec.mockResolvedValue(null);

      await expect(
        service.findOne(new Types.ObjectId().toString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getActiveOffers', () => {
    it('should return active offers for store', async () => {
      mockModel.exec.mockResolvedValue([mockOffer]);

      const result = await service.getActiveOffers(
        mockOffer.storeId.toString(),
      );

      expect(result).toHaveLength(1);
      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid storeId', async () => {
      await expect(service.getActiveOffers('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getOffersForProduct', () => {
    it('should return offers for product', async () => {
      mockModel.exec.mockResolvedValue([mockOffer]);

      const productId = new Types.ObjectId().toString();
      const result = await service.getOffersForProduct(productId);

      expect(result).toHaveLength(1);
      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid productId', async () => {
      await expect(service.getOffersForProduct('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
