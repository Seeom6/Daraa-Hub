import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DeliveryZonePricingService } from './delivery-zone-pricing.service';
import { DeliveryZoneRepository } from '../repositories/delivery-zone.repository';
import { StoreDeliveryZoneRepository } from '../repositories/store-delivery-zone.repository';
import { generateObjectId } from '../../testing';

describe('DeliveryZonePricingService', () => {
  let service: DeliveryZonePricingService;
  let mockZoneRepo: any;
  let mockStoreZoneRepo: any;

  const storeAccountId = generateObjectId();
  const zoneId = generateObjectId();

  const mockZone = {
    _id: zoneId,
    name: 'Zone 1',
    deliveryFee: 500,
    freeDeliveryThreshold: 5000,
    minOrderAmount: 1000,
    estimatedDeliveryTimeMin: 30,
    estimatedDeliveryTimeMax: 60,
  };

  const mockStoreZone = {
    storeAccountId,
    zoneId,
    customDeliveryFee: 400,
    customFreeDeliveryThreshold: 4000,
    customMinOrderAmount: 800,
    customDeliveryTimeMin: 25,
    customDeliveryTimeMax: 50,
    isActive: true,
  };

  beforeEach(async () => {
    mockZoneRepo = {
      findById: jest.fn().mockResolvedValue(mockZone),
    };

    mockStoreZoneRepo = {
      findStoreZone: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryZonePricingService,
        { provide: DeliveryZoneRepository, useValue: mockZoneRepo },
        { provide: StoreDeliveryZoneRepository, useValue: mockStoreZoneRepo },
      ],
    }).compile();

    service = module.get<DeliveryZonePricingService>(
      DeliveryZonePricingService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateDeliveryFee', () => {
    it('should calculate fee using zone defaults', async () => {
      const result = await service.calculateDeliveryFee(
        storeAccountId,
        zoneId,
        2000,
      );

      expect(result.fee).toBe(500);
      expect(result.isFree).toBe(false);
      expect(result.estimatedTimeMin).toBe(30);
    });

    it('should use store-specific overrides', async () => {
      mockStoreZoneRepo.findStoreZone.mockResolvedValue(mockStoreZone);

      const result = await service.calculateDeliveryFee(
        storeAccountId,
        zoneId,
        2000,
      );

      expect(result.fee).toBe(400);
      expect(result.estimatedTimeMin).toBe(25);
    });

    it('should return free delivery when threshold met', async () => {
      const result = await service.calculateDeliveryFee(
        storeAccountId,
        zoneId,
        6000,
      );

      expect(result.fee).toBe(0);
      expect(result.isFree).toBe(true);
    });

    it('should throw NotFoundException if zone not found', async () => {
      mockZoneRepo.findById.mockResolvedValue(null);

      await expect(
        service.calculateDeliveryFee(storeAccountId, zoneId, 2000),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if below minimum order', async () => {
      await expect(
        service.calculateDeliveryFee(storeAccountId, zoneId, 500),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('checkStoreCoversZone', () => {
    it('should return true if store covers zone', async () => {
      mockStoreZoneRepo.findStoreZone.mockResolvedValue(mockStoreZone);

      const result = await service.checkStoreCoversZone(storeAccountId, zoneId);

      expect(result).toBe(true);
    });

    it('should return false if store does not cover zone', async () => {
      mockStoreZoneRepo.findStoreZone.mockResolvedValue(null);

      const result = await service.checkStoreCoversZone(storeAccountId, zoneId);

      expect(result).toBe(false);
    });

    it('should return false if store zone is inactive', async () => {
      mockStoreZoneRepo.findStoreZone.mockResolvedValue({
        ...mockStoreZone,
        isActive: false,
      });

      const result = await service.checkStoreCoversZone(storeAccountId, zoneId);

      expect(result).toBe(false);
    });
  });
});
