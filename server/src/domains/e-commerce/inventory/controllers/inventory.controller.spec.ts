import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from '../services/inventory.service';
import { generateObjectId } from '../../../shared/testing';

describe('InventoryController', () => {
  let controller: InventoryController;
  let inventoryService: jest.Mocked<InventoryService>;

  const mockInventoryService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByProduct: jest.fn(),
    update: jest.fn(),
    addStock: jest.fn(),
    removeStock: jest.fn(),
  };

  const mockUser = {
    userId: generateObjectId(),
    profileId: generateObjectId(),
    role: 'store_owner',
  };

  const inventoryId = generateObjectId();
  const productId = generateObjectId();

  const mockInventory = {
    _id: inventoryId,
    productId,
    quantity: 100,
    availableQuantity: 100,
    lowStockThreshold: 10,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        { provide: InventoryService, useValue: mockInventoryService },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
    inventoryService = module.get(InventoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create inventory', async () => {
      const createDto = { productId, quantity: 100 };
      mockInventoryService.create.mockResolvedValue(mockInventory);

      const result = await controller.create(createDto as any, mockUser);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Inventory created successfully');
      expect(result.data).toEqual(mockInventory);
    });
  });

  describe('findAll', () => {
    it('should return paginated inventory', async () => {
      const queryResult = {
        data: [mockInventory],
        total: 1,
        page: 1,
        limit: 20,
      };
      mockInventoryService.findAll.mockResolvedValue(queryResult);

      const result = await controller.findAll({ page: 1, limit: 20 } as any);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockInventory]);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return inventory by id', async () => {
      mockInventoryService.findOne.mockResolvedValue(mockInventory);

      const result = await controller.findOne(inventoryId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockInventory);
    });
  });

  describe('findByProduct', () => {
    it('should return inventory by product', async () => {
      mockInventoryService.findByProduct.mockResolvedValue(mockInventory);

      const result = await controller.findByProduct(productId);

      expect(result.success).toBe(true);
      expect(result.data.availableQuantity).toBe(100);
      expect(result.data.inStock).toBe(true);
    });

    it('should return out of stock when quantity is 0', async () => {
      mockInventoryService.findByProduct.mockResolvedValue({
        ...mockInventory,
        availableQuantity: 0,
      });

      const result = await controller.findByProduct(productId);

      expect(result.data.inStock).toBe(false);
    });
  });

  describe('update', () => {
    it('should update inventory', async () => {
      const updateDto = { lowStockThreshold: 20 };
      const updatedInventory = { ...mockInventory, lowStockThreshold: 20 };
      mockInventoryService.update.mockResolvedValue(updatedInventory);

      const result = await controller.update(
        inventoryId,
        updateDto as any,
        mockUser,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Inventory updated successfully');
    });
  });

  describe('addStock', () => {
    it('should add stock', async () => {
      const movementDto = { quantity: 50, reason: 'Restock' };
      const updatedInventory = { ...mockInventory, quantity: 150 };
      mockInventoryService.addStock.mockResolvedValue(updatedInventory);

      const result = await controller.addStock(
        inventoryId,
        movementDto as any,
        mockUser,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Stock added successfully');
    });
  });

  describe('removeStock', () => {
    it('should remove stock', async () => {
      const movementDto = { quantity: 30, reason: 'Sale' };
      const updatedInventory = { ...mockInventory, quantity: 70 };
      mockInventoryService.removeStock.mockResolvedValue(updatedInventory);

      const result = await controller.removeStock(
        inventoryId,
        movementDto as any,
        mockUser,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Stock removed successfully');
    });
  });
});
