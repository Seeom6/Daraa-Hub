import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { StoreCategoryStatisticsService } from './store-category-statistics.service';
import { StoreCategory } from '../../../../database/schemas/store-category.schema';
import { StoreOwnerProfile } from '../../../../database/schemas/store-owner-profile.schema';
import { generateObjectId } from '../../testing';

describe('StoreCategoryStatisticsService', () => {
  let service: StoreCategoryStatisticsService;
  let mockCategoryModel: any;
  let mockStoreProfileModel: any;

  const categoryId = generateObjectId();
  const mockCategory = {
    _id: categoryId,
    name: 'Electronics',
    storeCount: 5,
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    mockCategoryModel = {
      find: jest.fn().mockResolvedValue([mockCategory]),
      findByIdAndUpdate: jest.fn().mockResolvedValue(mockCategory),
    };

    mockStoreProfileModel = {
      countDocuments: jest.fn().mockResolvedValue(10),
      find: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          {
            products: [1, 2, 3],
            totalOrders: 100,
            rating: 4.5,
            totalSales: 5000,
          },
        ]),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreCategoryStatisticsService,
        {
          provide: getModelToken(StoreCategory.name),
          useValue: mockCategoryModel,
        },
        {
          provide: getModelToken(StoreOwnerProfile.name),
          useValue: mockStoreProfileModel,
        },
      ],
    }).compile();

    service = module.get<StoreCategoryStatisticsService>(
      StoreCategoryStatisticsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateStoreCount', () => {
    it('should update store count', async () => {
      await service.updateStoreCount(categoryId, 1);

      expect(mockCategoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
        categoryId,
        { $inc: { storeCount: 1 } },
        { new: true },
      );
    });

    it('should skip invalid category id', async () => {
      await service.updateStoreCount('invalid', 1);

      expect(mockCategoryModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('recalculateStoreCounts', () => {
    it('should recalculate store counts for all categories', async () => {
      await service.recalculateStoreCounts();

      expect(mockStoreProfileModel.countDocuments).toHaveBeenCalled();
      expect(mockCategory.save).toHaveBeenCalled();
    });
  });

  describe('recalculateStatistics', () => {
    it('should recalculate statistics for all categories', async () => {
      await service.recalculateStatistics();

      expect(mockCategoryModel.find).toHaveBeenCalled();
      expect(mockCategoryModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('updateCategoryStatistics', () => {
    it('should update category statistics', async () => {
      await service.updateCategoryStatistics(categoryId);

      expect(mockStoreProfileModel.find).toHaveBeenCalled();
      expect(mockCategoryModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should skip invalid category id', async () => {
      await service.updateCategoryStatistics('invalid');

      expect(mockStoreProfileModel.find).not.toHaveBeenCalled();
    });
  });
});
