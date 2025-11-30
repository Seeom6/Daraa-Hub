import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeliveryZoneStoreService } from './delivery-zone-store.service';
import { DeliveryZoneRepository } from '../repositories/delivery-zone.repository';
import { StoreDeliveryZoneRepository } from '../repositories/store-delivery-zone.repository';
import { ZoneStatus } from '../../../../database/schemas/delivery-zone.schema';
import { generateObjectId } from '../../testing';

describe('DeliveryZoneStoreService', () => {
  let service: DeliveryZoneStoreService;
  let mockZoneRepo: any;
  let mockStoreZoneRepo: any;

  const storeAccountId = generateObjectId();
  const zoneId = generateObjectId();

  const mockZone = {
    _id: zoneId,
    name: 'Zone 1',
    status: ZoneStatus.ACTIVE,
  };

  const mockStoreZone = {
    storeAccountId,
    zoneId,
    isActive: true,
    customDeliveryFee: 400,
  };

  beforeEach(async () => {
    mockZoneRepo = {
      findById: jest.fn().mockResolvedValue(mockZone),
      incrementStats: jest.fn().mockResolvedValue(true),
    };

    mockStoreZoneRepo = {
      addStoreToZone: jest.fn().mockResolvedValue(mockStoreZone),
      removeStoreFromZone: jest.fn().mockResolvedValue(true),
      findActiveByStore: jest.fn().mockResolvedValue([mockStoreZone]),
      findByZone: jest.fn().mockResolvedValue([mockStoreZone]),
      updateStoreZoneSettings: jest.fn().mockResolvedValue(mockStoreZone),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryZoneStoreService,
        { provide: DeliveryZoneRepository, useValue: mockZoneRepo },
        { provide: StoreDeliveryZoneRepository, useValue: mockStoreZoneRepo },
      ],
    }).compile();

    service = module.get<DeliveryZoneStoreService>(DeliveryZoneStoreService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addStoreToZone', () => {
    it('should add store to zone', async () => {
      const result = await service.addStoreToZone(storeAccountId, { zoneId });

      expect(result).toEqual(mockStoreZone);
      expect(mockZoneRepo.incrementStats).toHaveBeenCalledWith(
        zoneId,
        'activeStores',
        1,
      );
    });

    it('should throw NotFoundException if zone not found', async () => {
      mockZoneRepo.findById.mockResolvedValue(null);

      await expect(
        service.addStoreToZone(storeAccountId, { zoneId }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if zone inactive', async () => {
      mockZoneRepo.findById.mockResolvedValue({
        ...mockZone,
        status: ZoneStatus.INACTIVE,
      });

      await expect(
        service.addStoreToZone(storeAccountId, { zoneId }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeStoreFromZone', () => {
    it('should remove store from zone', async () => {
      await service.removeStoreFromZone(storeAccountId, zoneId);

      expect(mockStoreZoneRepo.removeStoreFromZone).toHaveBeenCalledWith(
        storeAccountId,
        zoneId,
      );
      expect(mockZoneRepo.incrementStats).toHaveBeenCalledWith(
        zoneId,
        'activeStores',
        -1,
      );
    });

    it('should not decrement stats if not removed', async () => {
      mockStoreZoneRepo.removeStoreFromZone.mockResolvedValue(false);

      await service.removeStoreFromZone(storeAccountId, zoneId);

      expect(mockZoneRepo.incrementStats).not.toHaveBeenCalled();
    });
  });

  describe('getStoreZones', () => {
    it('should return store zones', async () => {
      const result = await service.getStoreZones(storeAccountId);

      expect(result).toEqual([mockStoreZone]);
    });
  });

  describe('getZoneStores', () => {
    it('should return zone stores', async () => {
      const result = await service.getZoneStores(zoneId);

      expect(result).toEqual([mockStoreZone]);
    });
  });

  describe('updateStoreZoneSettings', () => {
    it('should update store zone settings', async () => {
      const result = await service.updateStoreZoneSettings(
        storeAccountId,
        zoneId,
        { customDeliveryFee: 500 },
      );

      expect(result).toEqual(mockStoreZone);
    });

    it('should throw NotFoundException if not found', async () => {
      mockStoreZoneRepo.updateStoreZoneSettings.mockResolvedValue(null);

      await expect(
        service.updateStoreZoneSettings(storeAccountId, zoneId, {}),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
