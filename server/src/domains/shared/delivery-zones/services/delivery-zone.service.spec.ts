import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DeliveryZoneService } from './delivery-zone.service';
import { DeliveryZoneRepository } from '../repositories/delivery-zone.repository';
import { DeliveryZonePricingService } from './delivery-zone-pricing.service';
import { DeliveryZoneStoreService } from './delivery-zone-store.service';
import { generateObjectId } from '../../testing';
import {
  ZoneType,
  ZoneStatus,
} from '../../../../database/schemas/delivery-zone.schema';

describe('DeliveryZoneService', () => {
  let service: DeliveryZoneService;

  const mockZoneRepo = {
    findByName: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    findByParent: jest.fn(),
    updateStatus: jest.fn(),
    findActiveZones: jest.fn(),
    findZoneTree: jest.fn(),
    findZoneByLocation: jest.fn(),
    findNearbyZones: jest.fn(),
    getZoneStats: jest.fn(),
  };

  const mockPricingService = {
    calculateDeliveryFee: jest.fn(),
    checkStoreCoversZone: jest.fn(),
  };

  const mockStoreService = {
    addStoreToZone: jest.fn(),
    removeStoreFromZone: jest.fn(),
    getStoreZones: jest.fn(),
    getZoneStores: jest.fn(),
    updateStoreZoneSettings: jest.fn(),
  };

  const zoneId = generateObjectId();
  const accountId = generateObjectId();

  const mockZone = {
    _id: zoneId,
    id: zoneId,
    name: 'Damascus',
    nameAr: 'دمشق',
    type: ZoneType.CITY,
    status: ZoneStatus.ACTIVE,
    toObject: () => ({ _id: zoneId, name: 'Damascus' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryZoneService,
        { provide: DeliveryZoneRepository, useValue: mockZoneRepo },
        { provide: DeliveryZonePricingService, useValue: mockPricingService },
        { provide: DeliveryZoneStoreService, useValue: mockStoreService },
      ],
    }).compile();

    service = module.get<DeliveryZoneService>(DeliveryZoneService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createZone', () => {
    it('should create zone successfully', async () => {
      mockZoneRepo.findByName.mockResolvedValue(null);
      mockZoneRepo.create.mockResolvedValue(mockZone);

      const result = await service.createZone(
        { name: 'Damascus', nameAr: 'دمشق', type: ZoneType.CITY } as any,
        accountId,
      );

      expect(result).toEqual(mockZone);
    });

    it('should throw if zone name exists', async () => {
      mockZoneRepo.findByName.mockResolvedValue(mockZone);

      await expect(
        service.createZone({ name: 'Damascus' } as any, accountId),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateZone', () => {
    it('should update zone successfully', async () => {
      mockZoneRepo.findById.mockResolvedValue(mockZone);
      mockZoneRepo.update.mockResolvedValue({ ...mockZone, name: 'Updated' });

      const result = await service.updateZone(
        zoneId,
        { name: 'Damascus' } as any,
        accountId,
      );

      expect(result).toBeDefined();
    });

    it('should throw if zone not found', async () => {
      mockZoneRepo.findById.mockResolvedValue(null);

      await expect(
        service.updateZone(zoneId, {} as any, accountId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteZone', () => {
    it('should delete zone successfully', async () => {
      mockZoneRepo.findById.mockResolvedValue(mockZone);
      mockZoneRepo.findByParent.mockResolvedValue([]);

      await service.deleteZone(zoneId);

      expect(mockZoneRepo.updateStatus).toHaveBeenCalledWith(
        zoneId,
        ZoneStatus.INACTIVE,
      );
    });

    it('should throw if zone has children', async () => {
      mockZoneRepo.findById.mockResolvedValue(mockZone);
      mockZoneRepo.findByParent.mockResolvedValue([mockZone]);

      await expect(service.deleteZone(zoneId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getZone', () => {
    it('should return zone', async () => {
      mockZoneRepo.findById.mockResolvedValue(mockZone);

      const result = await service.getZone(zoneId);

      expect(result).toEqual(mockZone);
    });
  });

  describe('getAllZones', () => {
    it('should return all zones', async () => {
      mockZoneRepo.findActiveZones.mockResolvedValue([mockZone]);

      const result = await service.getAllZones();

      expect(result).toEqual([mockZone]);
    });
  });

  describe('calculateDeliveryFee', () => {
    it('should delegate to pricing service', async () => {
      mockPricingService.calculateDeliveryFee.mockResolvedValue({ fee: 5000 });

      const result = await service.calculateDeliveryFee(
        accountId,
        zoneId,
        50000,
      );

      expect(result).toEqual({ fee: 5000 });
    });
  });

  describe('getZoneTree', () => {
    it('should return zone tree', async () => {
      const parentZone = { ...mockZone, parentZoneId: null };
      const childZone = {
        ...mockZone,
        _id: 'child-id',
        id: 'child-id',
        parentZoneId: zoneId,
        toObject: () => ({ _id: 'child-id', parentZoneId: zoneId }),
      };
      mockZoneRepo.findZoneTree.mockResolvedValue([parentZone, childZone]);

      const result = await service.getZoneTree();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findZoneByLocation', () => {
    it('should find zone by location', async () => {
      mockZoneRepo.findZoneByLocation.mockResolvedValue(mockZone);

      const result = await service.findZoneByLocation(36.2765, 33.5138);

      expect(result).toEqual(mockZone);
    });
  });

  describe('findNearbyZones', () => {
    it('should find nearby zones', async () => {
      mockZoneRepo.findNearbyZones.mockResolvedValue([mockZone]);

      const result = await service.findNearbyZones(36.2765, 33.5138, 5000);

      expect(result).toEqual([mockZone]);
    });
  });

  describe('store zone management', () => {
    it('should add store to zone', async () => {
      mockStoreService.addStoreToZone.mockResolvedValue({
        storeAccountId: accountId,
        zoneId,
      });

      const result = await service.addStoreToZone(accountId, { zoneId } as any);

      expect(result).toBeDefined();
    });

    it('should remove store from zone', async () => {
      mockStoreService.removeStoreFromZone.mockResolvedValue(undefined);

      await service.removeStoreFromZone(accountId, zoneId);

      expect(mockStoreService.removeStoreFromZone).toHaveBeenCalledWith(
        accountId,
        zoneId,
      );
    });

    it('should get store zones', async () => {
      mockStoreService.getStoreZones.mockResolvedValue([{ zoneId }]);

      const result = await service.getStoreZones(accountId);

      expect(result).toEqual([{ zoneId }]);
    });

    it('should get zone stores', async () => {
      mockStoreService.getZoneStores.mockResolvedValue([
        { storeAccountId: accountId },
      ]);

      const result = await service.getZoneStores(zoneId);

      expect(result).toEqual([{ storeAccountId: accountId }]);
    });

    it('should update store zone settings', async () => {
      mockStoreService.updateStoreZoneSettings.mockResolvedValue({
        storeAccountId: accountId,
        zoneId,
      });

      const result = await service.updateStoreZoneSettings(accountId, zoneId, {
        deliveryFee: 5000,
      } as any);

      expect(result).toBeDefined();
    });
  });

  describe('checkStoreCoversZone', () => {
    it('should check if store covers zone', async () => {
      mockPricingService.checkStoreCoversZone.mockResolvedValue(true);

      const result = await service.checkStoreCoversZone(accountId, zoneId);

      expect(result).toBe(true);
    });
  });

  describe('getZoneStats', () => {
    it('should return zone stats', async () => {
      mockZoneRepo.getZoneStats.mockResolvedValue({
        totalZones: 10,
        activeZones: 8,
      });

      const result = await service.getZoneStats();

      expect(result).toEqual({ totalZones: 10, activeZones: 8 });
    });
  });

  describe('createZone with coordinates', () => {
    it('should create zone with polygon coordinates', async () => {
      mockZoneRepo.findByName.mockResolvedValue(null);
      mockZoneRepo.create.mockResolvedValue(mockZone);

      const coordinates = [
        [
          [36.0, 33.0],
          [36.5, 33.0],
          [36.5, 33.5],
          [36.0, 33.5],
          [36.0, 33.0],
        ],
      ];
      const result = await service.createZone(
        {
          name: 'Test',
          nameAr: 'اختبار',
          type: ZoneType.CITY,
          coordinates,
        } as any,
        accountId,
      );

      expect(result).toBeDefined();
      expect(mockZoneRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          polygon: { type: 'Polygon', coordinates },
        }),
      );
    });
  });

  describe('updateZone with name conflict', () => {
    it('should throw if new name conflicts with existing zone', async () => {
      mockZoneRepo.findById.mockResolvedValue(mockZone);
      mockZoneRepo.findByName.mockResolvedValue({
        ...mockZone,
        _id: 'other-id',
      });

      await expect(
        service.updateZone(zoneId, { name: 'Existing Name' } as any, accountId),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateZone with coordinates', () => {
    it('should update zone with polygon coordinates', async () => {
      mockZoneRepo.findById.mockResolvedValue(mockZone);
      mockZoneRepo.update.mockResolvedValue(mockZone);

      const coordinates = [
        [
          [36.0, 33.0],
          [36.5, 33.0],
          [36.5, 33.5],
          [36.0, 33.5],
          [36.0, 33.0],
        ],
      ];
      await service.updateZone(zoneId, { coordinates } as any, accountId);

      expect(mockZoneRepo.update).toHaveBeenCalledWith(
        zoneId,
        expect.objectContaining({
          polygon: { type: 'Polygon', coordinates },
        }),
      );
    });

    it('should throw if update returns null', async () => {
      mockZoneRepo.findById.mockResolvedValue(mockZone);
      mockZoneRepo.update.mockResolvedValue(null);

      await expect(
        service.updateZone(zoneId, {} as any, accountId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteZone not found', () => {
    it('should throw if zone not found', async () => {
      mockZoneRepo.findById.mockResolvedValue(null);

      await expect(service.deleteZone(zoneId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getZone not found', () => {
    it('should throw if zone not found', async () => {
      mockZoneRepo.findById.mockResolvedValue(null);

      await expect(service.getZone(zoneId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllZones with type filter', () => {
    it('should filter zones by type', async () => {
      mockZoneRepo.findActiveZones.mockResolvedValue([mockZone]);

      const result = await service.getAllZones(ZoneType.CITY);

      expect(mockZoneRepo.findActiveZones).toHaveBeenCalledWith(ZoneType.CITY);
    });
  });

  describe('findNearbyZones with default distance', () => {
    it('should use default distance when not provided', async () => {
      mockZoneRepo.findNearbyZones.mockResolvedValue([mockZone]);

      await service.findNearbyZones(36.2765, 33.5138);

      expect(mockZoneRepo.findNearbyZones).toHaveBeenCalledWith(
        36.2765,
        33.5138,
        10000,
      );
    });
  });

  describe('getZoneTree with orphan child', () => {
    it('should handle child zone with missing parent', async () => {
      const orphanChild = {
        ...mockZone,
        _id: 'orphan-id',
        id: 'orphan-id',
        parentZoneId: 'non-existent-parent',
        toObject: () => ({
          _id: 'orphan-id',
          parentZoneId: 'non-existent-parent',
        }),
      };
      mockZoneRepo.findZoneTree.mockResolvedValue([orphanChild]);

      const result = await service.getZoneTree();

      expect(result.length).toBe(1);
    });
  });

  describe('createZone with empty coordinates', () => {
    it('should create zone without polygon when coordinates empty', async () => {
      mockZoneRepo.findByName.mockResolvedValue(null);
      mockZoneRepo.create.mockResolvedValue(mockZone);

      await service.createZone(
        {
          name: 'Test',
          nameAr: 'اختبار',
          type: ZoneType.CITY,
          coordinates: [],
        } as any,
        accountId,
      );

      expect(mockZoneRepo.create).toHaveBeenCalledWith(
        expect.not.objectContaining({
          polygon: expect.anything(),
        }),
      );
    });
  });
});
