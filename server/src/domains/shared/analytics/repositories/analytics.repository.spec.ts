import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  ProductAnalyticsRepository,
  StoreAnalyticsRepository,
} from './analytics.repository';
import { ProductAnalytics } from '../../../../database/schemas/product-analytics.schema';
import { StoreAnalytics } from '../../../../database/schemas/store-analytics.schema';
import { MockModelFactory, generateObjectId } from '../../testing';

describe('ProductAnalyticsRepository', () => {
  let repository: ProductAnalyticsRepository;
  let mockModel: any;

  const productId = generateObjectId();
  const mockAnalytics = { _id: generateObjectId(), productId, views: 100 };

  beforeEach(async () => {
    mockModel = MockModelFactory.create([mockAnalytics]);
    mockModel.findOneAndUpdate = jest.fn().mockResolvedValue(mockAnalytics);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductAnalyticsRepository,
        { provide: getModelToken(ProductAnalytics.name), useValue: mockModel },
      ],
    }).compile();

    repository = module.get<ProductAnalyticsRepository>(
      ProductAnalyticsRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByProductId', () => {
    it('should find analytics by product ID', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAnalytics),
      });

      const result = await repository.findByProductId(productId);

      expect(result).toEqual(mockAnalytics);
    });
  });

  describe('incrementViews', () => {
    it('should increment view count', async () => {
      const result = await repository.incrementViews(productId);

      expect(mockModel.findOneAndUpdate).toHaveBeenCalled();
      expect(result).toEqual(mockAnalytics);
    });
  });

  describe('incrementAddToCart', () => {
    it('should increment add to cart count', async () => {
      const result = await repository.incrementAddToCart(productId);

      expect(mockModel.findOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe('incrementPurchases', () => {
    it('should increment purchase count', async () => {
      const result = await repository.incrementPurchases(productId, 2);

      expect(mockModel.findOneAndUpdate).toHaveBeenCalled();
    });
  });
});

describe('StoreAnalyticsRepository', () => {
  let repository: StoreAnalyticsRepository;
  let mockModel: any;

  const storeId = generateObjectId();
  const mockAnalytics = {
    _id: generateObjectId(),
    storeId,
    totalRevenue: 50000,
  };

  beforeEach(async () => {
    mockModel = MockModelFactory.create([mockAnalytics]);
    mockModel.findOneAndUpdate = jest.fn().mockResolvedValue(mockAnalytics);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreAnalyticsRepository,
        { provide: getModelToken(StoreAnalytics.name), useValue: mockModel },
      ],
    }).compile();

    repository = module.get<StoreAnalyticsRepository>(StoreAnalyticsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByStoreId', () => {
    it('should find analytics by store ID', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAnalytics),
      });

      const result = await repository.findByStoreId(storeId);

      expect(result).toEqual(mockAnalytics);
    });
  });

  describe('updateRevenue', () => {
    it('should update revenue', async () => {
      const result = await repository.updateRevenue(storeId, 1000);

      expect(mockModel.findOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe('incrementOrders', () => {
    it('should increment order count', async () => {
      const result = await repository.incrementOrders(storeId);

      expect(mockModel.findOneAndUpdate).toHaveBeenCalled();
    });
  });
});
