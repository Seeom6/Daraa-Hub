import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { InventoryService } from './inventory.service';
import { InventoryRepository } from '../repositories/inventory.repository';
import { InventoryMovementService } from './inventory-movement.service';
import { InventoryReservationService } from './inventory-reservation.service';
import { InventoryQueryService } from './inventory-query.service';
import { Product } from '../../../../database/schemas/product.schema';
import { generateObjectId } from '../../../shared/testing';

describe('InventoryService', () => {
  let service: InventoryService;

  const mockInventoryModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
  };

  const mockInventoryRepository = {
    getModel: jest.fn().mockReturnValue(mockInventoryModel),
  };

  const mockProductModel = {
    findById: jest.fn(),
  };

  const mockMovementService = {
    addStock: jest.fn(),
    removeStock: jest.fn(),
    checkLowStockAlert: jest.fn(),
    updateProductStatus: jest.fn(),
  };

  const mockReservationService = {
    reserveStock: jest.fn(),
    releaseStock: jest.fn(),
    checkAvailability: jest.fn(),
  };

  const mockQueryService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByProduct: jest.fn(),
  };

  const inventoryId = generateObjectId();
  const productId = generateObjectId();
  const storeId = generateObjectId();
  const userId = generateObjectId();

  const mockInventory = {
    _id: inventoryId,
    productId,
    storeId,
    quantity: 100,
    availableQuantity: 100,
    movements: [],
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: InventoryRepository, useValue: mockInventoryRepository },
        { provide: getModelToken(Product.name), useValue: mockProductModel },
        { provide: InventoryMovementService, useValue: mockMovementService },
        {
          provide: InventoryReservationService,
          useValue: mockReservationService,
        },
        { provide: InventoryQueryService, useValue: mockQueryService },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw if inventory already exists', async () => {
      mockInventoryModel.findOne.mockResolvedValue(mockInventory);

      await expect(
        service.create({ productId, storeId, quantity: 100 } as any, userId),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw if product not found', async () => {
      mockInventoryModel.findOne.mockResolvedValue(null);
      mockProductModel.findById.mockResolvedValue(null);

      await expect(
        service.create({ productId, storeId, quantity: 100 } as any, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create inventory successfully', async () => {
      const mockProduct = { _id: productId, status: 'active', save: jest.fn() };
      const savedInventory = {
        ...mockInventory,
        save: jest.fn().mockResolvedValue(mockInventory),
      };

      mockInventoryModel.findOne.mockResolvedValue(null);
      mockProductModel.findById.mockResolvedValue(mockProduct);

      // Mock the constructor
      const MockInventoryModel = jest
        .fn()
        .mockImplementation(() => savedInventory);
      mockInventoryRepository.getModel.mockReturnValue({
        ...mockInventoryModel,
        ...MockInventoryModel,
      });
      mockInventoryRepository.getModel.mockReturnValue(
        Object.assign(MockInventoryModel, mockInventoryModel),
      );

      const result = await service.create(
        { productId, storeId, quantity: 100 } as any,
        userId,
      );

      expect(result).toBeDefined();
    });

    it('should create inventory with variantId', async () => {
      const variantId = generateObjectId();
      const mockProduct = { _id: productId, status: 'active', save: jest.fn() };
      const savedInventory = {
        ...mockInventory,
        variantId,
        save: jest.fn().mockResolvedValue(mockInventory),
      };

      mockInventoryModel.findOne.mockResolvedValue(null);
      mockProductModel.findById.mockResolvedValue(mockProduct);

      const MockInventoryModel = jest
        .fn()
        .mockImplementation(() => savedInventory);
      mockInventoryRepository.getModel.mockReturnValue(
        Object.assign(MockInventoryModel, mockInventoryModel),
      );

      const result = await service.create(
        { productId, storeId, variantId, quantity: 100 } as any,
        userId,
      );

      expect(result).toBeDefined();
    });

    it('should update product status if out of stock', async () => {
      const mockProduct = {
        _id: productId,
        status: 'out_of_stock',
        save: jest.fn(),
      };
      const savedInventory = {
        ...mockInventory,
        availableQuantity: 100,
        save: jest
          .fn()
          .mockResolvedValue({ ...mockInventory, availableQuantity: 100 }),
      };

      mockInventoryModel.findOne.mockResolvedValue(null);
      mockProductModel.findById.mockResolvedValue(mockProduct);

      const MockInventoryModel = jest
        .fn()
        .mockImplementation(() => savedInventory);
      mockInventoryRepository.getModel.mockReturnValue(
        Object.assign(MockInventoryModel, mockInventoryModel),
      );

      await service.create(
        { productId, storeId, quantity: 100 } as any,
        userId,
      );

      expect(mockProduct.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findAll.mockResolvedValue({
        data: [mockInventory],
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await service.findAll({});

      expect(result.data).toEqual([mockInventory]);
    });
  });

  describe('findOne', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findOne.mockResolvedValue(mockInventory);

      const result = await service.findOne(inventoryId);

      expect(result).toEqual(mockInventory);
    });
  });

  describe('addStock', () => {
    it('should delegate to movement service', async () => {
      mockMovementService.addStock.mockResolvedValue({
        ...mockInventory,
        quantity: 150,
      });

      const result = await service.addStock(
        inventoryId,
        { quantity: 50, reason: 'Restock' } as any,
        userId,
      );

      expect(result.quantity).toBe(150);
    });
  });

  describe('reserveStock', () => {
    it('should delegate to reservation service', async () => {
      mockReservationService.reserveStock.mockResolvedValue(undefined);

      await service.reserveStock(productId, 10);

      expect(mockReservationService.reserveStock).toHaveBeenCalledWith(
        productId,
        10,
        undefined,
      );
    });
  });

  describe('checkAvailability', () => {
    it('should delegate to reservation service', async () => {
      mockReservationService.checkAvailability.mockResolvedValue(true);

      const result = await service.checkAvailability(productId, 10);

      expect(result).toBe(true);
    });
  });

  describe('update', () => {
    it('should throw BadRequestException for invalid id', async () => {
      const { BadRequestException } = require('@nestjs/common');
      await expect(
        service.update('invalid', { quantity: 50 } as any, userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when inventory not found', async () => {
      mockInventoryModel.findById.mockResolvedValue(null);

      await expect(
        service.update(inventoryId, { quantity: 50 } as any, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update inventory successfully', async () => {
      const inventory = {
        ...mockInventory,
        movements: [],
        save: jest.fn().mockResolvedValue(mockInventory),
      };
      mockInventoryModel.findById.mockResolvedValue(inventory);
      mockMovementService.checkLowStockAlert.mockResolvedValue(undefined);
      mockMovementService.updateProductStatus.mockResolvedValue(undefined);

      const result = await service.update(
        inventoryId,
        { lowStockThreshold: 10 } as any,
        userId,
      );

      expect(inventory.save).toHaveBeenCalled();
    });

    it('should add movement when quantity changes (increase)', async () => {
      const inventory = {
        ...mockInventory,
        quantity: 100,
        movements: [],
        save: jest.fn().mockResolvedValue(mockInventory),
      };
      mockInventoryModel.findById.mockResolvedValue(inventory);
      mockMovementService.checkLowStockAlert.mockResolvedValue(undefined);
      mockMovementService.updateProductStatus.mockResolvedValue(undefined);

      await service.update(inventoryId, { quantity: 150 } as any, userId);

      expect(inventory.movements.length).toBe(1);
      expect(inventory.movements[0].type).toBe('in');
    });

    it('should add movement when quantity changes (decrease)', async () => {
      const inventory = {
        ...mockInventory,
        quantity: 100,
        movements: [],
        save: jest.fn().mockResolvedValue(mockInventory),
      };
      mockInventoryModel.findById.mockResolvedValue(inventory);
      mockMovementService.checkLowStockAlert.mockResolvedValue(undefined);
      mockMovementService.updateProductStatus.mockResolvedValue(undefined);

      await service.update(inventoryId, { quantity: 50 } as any, userId);

      expect(inventory.movements.length).toBe(1);
      expect(inventory.movements[0].type).toBe('adjustment');
    });
  });

  describe('removeStock', () => {
    it('should delegate to movement service', async () => {
      mockMovementService.removeStock.mockResolvedValue({
        ...mockInventory,
        quantity: 50,
      });

      const result = await service.removeStock(
        inventoryId,
        { quantity: 50, reason: 'Sold' } as any,
        userId,
      );

      expect(result.quantity).toBe(50);
      expect(mockMovementService.removeStock).toHaveBeenCalledWith(
        inventoryId,
        { quantity: 50, reason: 'Sold' },
        userId,
      );
    });
  });

  describe('releaseStock', () => {
    it('should delegate to reservation service', async () => {
      mockReservationService.releaseStock.mockResolvedValue(undefined);

      await service.releaseStock(productId, 10);

      expect(mockReservationService.releaseStock).toHaveBeenCalledWith(
        productId,
        10,
        undefined,
      );
    });

    it('should delegate to reservation service with variantId', async () => {
      const variantId = generateObjectId();
      mockReservationService.releaseStock.mockResolvedValue(undefined);

      await service.releaseStock(productId, 10, variantId);

      expect(mockReservationService.releaseStock).toHaveBeenCalledWith(
        productId,
        10,
        variantId,
      );
    });
  });

  describe('findByProduct', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findByProduct.mockResolvedValue(mockInventory);

      const result = await service.findByProduct(productId);

      expect(result).toEqual(mockInventory);
      expect(mockQueryService.findByProduct).toHaveBeenCalledWith(
        productId,
        undefined,
      );
    });

    it('should delegate to query service with variantId', async () => {
      const variantId = generateObjectId();
      mockQueryService.findByProduct.mockResolvedValue(mockInventory);

      const result = await service.findByProduct(productId, variantId);

      expect(result).toEqual(mockInventory);
      expect(mockQueryService.findByProduct).toHaveBeenCalledWith(
        productId,
        variantId,
      );
    });
  });

  describe('reserveStock with variantId', () => {
    it('should delegate to reservation service with variantId', async () => {
      const variantId = generateObjectId();
      mockReservationService.reserveStock.mockResolvedValue(undefined);

      await service.reserveStock(productId, 10, variantId);

      expect(mockReservationService.reserveStock).toHaveBeenCalledWith(
        productId,
        10,
        variantId,
      );
    });
  });

  describe('checkAvailability with variantId', () => {
    it('should delegate to reservation service with variantId', async () => {
      const variantId = generateObjectId();
      mockReservationService.checkAvailability.mockResolvedValue(true);

      const result = await service.checkAvailability(productId, 10, variantId);

      expect(result).toBe(true);
      expect(mockReservationService.checkAvailability).toHaveBeenCalledWith(
        productId,
        10,
        variantId,
      );
    });
  });
});
