import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { InventoryQueryService } from './inventory-query.service';
import { InventoryRepository } from '../repositories/inventory.repository';

describe('InventoryQueryService', () => {
  let service: InventoryQueryService;
  let inventoryRepository: jest.Mocked<InventoryRepository>;

  const mockInventory = {
    _id: new Types.ObjectId(),
    storeId: new Types.ObjectId(),
    productId: new Types.ObjectId(),
    variantId: new Types.ObjectId(),
    availableQuantity: 100,
    reservedQuantity: 10,
    lowStockThreshold: 20,
  };

  let mockModel: any;

  const createMockModel = () => {
    let populateCount = 0;
    const model: any = {
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockImplementation(() => {
        populateCount++;
        if (populateCount >= 3) {
          populateCount = 0;
          return Promise.resolve([mockInventory]);
        }
        return model;
      }),
    };
    return model;
  };

  beforeEach(async () => {
    mockModel = createMockModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryQueryService,
        {
          provide: InventoryRepository,
          useValue: {
            getModel: jest.fn().mockReturnValue(mockModel),
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InventoryQueryService>(InventoryQueryService);
    inventoryRepository = module.get(InventoryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated inventory', async () => {
      (inventoryRepository.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should filter by storeId', async () => {
      const storeId = new Types.ObjectId().toString();
      (inventoryRepository.count as jest.Mock).mockResolvedValue(1);

      await service.findAll({ storeId, page: 1, limit: 20 });

      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should filter by productId', async () => {
      const productId = new Types.ObjectId().toString();
      (inventoryRepository.count as jest.Mock).mockResolvedValue(1);

      await service.findAll({ productId, page: 1, limit: 20 });

      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should filter lowStock items', async () => {
      (inventoryRepository.count as jest.Mock).mockResolvedValue(1);

      await service.findAll({ lowStock: true, page: 1, limit: 20 });

      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should filter outOfStock items', async () => {
      (inventoryRepository.count as jest.Mock).mockResolvedValue(1);

      await service.findAll({ outOfStock: true, page: 1, limit: 20 });

      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should sort descending', async () => {
      (inventoryRepository.count as jest.Mock).mockResolvedValue(1);

      await service.findAll({
        sortBy: 'availableQuantity',
        sortOrder: 'desc',
        page: 1,
        limit: 20,
      });

      expect(mockModel.sort).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return inventory by id', async () => {
      // Reset populate to return single item
      let populateCount = 0;
      mockModel.populate.mockImplementation(() => {
        populateCount++;
        if (populateCount >= 3) {
          populateCount = 0;
          return Promise.resolve(mockInventory);
        }
        return mockModel;
      });

      const result = await service.findOne(mockInventory._id.toString());

      expect(result).toEqual(mockInventory);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.findOne('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when inventory not found', async () => {
      let populateCount = 0;
      mockModel.populate.mockImplementation(() => {
        populateCount++;
        if (populateCount >= 3) {
          populateCount = 0;
          return Promise.resolve(null);
        }
        return mockModel;
      });

      await expect(
        service.findOne(new Types.ObjectId().toString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByProduct', () => {
    it('should return inventory for product', async () => {
      mockModel.findOne.mockResolvedValue(mockInventory);

      const result = await service.findByProduct(
        mockInventory.productId.toString(),
      );

      expect(result).toEqual(mockInventory);
    });

    it('should return inventory for product with variant', async () => {
      mockModel.findOne.mockResolvedValue(mockInventory);

      const result = await service.findByProduct(
        mockInventory.productId.toString(),
        mockInventory.variantId.toString(),
      );

      expect(result).toEqual(mockInventory);
    });

    it('should throw NotFoundException when inventory not found', async () => {
      mockModel.findOne.mockResolvedValue(null);

      await expect(
        service.findByProduct(new Types.ObjectId().toString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByStore', () => {
    it('should return inventory for store', async () => {
      let populateCount = 0;
      mockModel.populate.mockImplementation(() => {
        populateCount++;
        if (populateCount >= 2) {
          populateCount = 0;
          return Promise.resolve([mockInventory]);
        }
        return mockModel;
      });

      const result = await service.findByStore(
        mockInventory.storeId.toString(),
      );

      expect(result).toHaveLength(1);
      expect(mockModel.find).toHaveBeenCalled();
    });
  });

  describe('getLowStockItems', () => {
    it('should return low stock items for store', async () => {
      mockModel.populate.mockResolvedValue([mockInventory]);

      const result = await service.getLowStockItems(
        mockInventory.storeId.toString(),
      );

      expect(result).toHaveLength(1);
      expect(mockModel.find).toHaveBeenCalled();
    });
  });

  describe('getOutOfStockItems', () => {
    it('should return out of stock items for store', async () => {
      mockModel.populate.mockResolvedValue([mockInventory]);

      const result = await service.getOutOfStockItems(
        mockInventory.storeId.toString(),
      );

      expect(result).toHaveLength(1);
      expect(mockModel.find).toHaveBeenCalled();
    });
  });
});
