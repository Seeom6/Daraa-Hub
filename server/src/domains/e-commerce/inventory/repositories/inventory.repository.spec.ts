import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { InventoryRepository } from './inventory.repository';
import { Inventory } from '../../../../database/schemas/inventory.schema';
import { MockModelFactory, generateObjectId } from '../../../shared/testing';
import { FakerDataFactory } from '../../../shared/testing/mock-data.factory';

describe('InventoryRepository', () => {
  let repository: InventoryRepository;
  let mockModel: any;

  beforeEach(async () => {
    mockModel = MockModelFactory.create();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryRepository,
        {
          provide: getModelToken(Inventory.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<InventoryRepository>(InventoryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByProductId', () => {
    it('should find inventory by product id', async () => {
      const productId = generateObjectId();
      const mockInventory = FakerDataFactory.createInventory({ productId });
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInventory),
      });

      const result = await repository.findByProductId(productId);

      expect(result).toEqual(mockInventory);
    });

    it('should return null if inventory not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findByProductId(generateObjectId());

      expect(result).toBeNull();
    });
  });

  describe('findByVariantId', () => {
    it('should find inventory by variant id', async () => {
      const variantId = generateObjectId();
      const mockInventory = FakerDataFactory.createInventory({ variantId });
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInventory),
      });

      const result = await repository.findByVariantId(variantId);

      expect(result).toEqual(mockInventory);
    });
  });

  describe('updateStock', () => {
    it('should add stock', async () => {
      const inventoryId = generateObjectId();
      const mockInventory = {
        ...FakerDataFactory.createInventory({ quantity: 50 }),
        save: jest.fn().mockResolvedValue({ quantity: 60 }),
      };
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInventory),
      });

      const result = await repository.updateStock(inventoryId, 10, 'add');

      expect(mockInventory.save).toHaveBeenCalled();
    });

    it('should subtract stock', async () => {
      const inventoryId = generateObjectId();
      const mockInventory = {
        ...FakerDataFactory.createInventory({ quantity: 50 }),
        save: jest.fn().mockResolvedValue({ quantity: 40 }),
      };
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInventory),
      });

      const result = await repository.updateStock(inventoryId, 10, 'subtract');

      expect(mockInventory.save).toHaveBeenCalled();
    });

    it('should return null if inventory not found', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.updateStock(
        generateObjectId(),
        10,
        'add',
      );

      expect(result).toBeNull();
    });
  });

  describe('reserveStock', () => {
    it('should reserve stock', async () => {
      const inventoryId = generateObjectId();
      const mockInventory = FakerDataFactory.createInventory();
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInventory),
      });

      const result = await repository.reserveStock(inventoryId, 5);

      expect(result).toBeDefined();
    });
  });

  describe('getLowStockItems', () => {
    it('should get low stock items', async () => {
      const storeId = generateObjectId();
      const mockItems = [FakerDataFactory.createInventory({ quantity: 5 })];
      mockModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockItems),
          }),
        }),
      });

      const result = await repository.getLowStockItems(storeId, 10);

      expect(result).toHaveLength(1);
    });
  });

  describe('checkAvailability', () => {
    it('should return true if stock is available', async () => {
      const productId = generateObjectId();
      const mockInventory = FakerDataFactory.createInventory({ quantity: 50 });
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInventory),
      });

      const result = await repository.checkAvailability(productId, 10);

      expect(result).toBe(true);
    });

    it('should return false if stock is not available', async () => {
      const productId = generateObjectId();
      const mockInventory = FakerDataFactory.createInventory({ quantity: 5 });
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInventory),
      });

      const result = await repository.checkAvailability(productId, 10);

      expect(result).toBe(false);
    });

    it('should return false if inventory not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.checkAvailability(generateObjectId(), 10);

      expect(result).toBe(false);
    });
  });
});
