import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InventoryMovementService } from './inventory-movement.service';
import { InventoryRepository } from '../repositories/inventory.repository';
import { Product } from '../../../../database/schemas/product.schema';
import { MovementType } from '../../../../database/schemas/inventory.schema';
import { generateObjectId } from '../../../shared/testing';

describe('InventoryMovementService', () => {
  let service: InventoryMovementService;
  let inventoryRepository: jest.Mocked<InventoryRepository>;
  let productModel: jest.Mocked<any>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockModel = {
    findById: jest.fn(),
  };

  const mockInventoryRepository = {
    getModel: jest.fn().mockReturnValue(mockModel),
  };

  const mockProductModel = {
    findById: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const inventoryId = generateObjectId();
  const productId = generateObjectId();
  const userId = generateObjectId();

  const mockInventory = {
    _id: inventoryId,
    productId,
    quantity: 100,
    availableQuantity: 100,
    lowStockThreshold: 10,
    movements: [],
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryMovementService,
        { provide: InventoryRepository, useValue: mockInventoryRepository },
        { provide: getModelToken(Product.name), useValue: mockProductModel },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<InventoryMovementService>(InventoryMovementService);
    inventoryRepository = module.get(InventoryRepository);
    productModel = module.get(getModelToken(Product.name));
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockInventory.movements = [];
    mockInventory.quantity = 100;
    mockInventory.availableQuantity = 100;
  });

  describe('addStock', () => {
    const movementDto = {
      type: MovementType.IN,
      quantity: 50,
      reason: 'Restock',
    };

    it('should add stock successfully', async () => {
      mockModel.findById.mockResolvedValue(mockInventory);
      mockInventory.save.mockResolvedValue(mockInventory);
      mockProductModel.findById.mockResolvedValue(null);

      const result = await service.addStock(
        inventoryId,
        movementDto as any,
        userId,
      );

      expect(mockInventory.quantity).toBe(150);
      expect(mockInventory.movements.length).toBe(1);
      expect(mockInventory.save).toHaveBeenCalled();
    });

    it('should throw for invalid id', async () => {
      await expect(
        service.addStock('invalid-id', movementDto as any, userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if inventory not found', async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(
        service.addStock(inventoryId, movementDto as any, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw for invalid movement type', async () => {
      mockModel.findById.mockResolvedValue(mockInventory);
      const invalidDto = { ...movementDto, type: MovementType.OUT };

      await expect(
        service.addStock(inventoryId, invalidDto as any, userId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeStock', () => {
    const movementDto = {
      type: MovementType.OUT,
      quantity: 30,
      reason: 'Sale',
    };

    it('should remove stock successfully', async () => {
      mockModel.findById.mockResolvedValue(mockInventory);
      mockInventory.save.mockResolvedValue(mockInventory);
      mockProductModel.findById.mockResolvedValue(null);

      const result = await service.removeStock(
        inventoryId,
        movementDto as any,
        userId,
      );

      expect(mockInventory.quantity).toBe(70);
      expect(mockInventory.movements.length).toBe(1);
    });

    it('should throw if insufficient stock', async () => {
      mockModel.findById.mockResolvedValue({ ...mockInventory, quantity: 10 });

      await expect(
        service.removeStock(inventoryId, movementDto as any, userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw for invalid movement type', async () => {
      mockModel.findById.mockResolvedValue(mockInventory);
      const invalidDto = { ...movementDto, type: MovementType.IN };

      await expect(
        service.removeStock(inventoryId, invalidDto as any, userId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('checkLowStockAlert', () => {
    it('should emit low stock event when below threshold', async () => {
      const lowStockInventory = {
        ...mockInventory,
        availableQuantity: 5,
        lowStockThreshold: 10,
      };

      await service.checkLowStockAlert(lowStockInventory as any);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'inventory.low-stock',
        expect.any(Object),
      );
    });

    it('should not emit event when above threshold', async () => {
      const normalInventory = {
        ...mockInventory,
        availableQuantity: 50,
        lowStockThreshold: 10,
      };

      await service.checkLowStockAlert(normalInventory as any);

      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('updateProductStatus', () => {
    it('should mark product as out of stock when quantity is 0', async () => {
      const mockProduct = { _id: productId, status: 'active', save: jest.fn() };
      mockProductModel.findById.mockResolvedValue(mockProduct);
      const zeroInventory = { ...mockInventory, availableQuantity: 0 };

      await service.updateProductStatus(zeroInventory as any);

      expect(mockProduct.status).toBe('out_of_stock');
      expect(mockProduct.save).toHaveBeenCalled();
    });

    it('should mark product as active when quantity > 0', async () => {
      const mockProduct = {
        _id: productId,
        status: 'out_of_stock',
        save: jest.fn(),
      };
      mockProductModel.findById.mockResolvedValue(mockProduct);
      const stockInventory = { ...mockInventory, availableQuantity: 50 };

      await service.updateProductStatus(stockInventory as any);

      expect(mockProduct.status).toBe('active');
      expect(mockProduct.save).toHaveBeenCalled();
    });
  });
});
