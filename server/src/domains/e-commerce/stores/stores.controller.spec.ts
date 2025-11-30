import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { StoresController } from './stores.controller';
import { StoreOwnerProfile } from '../../../database/schemas';
import { generateObjectId } from '../../shared/testing';

describe('StoresController', () => {
  let controller: StoresController;

  const mockStoreModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    countDocuments: jest.fn(),
  };

  const storeId = generateObjectId();

  const mockStore = {
    _id: storeId,
    storeName: 'Test Store',
    storeDescription: 'A test store',
    isStoreActive: true,
    rating: 4.5,
    totalReviews: 100,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoresController],
      providers: [
        {
          provide: getModelToken(StoreOwnerProfile.name),
          useValue: mockStoreModel,
        },
      ],
    }).compile();

    controller = module.get<StoresController>(StoresController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllStores', () => {
    it('should return paginated stores', async () => {
      mockStoreModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockStore]),
      });
      mockStoreModel.countDocuments.mockResolvedValue(1);

      const result = await controller.getAllStores();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockStore]);
      expect(result.total).toBe(1);
    });

    it('should filter by search', async () => {
      mockStoreModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockStore]),
      });
      mockStoreModel.countDocuments.mockResolvedValue(1);

      const result = await controller.getAllStores('1', '10', 'Test');

      expect(result.success).toBe(true);
    });
  });

  describe('getStoreById', () => {
    it('should return store by id', async () => {
      mockStoreModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockStore),
      });

      const result = await controller.getStoreById(storeId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStore);
    });

    it('should throw if store not found', async () => {
      mockStoreModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(controller.getStoreById(storeId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw for invalid id', async () => {
      await expect(controller.getStoreById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllStores with filters', () => {
    beforeEach(() => {
      mockStoreModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockStore]),
      });
      mockStoreModel.countDocuments.mockResolvedValue(1);
    });

    it('should filter by category', async () => {
      const categoryId = generateObjectId();
      const result = await controller.getAllStores(
        undefined,
        undefined,
        undefined,
        categoryId,
      );

      expect(result.success).toBe(true);
    });

    it('should filter by verified true', async () => {
      const result = await controller.getAllStores(
        undefined,
        undefined,
        undefined,
        undefined,
        'true',
      );

      expect(result.success).toBe(true);
    });

    it('should sort by rating', async () => {
      const result = await controller.getAllStores(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        'rating',
      );

      expect(result.success).toBe(true);
    });

    it('should sort by reviews', async () => {
      const result = await controller.getAllStores(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        'reviews',
      );

      expect(result.success).toBe(true);
    });

    it('should sort by sales', async () => {
      const result = await controller.getAllStores(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        'sales',
      );

      expect(result.success).toBe(true);
    });

    it('should sort by name', async () => {
      const result = await controller.getAllStores(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        'name',
      );

      expect(result.success).toBe(true);
    });

    it('should use custom page and limit', async () => {
      const result = await controller.getAllStores('2', '50');

      expect(result.page).toBe(2);
    });

    it('should ignore invalid category id', async () => {
      const result = await controller.getAllStores(
        undefined,
        undefined,
        undefined,
        'invalid-id',
      );

      expect(result.success).toBe(true);
    });
  });
});
