import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { OfferRepository } from './offer.repository';
import { Offer } from '../../../../database/schemas/offer.schema';
import { MockModelFactory, generateObjectId } from '../../../shared/testing';

describe('OfferRepository', () => {
  let repository: OfferRepository;
  let mockModel: any;

  const offerId = generateObjectId();
  const storeId = generateObjectId();
  const productId = generateObjectId();

  const mockOffer = {
    _id: offerId,
    storeId,
    productId,
    title: 'Summer Sale',
    discountPercentage: 20,
    isActive: true,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
  };

  beforeEach(async () => {
    mockModel = MockModelFactory.create([mockOffer]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfferRepository,
        { provide: getModelToken(Offer.name), useValue: mockModel },
      ],
    }).compile();

    repository = module.get<OfferRepository>(OfferRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findActiveOffers', () => {
    it('should find active offers without store filter', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockOffer]),
      });

      const result = await repository.findActiveOffers();

      expect(result).toEqual([mockOffer]);
    });

    it('should find active offers for specific store', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockOffer]),
      });

      const result = await repository.findActiveOffers(storeId);

      expect(result).toEqual([mockOffer]);
    });
  });

  describe('findByProductId', () => {
    it('should find active offers for product', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockOffer]),
      });

      const result = await repository.findByProductId(productId);

      expect(result).toEqual([mockOffer]);
    });
  });
});
