import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InventoryReservationService } from './inventory-reservation.service';
import { InventoryRepository } from '../repositories/inventory.repository';
import { generateObjectId } from '../../../shared/testing';

describe('InventoryReservationService', () => {
  let service: InventoryReservationService;
  let inventoryRepository: jest.Mocked<InventoryRepository>;

  const mockInventoryRepository = {
    getModel: jest.fn(),
  };

  const createMockInventory = (overrides = {}) => ({
    _id: generateObjectId(),
    productId: generateObjectId(),
    quantity: 100,
    reservedQuantity: 10,
    availableQuantity: 90,
    save: jest.fn().mockResolvedValue({}),
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryReservationService,
        { provide: InventoryRepository, useValue: mockInventoryRepository },
      ],
    }).compile();

    service = module.get<InventoryReservationService>(
      InventoryReservationService,
    );
    inventoryRepository = module.get(InventoryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('reserveStock', () => {
    it('should reserve stock successfully', async () => {
      const productId = generateObjectId();
      const mockInventory = createMockInventory({
        productId,
        availableQuantity: 50,
      });

      mockInventoryRepository.getModel.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockInventory),
      });

      await service.reserveStock(productId, 10);

      expect(mockInventory.reservedQuantity).toBe(20);
      expect(mockInventory.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when inventory not found', async () => {
      mockInventoryRepository.getModel.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.reserveStock(generateObjectId(), 10),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when insufficient stock', async () => {
      const mockInventory = createMockInventory({ availableQuantity: 5 });

      mockInventoryRepository.getModel.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockInventory),
      });

      await expect(
        service.reserveStock(generateObjectId(), 10),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle variant reservation', async () => {
      const productId = generateObjectId();
      const variantId = generateObjectId();
      const mockInventory = createMockInventory({
        productId,
        variantId,
        availableQuantity: 50,
      });

      mockInventoryRepository.getModel.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockInventory),
      });

      await service.reserveStock(productId, 10, variantId);

      expect(mockInventory.save).toHaveBeenCalled();
    });
  });

  describe('releaseStock', () => {
    it('should release stock successfully', async () => {
      const productId = generateObjectId();
      const mockInventory = createMockInventory({
        productId,
        reservedQuantity: 20,
      });

      mockInventoryRepository.getModel.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockInventory),
      });

      await service.releaseStock(productId, 10);

      expect(mockInventory.reservedQuantity).toBe(10);
      expect(mockInventory.save).toHaveBeenCalled();
    });

    it('should not go below zero when releasing', async () => {
      const mockInventory = createMockInventory({ reservedQuantity: 5 });

      mockInventoryRepository.getModel.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockInventory),
      });

      await service.releaseStock(generateObjectId(), 10);

      expect(mockInventory.reservedQuantity).toBe(0);
    });

    it('should throw NotFoundException when inventory not found', async () => {
      mockInventoryRepository.getModel.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.releaseStock(generateObjectId(), 10),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkAvailability', () => {
    it('should return true when stock is available', async () => {
      const mockInventory = createMockInventory({ availableQuantity: 50 });

      mockInventoryRepository.getModel.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockInventory),
      });

      const result = await service.checkAvailability(generateObjectId(), 10);

      expect(result).toBe(true);
    });

    it('should return false when stock is insufficient', async () => {
      const mockInventory = createMockInventory({ availableQuantity: 5 });

      mockInventoryRepository.getModel.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockInventory),
      });

      const result = await service.checkAvailability(generateObjectId(), 10);

      expect(result).toBe(false);
    });

    it('should return false when inventory not found', async () => {
      mockInventoryRepository.getModel.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(null),
      });

      const result = await service.checkAvailability(generateObjectId(), 10);

      expect(result).toBe(false);
    });
  });

  describe('getAvailableQuantity', () => {
    it('should return available quantity', async () => {
      const mockInventory = createMockInventory({ availableQuantity: 75 });

      mockInventoryRepository.getModel.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockInventory),
      });

      const result = await service.getAvailableQuantity(generateObjectId());

      expect(result).toBe(75);
    });

    it('should return 0 when inventory not found', async () => {
      mockInventoryRepository.getModel.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getAvailableQuantity(generateObjectId());

      expect(result).toBe(0);
    });
  });
});
